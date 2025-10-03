-- Enable Row Level Security on all tables
alter table public.guns enable row level security;
alter table public.enemies enable row level security;
alter table public.items enable row level security;
alter table public.bosses enable row level security;
alter table public.npcs enable row level security;
alter table public.miscellaneous enable row level security;

-- Create policies for public read access (anyone can view)
create policy "guns_select_all" on public.guns for select using (true);
create policy "enemies_select_all" on public.enemies for select using (true);
create policy "items_select_all" on public.items for select using (true);
create policy "bosses_select_all" on public.bosses for select using (true);
create policy "npcs_select_all" on public.npcs for select using (true);
create policy "miscellaneous_select_all" on public.miscellaneous for select using (true);

-- Create admin role check function
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.admins
    where user_id = auth.uid()
  );
end;
$$ language plpgsql security definer;

-- Create policies for admin-only write access
create policy "guns_insert_admin" on public.guns for insert with check (is_admin());
create policy "guns_update_admin" on public.guns for update using (is_admin());
create policy "guns_delete_admin" on public.guns for delete using (is_admin());

create policy "enemies_insert_admin" on public.enemies for insert with check (is_admin());
create policy "enemies_update_admin" on public.enemies for update using (is_admin());
create policy "enemies_delete_admin" on public.enemies for delete using (is_admin());

create policy "items_insert_admin" on public.items for insert with check (is_admin());
create policy "items_update_admin" on public.items for update using (is_admin());
create policy "items_delete_admin" on public.items for delete using (is_admin());

create policy "bosses_insert_admin" on public.bosses for insert with check (is_admin());
create policy "bosses_update_admin" on public.bosses for update using (is_admin());
create policy "bosses_delete_admin" on public.bosses for delete using (is_admin());

create policy "npcs_insert_admin" on public.npcs for insert with check (is_admin());
create policy "npcs_update_admin" on public.npcs for update using (is_admin());
create policy "npcs_delete_admin" on public.npcs for delete using (is_admin());

create policy "miscellaneous_insert_admin" on public.miscellaneous for insert with check (is_admin());
create policy "miscellaneous_update_admin" on public.miscellaneous for update using (is_admin());
create policy "miscellaneous_delete_admin" on public.miscellaneous for delete using (is_admin());
