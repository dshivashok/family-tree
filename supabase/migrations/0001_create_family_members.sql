create extension if not exists "uuid-ossp";

create table if not exists family_members (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  chinese_name text,
  phone text,
  email text,
  picture_url text,
  parent_id uuid references family_members(id)
);

-- Create a public bucket for storing pictures
insert into storage.buckets (id, name, public) values ('pictures', 'pictures', true)
  on conflict (id) do nothing;
