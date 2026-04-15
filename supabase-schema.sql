-- InspectIQ Database Schema
-- Run this in your Supabase SQL Editor

-- Profiles table (extends auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text,
  company_name text,
  license_number text,
  phone text,
  logo_url text,
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_status text check (subscription_status in ('active', 'inactive', 'trialing', 'past_due')),
  trial_ends_at timestamptz default (now() + interval '14 days'),
  created_at timestamptz default now()
);

-- Inspections table
create table public.inspections (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  property_address text not null,
  client_name text not null,
  client_email text,
  inspection_date date not null default current_date,
  status text check (status in ('draft', 'in_progress', 'completed')) default 'draft',
  report_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Rooms table
create table public.rooms (
  id uuid default gen_random_uuid() primary key,
  inspection_id uuid references public.inspections(id) on delete cascade not null,
  name text not null,
  order_index integer not null default 0
);

-- Inspection items table
create table public.inspection_items (
  id uuid default gen_random_uuid() primary key,
  room_id uuid references public.rooms(id) on delete cascade not null,
  name text not null,
  condition text check (condition in ('good', 'fair', 'poor', 'na')) default 'good',
  notes text,
  ai_narrative text,
  order_index integer not null default 0
);

-- Reports table
create table public.reports (
  id uuid default gen_random_uuid() primary key,
  inspection_id uuid references public.inspections(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  pdf_url text,
  share_token text unique default encode(gen_random_bytes(16), 'hex'),
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.inspections enable row level security;
alter table public.rooms enable row level security;
alter table public.inspection_items enable row level security;
alter table public.reports enable row level security;

-- RLS Policies: users can only access their own data
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

create policy "Users can CRUD own inspections" on public.inspections for all using (auth.uid() = user_id);

create policy "Users can CRUD own rooms" on public.rooms for all using (
  auth.uid() = (select user_id from public.inspections where id = inspection_id)
);

create policy "Users can CRUD own items" on public.inspection_items for all using (
  auth.uid() = (
    select i.user_id from public.inspections i
    join public.rooms r on r.inspection_id = i.id
    where r.id = room_id
  )
);

create policy "Users can CRUD own reports" on public.reports for all using (auth.uid() = user_id);

-- Public share link policy (anyone with token can view)
create policy "Public share token read" on public.reports for select using (true);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, company_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'company_name'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Updated_at trigger for inspections
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_inspections_updated_at
  before update on public.inspections
  for each row execute procedure public.update_updated_at_column();
