-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  avatar_url text,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "Profiles are viewable by owner" on public.profiles for select using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Businesses
create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  business_name text not null,
  business_type text,
  description text,
  logo_url text,
  website_url text,
  physical_address text,
  feedback_slug text not null unique,
  is_public boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.businesses enable row level security;
create policy "Owners manage businesses" on public.businesses for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "Public businesses are viewable by anyone" on public.businesses for select using (is_public = true);
create index on public.businesses(owner_id);
create index on public.businesses(feedback_slug);

-- Feedback
create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  customer_name text,
  customer_email text,
  is_anonymous boolean not null default true,
  rating int check (rating between 1 and 5),
  category text,
  message text not null,
  source text not null default 'Public Page',
  status text not null default 'New',
  sentiment text,
  created_at timestamptz not null default now()
);
alter table public.feedback enable row level security;
create policy "Anyone can submit feedback" on public.feedback for insert with check (true);
create policy "Owner can read feedback" on public.feedback for select using (
  exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid())
);
create policy "Owner can update feedback" on public.feedback for update using (
  exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid())
);
create policy "Owner can delete feedback" on public.feedback for delete using (
  exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid())
);
create index on public.feedback(business_id);
create index on public.feedback(status);

-- Widget settings
create table public.widget_settings (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null unique references public.businesses(id) on delete cascade,
  widget_title text not null default 'Share your feedback',
  button_text text not null default 'Feedback',
  position text not null default 'bottom-right',
  theme text not null default 'light',
  is_enabled boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.widget_settings enable row level security;
create policy "Public widget read" on public.widget_settings for select using (true);
create policy "Owner manages widget" on public.widget_settings for all using (
  exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid())
) with check (
  exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid())
);

-- QR codes
create table public.qr_codes (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  qr_url text not null,
  scans_count int not null default 0,
  created_at timestamptz not null default now()
);
alter table public.qr_codes enable row level security;
create policy "Owner manages qr" on public.qr_codes for all using (
  exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid())
) with check (
  exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid())
);

-- Subscriptions
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  plan_name text not null default 'free',
  status text not null default 'active',
  feedback_limit int not null default 50,
  created_at timestamptz not null default now()
);
alter table public.subscriptions enable row level security;
create policy "User views own subscription" on public.subscriptions for select using (auth.uid() = user_id);
create policy "User updates own subscription" on public.subscriptions for update using (auth.uid() = user_id);

-- Trigger: create profile + free subscription on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    new.email,
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;

  insert into public.subscriptions (user_id, plan_name, feedback_limit)
  values (new.id, 'free', 50)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();