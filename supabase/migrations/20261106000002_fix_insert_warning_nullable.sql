-- Replace the function to mark p_message_id as nullable (default null)
-- so Supabase TypeScript codegen emits the correct string | null type.
create or replace function insert_warning_and_count(
  p_user_id    uuid,
  p_match_id   uuid,
  p_message_id uuid default null,
  p_reason     text default ''
) returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
begin
  insert into user_warnings (user_id, match_id, message_id, reason)
  values (p_user_id, p_match_id, p_message_id, p_reason);

  select count(*)::int into v_count
  from user_warnings
  where user_id = p_user_id;

  return v_count;
end;
$$;
