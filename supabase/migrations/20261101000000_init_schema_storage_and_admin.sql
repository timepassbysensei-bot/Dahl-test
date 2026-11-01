-- ============================================================================
--  MANJU SENSEI — TEACHER'S RESOURCE HUB
--  Migration: 20261101000000_init_schema_storage_and_admin.sql
--
--  Run this ONCE in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
--  The script is idempotent and safe to run again; it will not duplicate data.
--
--  What it creates:
--    1. pgcrypto (+ pg_cron when the project supports it)
--    2. public.resources and public.messages tables with indexes
--    3. 7-day message retention: trigger + RPC + optional pg_cron job
--    4. Public "resources" storage bucket with a 25 MB limit
--    5. Row Level Security policies for tables and storage objects
--    6. The confirmed admin auth account (viewpointpublicschoolofficial@gmail.com)
-- ============================================================================


-- ============================================================================
-- 1. EXTENSIONS
-- ============================================================================

-- pgcrypto supplies crypt() + gen_salt() for the admin password and
-- gen_random_uuid() on older PostgreSQL versions.
create extension if not exists pgcrypto;

-- pg_cron is optional. On managed projects where the extension is unavailable,
-- the site still prunes messages through the client call and the SQL trigger.
do $$
begin
  create extension if not exists pg_cron;
exception
  when others then
    raise notice 'pg_cron unavailable (%). The 7-day cleanup still runs via trigger + client.', sqlerrm;
end
$$;


-- ============================================================================
-- 2. TABLES
-- ============================================================================

create table if not exists public.resources (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  category     text not null default 'General',
  file_url     text not null,
  storage_path text,
  file_type    text not null default 'pdf',
  file_size    bigint,
  created_at   timestamptz not null default now()
);

comment on table public.resources is
  'Study material published by the teacher. Files live in the public resources bucket.';

-- Keep file_type limited to the three badges the UI renders.
alter table public.resources drop constraint if exists resources_file_type_check;
alter table public.resources
  add constraint resources_file_type_check check (file_type in ('pdf', 'image', 'doc'));

alter table public.resources drop constraint if exists resources_title_length_check;
alter table public.resources
  add constraint resources_title_length_check check (char_length(title) between 1 and 160);

create index if not exists resources_created_at_idx on public.resources (created_at desc);
create index if not exists resources_category_idx on public.resources (lower(category));


create table if not exists public.messages (
  id            uuid primary key default gen_random_uuid(),
  sender_name   text not null,
  sender_phone  text not null,
  sender_email  text,
  message_text  text not null,
  created_at    timestamptz not null default now()
);

comment on table public.messages is
  'Contact-form submissions. Rows older than 7 days are deleted automatically.';

alter table public.messages drop constraint if exists messages_name_length_check;
alter table public.messages
  add constraint messages_name_length_check check (char_length(trim(sender_name)) between 1 and 120);

alter table public.messages drop constraint if exists messages_phone_length_check;
alter table public.messages
  add constraint messages_phone_length_check check (char_length(trim(sender_phone)) between 6 and 24);

alter table public.messages drop constraint if exists messages_text_length_check;
alter table public.messages
  add constraint messages_text_length_check check (char_length(trim(message_text)) between 1 and 4000);

create index if not exists messages_created_at_idx on public.messages (created_at desc);


-- ============================================================================
-- 3. AUTOMATIC 7-DAY RETENTION
-- ============================================================================

-- Fires after every insert and removes anything older than seven days.
create or replace function public.delete_expired_messages()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.messages
  where created_at < now() - interval '7 days';
  return new;
end;
$$;

comment on function public.delete_expired_messages() is
  'After every message insert, purge rows older than the 7-day retention window.';

drop trigger if exists trg_delete_expired_messages on public.messages;
create trigger trg_delete_expired_messages
  after insert on public.messages
  for each row
  execute function public.delete_expired_messages();


-- Callable from the browser (anon + authenticated) so the site can prune on
-- load even before a pg_cron run. SECURITY DEFINER limits it to expired rows.
create or replace function public.purge_expired_messages()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  removed integer := 0;
begin
  delete from public.messages
  where created_at < now() - interval '7 days';

  get diagnostics removed = row_count;
  return removed;
end;
$$;

comment on function public.purge_expired_messages() is
  'Deletes messages older than 7 days and returns the number of removed rows.';

revoke all on function public.purge_expired_messages() from public;
grant execute on function public.purge_expired_messages() to anon, authenticated;


-- Daily cron job (03:15 server time). Fully wrapped so a project without
-- pg_cron never fails the migration.
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    if exists (select 1 from cron.job where jobname = 'purge-expired-messages') then
      perform cron.unschedule('purge-expired-messages');
    end if;

    perform cron.schedule(
      'purge-expired-messages',
      '15 3 * * *',
      $cron$ delete from public.messages where created_at < now() - interval '7 days'; $cron$
    );
  end if;
exception
  when others then
    raise notice 'pg_cron schedule skipped (%). Retention still runs via trigger + client.', sqlerrm;
end
$$;


-- ============================================================================
-- 4. STORAGE BUCKET
-- ============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'resources',
  'resources',
  true,
  26214400, -- 25 MB
  array[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/heic',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'application/octet-stream'
  ]::text[]
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;


-- ============================================================================
-- 5. ROW LEVEL SECURITY
-- ============================================================================

alter table public.resources enable row level security;
alter table public.messages  enable row level security;

-- Grants first (RLS still filters every row).
grant usage on schema public to anon, authenticated;

grant select on public.resources to anon, authenticated;
grant insert, update, delete on public.resources to authenticated;

