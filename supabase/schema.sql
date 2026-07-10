-- Supabase schema for discovery and messages

create table discovery (
  id serial primary key,
  client_id text unique not null,
  ip text not null,
  port integer not null,
  last_seen timestamptz default now()
);

create table messages (
  id serial primary key,
  sender text not null,
  content text not null,
  media_url text,
  media_ack boolean default false,
  created_at timestamptz default now()
);

create table media_cleanup_queue (
  id serial primary key,
  media_url text not null,
  queued_at timestamptz default now()
);
