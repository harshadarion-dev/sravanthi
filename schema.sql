-- ============================================================
-- Sravanthi Portfolio — Supabase SQL Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. PROFILE
create table if not exists profile (
  id uuid primary key default gen_random_uuid(),
  name text, tagline text, bio text, avatar_url text,
  email text, phone text, location text,
  updated_at timestamptz default now()
);

-- 2. SKILLS
create table if not exists skills (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default 'Cloud Platforms',
  percentage int default 80 check (percentage between 0 and 100),
  sort_order int default 0,
  created_at timestamptz default now()
);

-- 3. EXPERIENCE
create table if not exists experience (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  company text not null,
  location text,
  start_date date,
  end_date date,
  description text,
  tags text,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- 4. PROJECTS
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text default 'pipelines',
  tech_stack text,
  live_url text,
  github_url text,
  thumbnail_url text,
  featured boolean default false,
  published boolean default true,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 5. CERTIFICATIONS
create table if not exists certifications (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  issuer text not null,
  year int,
  credential_url text,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- 6. CONTACT MESSAGES
create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text,
  message text not null,
  status text default 'new' check (status in ('new', 'read', 'replied')),
  created_at timestamptz default now()
);

-- 7. SETTINGS (key-value store for SEO, social links, resume URL, etc.)
create table if not exists settings (
  key text primary key,
  value text,
  updated_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

alter table profile enable row level security;
alter table skills enable row level security;
alter table experience enable row level security;
alter table projects enable row level security;
alter table certifications enable row level security;
alter table contact_messages enable row level security;
alter table settings enable row level security;

-- Public can READ everything
create policy "Public read profile" on profile for select using (true);
create policy "Public read skills" on skills for select using (true);
create policy "Public read experience" on experience for select using (true);
create policy "Public read projects" on projects for select using (true);
create policy "Public read certifications" on certifications for select using (true);
create policy "Public read settings" on settings for select using (true);

-- Authenticated admin can do everything
create policy "Admin all profile" on profile for all using (auth.role() = 'authenticated');
create policy "Admin all skills" on skills for all using (auth.role() = 'authenticated');
create policy "Admin all experience" on experience for all using (auth.role() = 'authenticated');
create policy "Admin all projects" on projects for all using (auth.role() = 'authenticated');
create policy "Admin all certifications" on certifications for all using (auth.role() = 'authenticated');
create policy "Admin all settings" on settings for all using (auth.role() = 'authenticated');
create policy "Admin all contact_messages" on contact_messages for all using (auth.role() = 'authenticated');

-- Public can INSERT contact messages (contact form)
create policy "Public insert messages" on contact_messages for insert with check (true);

-- ============================================================
-- STORAGE BUCKETS (run after creating buckets in Dashboard)
-- ============================================================
-- Create these buckets manually in:
-- Supabase Dashboard → Storage → New Bucket
--   • project-images  (Public: ON)
--   • resume-files    (Public: ON)
--   • avatars         (Public: ON)

-- Storage policies (run after creating buckets):
insert into storage.buckets (id, name, public) values
  ('project-images', 'project-images', true),
  ('resume-files', 'resume-files', true),
  ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "Public read project-images" on storage.objects for select using (bucket_id = 'project-images');
create policy "Auth upload project-images" on storage.objects for insert with check (auth.role() = 'authenticated' and bucket_id = 'project-images');
create policy "Auth delete project-images" on storage.objects for delete using (auth.role() = 'authenticated' and bucket_id = 'project-images');

create policy "Public read resume-files" on storage.objects for select using (bucket_id = 'resume-files');
create policy "Auth upload resume-files" on storage.objects for insert with check (auth.role() = 'authenticated' and bucket_id = 'resume-files');
create policy "Auth delete resume-files" on storage.objects for delete using (auth.role() = 'authenticated' and bucket_id = 'resume-files');

create policy "Public read avatars" on storage.objects for select using (bucket_id = 'avatars');
create policy "Auth upload avatars" on storage.objects for insert with check (auth.role() = 'authenticated' and bucket_id = 'avatars');

-- ============================================================
-- SEED DATA (optional sample data)
-- ============================================================
insert into skills (name, category, percentage, sort_order) values
  ('GCP Core Services', 'Cloud Platforms', 95, 1),
  ('BigQuery', 'Cloud Platforms', 95, 2),
  ('Dataflow / Dataproc', 'Cloud Platforms', 90, 3),
  ('Vertex AI', 'Cloud Platforms', 85, 4),
  ('Python', 'Programming', 95, 1),
  ('SQL', 'Programming', 95, 2),
  ('Scala', 'Programming', 75, 3),
  ('Bash / Shell', 'Programming', 85, 4),
  ('ETL/ELT Pipeline Design', 'Data Engineering', 95, 1),
  ('Dimensional Modeling', 'Data Engineering', 90, 2),
  ('Data Quality Frameworks', 'Data Engineering', 90, 3),
  ('Query Optimization', 'Data Engineering', 95, 4),
  ('Machine Learning / AI', 'ML & DevOps', 85, 1),
  ('Docker & Kubernetes', 'ML & DevOps', 85, 2),
  ('CI/CD (Jenkins/Terraform)', 'ML & DevOps', 85, 3)
on conflict do nothing;

insert into certifications (title, issuer, year, sort_order) values
  ('Professional Data Engineer', 'Google Cloud', 2022, 1),
  ('Certified Data Engineer Associate', 'Databricks', 2023, 2)
on conflict do nothing;

insert into experience (title, company, location, start_date, end_date, description, tags, sort_order) values
  ('Senior Data Engineer', 'Wells Fargo', 'USA', '2024-08-01', null, 'Designed real-time ETL pipeline ingesting BigQuery data using Python, Cloud Composer, and Dataflow, reducing SLA from 5 days to 24 hours.', 'GCP,BigQuery,Dataflow,Python', 1),
  ('Quality Specialist', 'Amazon', 'India', '2021-09-01', '2023-07-01', 'Designed automated data quality validation framework achieving 95%+ accuracy and reduced manual reviews by 28%.', 'Python,SQL,Data Quality', 2),
  ('Data Engineer', 'Tech Mahindra (Verizon)', 'India', '2019-01-01', '2021-08-01', 'Migrated legacy on-premises ETL pipelines to GCP Dataflow, processing 100M+ telecom records daily.', 'Dataflow,Vertex AI,BigQuery', 3)
on conflict do nothing;
