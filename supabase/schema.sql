-- ASRS production schema
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null check (role in ('student','faculty','admin')) default 'student',
  roll_no text unique,
  department text,
  program text,
  year integer,
  section text,
  created_at timestamptz not null default now()
);
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(), course_code text unique not null,
  course_name text not null, instructor_id uuid references public.profiles(id) on delete set null,
  department text, semester text, created_at timestamptz not null default now()
);
create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(), student_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade, unique(student_id,course_id)
);
create table if not exists public.attendance_sessions (
  id uuid primary key default gen_random_uuid(), course_id uuid not null references public.courses(id) on delete cascade,
  session_date date not null, title text, created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(), unique(course_id,session_date)
);
create table if not exists public.attendance_records (
  id uuid primary key default gen_random_uuid(), session_id uuid not null references public.attendance_sessions(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  status text not null check(status in ('present','absent','late','excused')),
  marked_at timestamptz not null default now(), unique(session_id,student_id)
);
create table if not exists public.marks (
  id uuid primary key default gen_random_uuid(), student_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  assessment text not null, score numeric(6,2) not null check(score >= 0), max_score numeric(6,2) not null check(max_score > 0),
  created_at timestamptz not null default now()
);
create index if not exists attendance_records_student_idx on public.attendance_records(student_id);
create index if not exists attendance_sessions_course_date_idx on public.attendance_sessions(course_id,session_date);

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.enrollments enable row level security;
alter table public.attendance_sessions enable row level security;
alter table public.attendance_records enable row level security;
alter table public.marks enable row level security;

create or replace function public.current_role() returns text language sql stable security definer set search_path=public as $$ select role from public.profiles where id=auth.uid() $$;

create policy "profiles own read" on public.profiles for select using (id=auth.uid() or public.current_role()='admin');
create policy "admin manages profiles" on public.profiles for all using (public.current_role()='admin') with check (public.current_role()='admin');
create policy "authenticated courses read" on public.courses for select to authenticated using (true);
create policy "admin manages courses" on public.courses for all using (public.current_role()='admin') with check (public.current_role()='admin');
create policy "students see own enrollments" on public.enrollments for select using (student_id=auth.uid() or public.current_role() in ('faculty','admin'));
create policy "faculty/admin manage enrollments" on public.enrollments for all using (public.current_role() in ('faculty','admin')) with check (public.current_role() in ('faculty','admin'));
create policy "authenticated sessions read" on public.attendance_sessions for select to authenticated using (true);
create policy "faculty/admin manage sessions" on public.attendance_sessions for all using (public.current_role() in ('faculty','admin')) with check (public.current_role() in ('faculty','admin'));
create policy "students see own attendance" on public.attendance_records for select using (student_id=auth.uid() or public.current_role() in ('faculty','admin'));
create policy "faculty/admin manage attendance" on public.attendance_records for all using (public.current_role() in ('faculty','admin')) with check (public.current_role() in ('faculty','admin'));
create policy "students see own marks" on public.marks for select using (student_id=auth.uid() or public.current_role() in ('faculty','admin'));
create policy "faculty/admin manage marks" on public.marks for all using (public.current_role() in ('faculty','admin')) with check (public.current_role() in ('faculty','admin'));

create or replace view public.student_attendance_summary as
select ar.student_id, s.course_id, count(*) filter(where ar.status in ('present','late','excused')) as attended,
       count(*) as total,
       round(100.0*count(*) filter(where ar.status in ('present','late','excused'))/nullif(count(*),0),2) as percentage
from public.attendance_records ar join public.attendance_sessions s on s.id=ar.session_id group by ar.student_id,s.course_id;