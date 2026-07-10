-- Trigger to keep message table under 50 entries
create or replace function trim_messages() returns trigger as $$
begin
  if (select count(*) from messages) > 50 then
    delete from messages where id in (
      select id from messages order by created_at asc limit 40
    );
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trim_messages_after_insert
  after insert on messages
  for each statement
  execute function trim_messages();

-- Trigger to enqueue media cleanup when MEDIA_ACK is received
create or replace function enqueue_media_cleanup() returns trigger as $$
begin
  if (new.media_ack = true and new.media_url is not null and (old is null or old.media_ack is distinct from true)) then
    insert into media_cleanup_queue (media_url) values (new.media_url);
  end if;
  return new;
end;
$$ language plpgsql;

create trigger media_ack_cleanup_after_update
  after update on messages
  for each row
  when (new.media_ack = true and new.media_url is not null)
  execute function enqueue_media_cleanup();
