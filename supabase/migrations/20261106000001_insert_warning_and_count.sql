-- Atomically inserts a user warning and returns the new total count for that
-- user, eliminating the TOCTOU race between separate INSERT + SELECT calls.
create or replace function insert_warning_and_count(
  p_user_id   uuid,
  p_match_id  uuid,
  p_message_id uuid,
  p_reason    text
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
