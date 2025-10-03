-- Create admins table to track who has admin access
create table if not exists public.admins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  created_at timestamp with time zone default now(),
  unique(user_id)
);

alter table public.admins enable row level security;

-- Only admins can view the admins table
create policy "admins_select_admin" on public.admins for select using (is_admin());

-- Only existing admins can add new admins
create policy "admins_insert_admin" on public.admins for insert with check (is_admin());

-- Only admins can remove other admins
create policy "admins_delete_admin" on public.admins for delete using (is_admin());
