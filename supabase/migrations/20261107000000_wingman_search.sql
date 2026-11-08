-- Wingman: search profiles by arbitrary query embedding instead of viewer's own embedding.
-- Called from features/wingman/server/tools/searchProfiles.ts via the admin client.
create or replace function search_profiles_by_embedding(
  query_embedding vector(1024),
  exclude_id uuid,
  k int,
  filter_city text default null
)
returns setof public_profiles
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  return query
    select p.id, p.name, p.age, p.gender, p.city, p.bio, p.interests, p.values, p.seeking, p.avatar_url
    from profiles p
    where p.onboarded_at is not null
      and p.id <> exclude_id
      and p.embedding is not null
      and (filter_city is null or lower(p.city) = lower(filter_city))
    order by p.embedding <=> query_embedding
    limit k;
end;
$$;
