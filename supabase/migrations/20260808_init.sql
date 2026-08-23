create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role text not null default 'user' check (role in ('user','admin')),
  created_at timestamptz not null default now()
);
create table public.plants (
  id uuid primary key default gen_random_uuid(), user_id uuid references public.profiles(id) on delete set null,
  type text not null, stage text not null, method text not null, pot_size text, amount integer not null default 1 check (amount > 0), created_at timestamptz not null default now()
);
create table public.disease_detections (
  id uuid primary key default gen_random_uuid(), user_id uuid references public.profiles(id) on delete set null,
  plant_type text not null, disease_name text not null, severity text not null, confidence numeric not null, created_at timestamptz not null default now()
);
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin insert into public.profiles (id, display_name) values (new.id, coalesce(new.raw_user_meta_data->>'display_name','ผู้ใช้ใหม่')); return new; end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
alter table public.profiles enable row level security; alter table public.plants enable row level security; alter table public.disease_detections enable row level security;
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = public as $$ select exists(select 1 from public.profiles where id = auth.uid() and role = 'admin') $$;
create policy "profiles self or admin" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "plants owner, guest or admin" on public.plants for select using (user_id = auth.uid() or user_id is null or public.is_admin());
create policy "plants insert own or guest" on public.plants for insert with check (user_id = auth.uid() or user_id is null);
create policy "detections owner, guest or admin" on public.disease_detections for select using (user_id = auth.uid() or user_id is null or public.is_admin());
create policy "detections insert own or guest" on public.disease_detections for insert with check (user_id = auth.uid() or user_id is null);
