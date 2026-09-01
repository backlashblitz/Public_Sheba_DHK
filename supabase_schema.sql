-- ==========================================
-- Public Sheba DHK - Supabase Database Schema
-- ==========================================

-- 1. Profiles Table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text,
  email text,
  created_at timestamptz default now()
);

-- 2. Zones Table
create table if not exists public.zones (
  id text primary key,
  name text not null,
  lat float not null,
  lng float not null,
  water_status text default 'normal',
  electricity_status text default 'normal',
  gas_status text default 'normal',
  status text default 'normal',
  report_count int default 0
);

-- 3. Reports Table
create table if not exists public.reports (
  id uuid default gen_random_uuid() primary key,
  zone_id text,
  zone_name text,
  utility_type text default 'water',
  issue_type text,
  started text,
  description text,
  specific_location text,
  address text,
  photo_url text,
  upvotes int default 0,
  user_id uuid,
  user_email text,
  status text default 'active',
  admin_reply text,
  created_at timestamptz default now()
);

-- 4. Subscriptions Table
create table if not exists public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid,
  zone_id text,
  created_at timestamptz default now()
);

-- 5. Notifications Table
create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid,
  zone_id text,
  zone_name text,
  message text,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- 6. Announcements Table
create table if not exists public.announcements (
  id uuid default gen_random_uuid() primary key,
  title text,
  message text,
  created_at timestamptz default now()
);

-- 7. Upvotes Table
create table if not exists public.upvotes (
  id uuid default gen_random_uuid() primary key,
  report_id uuid,
  user_id uuid,
  created_at timestamptz default now()
);

-- Disable Row Level Security (RLS) or add public policies for easy access
alter table public.profiles enable row level security;
alter table public.zones enable row level security;
alter table public.reports enable row level security;
alter table public.subscriptions enable row level security;
alter table public.notifications enable row level security;
alter table public.announcements enable row level security;
alter table public.upvotes enable row level security;

-- Policies to allow full access with anon key
create policy "Allow all on profiles" on public.profiles for all using (true) with check (true);
create policy "Allow all on zones" on public.zones for all using (true) with check (true);
create policy "Allow all on reports" on public.reports for all using (true) with check (true);
create policy "Allow all on subscriptions" on public.subscriptions for all using (true) with check (true);
create policy "Allow all on notifications" on public.notifications for all using (true) with check (true);
create policy "Allow all on announcements" on public.announcements for all using (true) with check (true);
create policy "Allow all on upvotes" on public.upvotes for all using (true) with check (true);

-- Insert Default Dhaka Zones
insert into public.zones (id, name, lat, lng, water_status, electricity_status, gas_status, report_count)
values
  ('dhanmondi', 'Dhanmondi', 23.7465, 90.3760, 'normal', 'normal', 'normal', 0),
  ('gulshan', 'Gulshan', 23.7925, 90.4078, 'normal', 'normal', 'normal', 0),
  ('banani', 'Banani', 23.7937, 90.4066, 'normal', 'normal', 'normal', 0),
  ('uttara', 'Uttara', 23.8759, 90.3795, 'normal', 'normal', 'normal', 0),
  ('mirpur', 'Mirpur', 23.8223, 90.3654, 'normal', 'normal', 'normal', 0),
  ('mohammadpur', 'Mohammadpur', 23.7658, 90.3584, 'normal', 'normal', 'normal', 0),
  ('mohakhali', 'Mohakhali', 23.7780, 90.4000, 'normal', 'normal', 'normal', 0),
  ('badda', 'Badda', 23.7806, 90.4267, 'normal', 'normal', 'normal', 0),
  ('motijheel', 'Motijheel', 23.7330, 90.4172, 'normal', 'normal', 'normal', 0),
  ('old_dhaka', 'Old Dhaka', 23.7104, 90.4074, 'normal', 'normal', 'normal', 0),
  ('khilgaon', 'Khilgaon', 23.7505, 90.4219, 'normal', 'normal', 'normal', 0),
  ('rampura', 'Rampura', 23.7612, 90.4208, 'normal', 'normal', 'normal', 0),
  ('basundhara', 'Bashundhara R/A', 23.8164, 90.4357, 'normal', 'normal', 'normal', 0)
on conflict (id) do nothing;
