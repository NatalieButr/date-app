-- T-02: initial schema — tables, indexes, views, RLS policies, RPCs
-- Apply via Supabase dashboard SQL editor or: npx supabase login && npx supabase db push

create extension if not exists vector;

-- ─── Tables ──────────────────────────────────────────────────────────────────

create table profiles (
  id            uuid primary key references auth.users on delete cascade,
  name          text not null,
  age           int  not null check (age between 18 and 99),
  gender        text not null,
  looking_for   text[] not null,
  city          text not null,
  bio           text,
  interests     text[] not null default '{}',
  values        text[] not null default '{}',
  seeking       text,
  red_flags     text[] not null default '{}',
  avatar_url    text,
  embedding     vector(1024),
  is_seed       boolean not null default false,
  onboarded_at  timestamptz,
  created_at    timestamptz not null default now()
);

create index on profiles using hnsw (embedding vector_cosine_ops);

create view public_profiles as
  select id, name, age, gender, city, bio, interests, values, seeking, avatar_url
  from profiles where onboarded_at is not null;

create table swipes (
  swiper_id  uuid references profiles on delete cascade,
  target_id  uuid references profiles on delete cascade,
  direction  text not null check (direction in ('like','dislike')),
  created_at timestamptz not null default now(),
  primary key (swiper_id, target_id)
);

create table matches (
  id         uuid primary key default gen_random_uuid(),
  user_a     uuid references profiles on delete cascade,
  user_b     uuid references profiles on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_a, user_b),
  check (user_a < user_b)
);

create table messages (
  id          uuid primary key default gen_random_uuid(),
  match_id    uuid references matches on delete cascade,
  sender_id   uuid references profiles on delete cascade,
  body        text not null check (length(body) <= 2000),
  moderation  text not null default 'ok' check (moderation in ('ok','warn','block')),
  mod_reason  text,
  created_at  timestamptz not null default now()
);

create table match_explanations (
  viewer_id   uuid references profiles on delete cascade,
  target_id   uuid references profiles on delete cascade,
  score       real not null,
  reason      text not null,
  prompt_ver  text not null,
  created_at  timestamptz not null default now(),
  primary key (viewer_id, target_id)
);

create table ai_calls (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid references auth.users(id) on delete set null,
  feature            text not null,
  model              text not null,
  prompt_ver         text,
  input_tokens       int not null default 0,
  output_tokens      int not null default 0,
  cache_read_tokens  int not null default 0,
  cache_write_tokens int not null default 0,
  cost_usd           numeric(10,6) not null default 0,
  latency_ms         int not null,
  status             text not null,
  error              text,
  created_at         timestamptz not null default now()
);

create index on ai_calls (feature, created_at);

-- ─── RLS ─────────────────────────────────────────────────────────────────────

alter table profiles enable row level security;
alter table swipes   enable row level security;
alter table matches  enable row level security;
alter table messages enable row level security;
alter table match_explanations enable row level security;
alter table ai_calls enable row level security;

-- profiles: owner can read their own full row; public data via public_profiles view.
-- The public_profiles view is SECURITY DEFINER (runs as postgres / view owner) so it
-- can read all onboarded profiles regardless of this policy.
-- Server code that needs another user's full profile must use the admin client.
create policy "profiles: owner read"
  on profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "profiles: owner update"
  on profiles for update
  to authenticated
  using (auth.uid() = id);

-- Allow authenticated users to query the public_profiles view.
grant select on public_profiles to authenticated;

-- swipes: row-level access only via RPC (no direct insert policy needed —
-- record_swipe runs as SECURITY DEFINER and handles inserts)
create policy "swipes: owner select"
  on swipes for select
  to authenticated
  using (auth.uid() = swiper_id);

-- matches: participants can read
create policy "matches: participant select"
  on matches for select
  to authenticated
  using (auth.uid() = user_a or auth.uid() = user_b);

-- messages: participants can read; insert only via admin client (after moderation)
create policy "messages: participant select"
  on messages for select
  to authenticated
  using (
    exists (
      select 1 from matches m
      where m.id = match_id
        and (m.user_a = auth.uid() or m.user_b = auth.uid())
    )
  );

-- match_explanations: admin-only (service role bypasses RLS)
-- ai_calls: admin-only (service role bypasses RLS)
-- No policies needed; access denied to authenticated role by default.

-- ─── RPCs ────────────────────────────────────────────────────────────────────

-- record_swipe: atomic swipe insert + mutual-like match creation
create or replace function record_swipe(target uuid, dir text)
  returns table(matched boolean, match_id uuid)
  language plpgsql
  security definer
  set search_path = public
as $$
declare
  v_swiper uuid := auth.uid();
  v_match_id uuid;
  v_matched boolean := false;
  v_a uuid;
  v_b uuid;
begin
  -- Validate direction
  if dir not in ('like', 'dislike') then
    raise exception 'invalid direction: %', dir;
  end if;

  -- Upsert swipe (idempotent)
  insert into swipes (swiper_id, target_id, direction)
  values (v_swiper, target, dir)
  on conflict (swiper_id, target_id) do update set direction = excluded.direction;

  -- Check for mutual like
  if dir = 'like' then
    if exists (
      select 1 from swipes
      where swiper_id = target and target_id = v_swiper and direction = 'like'
    ) then
      v_matched := true;
      -- Canonical order: smaller uuid = user_a
      if v_swiper < target then
        v_a := v_swiper;
        v_b := target;
      else
        v_a := target;
        v_b := v_swiper;
      end if;
      -- Upsert match (idempotent if re-swiped)
      insert into matches (user_a, user_b)
      values (v_a, v_b)
      on conflict (user_a, user_b) do nothing
      returning id into v_match_id;

      -- If conflict (already matched), fetch existing id
      if v_match_id is null then
        select id into v_match_id from matches where user_a = v_a and user_b = v_b;
      end if;
    end if;
  end if;

  return query select v_matched, v_match_id;
end;
$$;

-- match_candidates: ANN search over public profiles, excluding already-swiped targets.
-- viewer must equal auth.uid() (unless called by service role, e.g. seed script).
create or replace function match_candidates(viewer uuid, k int)
  returns setof public_profiles
  language plpgsql
  stable
  security definer
  set search_path = public
as $$
declare
  v_embedding vector(1024);
begin
  -- Enforce caller identity; service role (auth.uid() = null) may pass any viewer.
  if auth.uid() is not null and viewer <> auth.uid() then
    raise exception 'unauthorized: viewer must match the authenticated user';
  end if;

  -- Skip ANN search when the viewer has no embedding yet.
  select embedding into v_embedding from profiles where id = viewer;
  if v_embedding is null then
    return;
  end if;

  return query
    select p.id, p.name, p.age, p.gender, p.city, p.bio, p.interests, p.values, p.seeking, p.avatar_url
    from profiles p
    where p.onboarded_at is not null
      and p.id <> viewer
      and p.embedding is not null
      and not exists (
        select 1 from swipes s where s.swiper_id = viewer and s.target_id = p.id
      )
    order by p.embedding <=> v_embedding
    limit k;
end;
$$;
