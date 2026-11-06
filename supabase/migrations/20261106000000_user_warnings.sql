create table user_warnings (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles on delete cascade,
  match_id    uuid not null references matches on delete cascade,
  message_id  uuid references messages on delete set null,
  reason      text not null,
  created_at  timestamptz not null default now()
);

create index on user_warnings (user_id, created_at);

-- Only admin client can read/write warnings (bypasses RLS like ai_calls).
alter table user_warnings enable row level security;
