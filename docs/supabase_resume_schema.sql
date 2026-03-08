-- Supabase Resume Schema (public resume + authenticated admin writes)
--
-- How to apply:
-- Supabase Dashboard -> SQL Editor -> New query
-- Paste this file and run
--
-- Notes:
-- - Public (anon) can SELECT resume tables so `/resume` can be public.
-- - Only authenticated users can INSERT/UPDATE/DELETE via Supabase Auth.
-- - If you need stricter admin-only access, replace the write policies with checks
--   against a custom claim / allow-list table.

create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.personal_info (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  title text not null default '',
  summary text not null default '',
  email text not null default '',
  phone text not null default '',
  linkedin text not null default '',
  github text not null default '',
  portfolio text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_updated_at_personal_info on public.personal_info;
create trigger set_updated_at_personal_info
before update on public.personal_info
for each row execute function public.set_updated_at();

alter table public.personal_info enable row level security;

drop policy if exists "personal_info_public_read" on public.personal_info;
create policy "personal_info_public_read"
on public.personal_info for select
using (true);

drop policy if exists "personal_info_auth_write" on public.personal_info;
create policy "personal_info_auth_write"
on public.personal_info for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  skill_name text not null,
  proficiency int2 not null default 3 check (proficiency between 1 and 5),
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_updated_at_skills on public.skills;
create trigger set_updated_at_skills
before update on public.skills
for each row execute function public.set_updated_at();

alter table public.skills enable row level security;

drop policy if exists "skills_public_read" on public.skills;
create policy "skills_public_read"
on public.skills for select
using (true);

drop policy if exists "skills_auth_write" on public.skills;
create policy "skills_auth_write"
on public.skills for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  status text not null default 'complete',
  tech text[] not null default '{}'::text[],
  achievements text[] not null default '{}'::text[],
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_updated_at_projects on public.projects;
create trigger set_updated_at_projects
before update on public.projects
for each row execute function public.set_updated_at();

alter table public.projects enable row level security;

drop policy if exists "projects_public_read" on public.projects;
create policy "projects_public_read"
on public.projects for select
using (true);

drop policy if exists "projects_auth_write" on public.projects;
create policy "projects_auth_write"
on public.projects for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

create table if not exists public.experience (
  id uuid primary key default gen_random_uuid(),
  role text not null,
  organization text not null,
  period text not null default '',
  description text not null default '',
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_updated_at_experience on public.experience;
create trigger set_updated_at_experience
before update on public.experience
for each row execute function public.set_updated_at();

alter table public.experience enable row level security;

drop policy if exists "experience_public_read" on public.experience;
create policy "experience_public_read"
on public.experience for select
using (true);

drop policy if exists "experience_auth_write" on public.experience;
create policy "experience_auth_write"
on public.experience for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  issuer text not null default '',
  date date,
  description text not null default '',
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_updated_at_certificates on public.certificates;
create trigger set_updated_at_certificates
before update on public.certificates
for each row execute function public.set_updated_at();

alter table public.certificates enable row level security;

drop policy if exists "certificates_public_read" on public.certificates;
create policy "certificates_public_read"
on public.certificates for select
using (true);

drop policy if exists "certificates_auth_write" on public.certificates;
create policy "certificates_auth_write"
on public.certificates for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