grant insert on public.messages to anon, authenticated;
grant select, delete on public.messages to anon, authenticated;

-- ---------------------------------------------------------------- resources
drop policy if exists "Resources are publicly readable" on public.resources;
create policy "Resources are publicly readable"
  on public.resources
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Authenticated admins can insert resources" on public.resources;
create policy "Authenticated admins can insert resources"
  on public.resources
  for insert
  to authenticated
  with check (true);

drop policy if exists "Authenticated admins can update resources" on public.resources;
create policy "Authenticated admins can update resources"
  on public.resources
  for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated admins can delete resources" on public.resources;
create policy "Authenticated admins can delete resources"
  on public.resources
  for delete
  to authenticated
  using (true);

-- ----------------------------------------------------------------- messages
drop policy if exists "Anyone can send a message" on public.messages;
create policy "Anyone can send a message"
  on public.messages
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Authenticated admins can read messages" on public.messages;
create policy "Authenticated admins can read messages"
  on public.messages
  for select
  to authenticated
  using (true);

drop policy if exists "Authenticated admins can delete messages" on public.messages;
create policy "Authenticated admins can delete messages"
  on public.messages
  for delete
  to authenticated
  using (true);

-- Cleanup policy: even an anonymous visitor may remove a row that has already
-- outlived the 7-day window. Nothing recent can be touched.
drop policy if exists "Expired messages can be cleaned up" on public.messages;
create policy "Expired messages can be cleaned up"
  on public.messages
  for delete
  to anon, authenticated
  using (created_at < now() - interval '7 days');

-- -------------------------------------------------------- storage.objects
drop policy if exists "Resource files are publicly readable" on storage.objects;
create policy "Resource files are publicly readable"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'resources');

drop policy if exists "Authenticated admins can upload resource files" on storage.objects;
create policy "Authenticated admins can upload resource files"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'resources');

drop policy if exists "Authenticated admins can update resource files" on storage.objects;
create policy "Authenticated admins can update resource files"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'resources')
  with check (bucket_id = 'resources');

drop policy if exists "Authenticated admins can delete resource files" on storage.objects;
create policy "Authenticated admins can delete resource files"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'resources');


-- ============================================================================
-- 6. ADMIN ACCOUNT (AUTO-SEED)
-- ============================================================================
--
-- Creates a confirmed Supabase Auth user:
--   email    : viewpointpublicschoolofficial@gmail.com
--   password : manjusensei   (stored as a bcrypt hash by crypt/gen_salt)
--
-- The app normalises both fields to lowercase before signInWithPassword, so
-- ManjuSensei / MANJUSENSEI / Manjusensei all authenticate.
--
-- If a future Supabase Auth schema change blocks this block, the migration still
-- completes and prints a notice. Create the user manually in
-- Authentication -> Users -> Add user (see MOBILE_SETUP_GUIDE.md, Step 2).

do $$
declare
  admin_email    text := 'viewpointpublicschoolofficial@gmail.com';
  admin_password text := 'manjusensei';
  admin_id       uuid;
  identity_id    uuid;
begin
  select id into admin_id from auth.users where email = admin_email limit 1;

  if admin_id is null then
    admin_id := gen_random_uuid();

    insert into auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      confirmation_token,
      recovery_token,
      email_change_token_new,
      email_change,
      email_change_token_current,
      reauthentication_token
    ) values (
      '00000000-0000-0000-0000-000000000000',
      admin_id,
      'authenticated',
      'authenticated',
      admin_email,
      crypt(admin_password, gen_salt('bf')),
      now(),
      now(),
      now(),
      jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')),
      jsonb_build_object('full_name', 'Manju Sensei', 'role', 'admin'),
      '',
      '',
      '',
      '',
      '',
      ''
    );

    raise notice 'Created admin auth user %', admin_email;
  else
    -- Reset the password to the canonical lowercase value and confirm the email.
    update auth.users
       set encrypted_password = crypt(admin_password, gen_salt('bf')),
           email_confirmed_at = coalesce(email_confirmed_at, now()),
           updated_at         = now()
     where id = admin_id;

    raise notice 'Admin auth user already existed — password reset and email confirmed.';
  end if;

  select id into identity_id
    from auth.identities
   where user_id = admin_id and provider = 'email'
   limit 1;

  if identity_id is null then
    insert into auth.identities (
      id,
      user_id,
      provider_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    ) values (
      gen_random_uuid(),
      admin_id,
      admin_id::text,
      jsonb_build_object(
        'sub', admin_id::text,
        'email', admin_email,
        'email_verified', true
      ),
      'email',
      now(),
      now(),
      now()
    );
  else
    update auth.identities
       set identity_data = jsonb_build_object(
             'sub', admin_id::text,
             'email', admin_email,
             'email_verified', true
           ),
           updated_at = now()
     where id = identity_id;
  end if;
exception
  when others then
    raise notice
      'Admin auto-seed skipped (%). Create the user manually in Authentication -> Users with email % and a lowercase password.',
      sqlerrm, admin_email;
end
$$;


-- ============================================================================
-- 7. VERIFY (optional — run these manually in the SQL Editor)
-- ============================================================================
--
-- select count(*) as resource_rows from public.resources;
-- select count(*) as message_rows  from public.messages;
-- select email, email_confirmed_at from auth.users
--  where email = 'viewpointpublicschoolofficial@gmail.com';
-- select id, name, public, file_size_limit from storage.buckets where id = 'resources';
-- select jobname, schedule from cron.job where jobname = 'purge-expired-messages';
--
-- ============================================================================
