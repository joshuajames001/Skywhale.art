-- Create a function to list expired mirror/hero files
-- This avoids direct deletion logic in SQL which can be tricky with storage triggers.

create or replace function get_expired_mirrors()
returns table (name text)
language plpgsql
security definer
as $$
begin
  return query
  select objects.name
  from storage.objects
  where bucket_id = 'story-assets'
    and (objects.name like '%/mirror_%' or objects.name like '%/hero_%') -- ONLY target user uploads
    and created_at < (now() - interval '1 hour'); -- Experied
end;
$$;
