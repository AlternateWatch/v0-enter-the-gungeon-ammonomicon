-- Create tables for all ammonomicon content types

-- Guns table
create table if not exists public.guns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text,
  quality text,
  magazine_size integer,
  max_ammo integer,
  reload_time numeric,
  damage text,
  fire_rate text,
  shot_speed text,
  range text,
  force text,
  spread text,
  quote text,
  description text,
  notes text,
  image_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enemies table
create table if not exists public.enemies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text,
  health text,
  damage text,
  behavior text,
  description text,
  notes text,
  image_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Items table
create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text,
  quality text,
  effect text,
  quote text,
  description text,
  notes text,
  image_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Bosses table
create table if not exists public.bosses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text,
  health text,
  phases integer,
  attacks text,
  description text,
  strategy text,
  notes text,
  image_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- NPCs table
create table if not exists public.npcs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text,
  role text,
  unlocked_by text,
  services text,
  dialogue text,
  description text,
  notes text,
  image_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Miscellaneous table
create table if not exists public.miscellaneous (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  description text,
  notes text,
  image_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create indexes for better query performance
create index if not exists guns_name_idx on public.guns(name);
create index if not exists enemies_name_idx on public.enemies(name);
create index if not exists items_name_idx on public.items(name);
create index if not exists bosses_name_idx on public.bosses(name);
create index if not exists npcs_name_idx on public.npcs(name);
create index if not exists miscellaneous_name_idx on public.miscellaneous(name);
