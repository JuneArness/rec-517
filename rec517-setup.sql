-- REC 517: Events + Get Involved database and photo storage.
-- Run ONCE in Supabase > SQL Editor > New query on a NEW project. Paste everything, press Run.
-- Security model:
--   * The website only calls the functions below. Browsers never touch tables directly.
--   * Visitors can read PUBLISHED events and their photos, and send a Sponsor / Donate /
--     Volunteer form. That's all.
--   * Event photos live in a PUBLIC bucket (they're meant to be seen) but only admins
--     can upload, change or delete them.
--   * Admins are the logins listed in public.admins. Every admin function checks that.
-- Errors use the format "CODE|message".

-- ------------------------------------------------------------------ tables
create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(title) between 1 and 120),
  event_date date not null,
  end_date date,
  time_text text not null default '' check (length(time_text) <= 80),      -- e.g. "6:00 – 9:00 PM"
  location text not null default '' check (length(location) <= 160),
  summary text not null default '' check (length(summary) <= 400),
  details text not null default '' check (length(details) <= 4000),
  link_url text not null default '' check (link_url = '' or link_url ~ '^https://[^\s<>"]+$'),
  link_label text not null default '' check (length(link_label) <= 40),
  published boolean not null default false,
  cover_photo_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date is null or end_date >= event_date)
);

create table public.event_photos (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  path text not null unique,
  caption text not null default '' check (length(caption) <= 200),
  sort int not null default 0,
  created_at timestamptz not null default now()
);
create index event_photos_event on public.event_photos (event_id, sort);
alter table public.events add constraint events_cover_fk foreign key (cover_photo_id) references public.event_photos (id) on delete set null;

-- Sponsor / Donate / Volunteer forms (private: only admins can read)
create table public.requests (
  id uuid primary key default gen_random_uuid(),
  ref text not null unique,
  kind text not null check (kind in ('sponsor', 'donate', 'volunteer')),
  name text not null check (length(name) between 1 and 100),
  organization text not null default '' check (length(organization) <= 120),
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and length(email) <= 160),
  phone text not null default '' check (length(phone) <= 30),
  interests text[] not null default '{}',
  availability text[] not null default '{}',
  adult boolean,
  message text not null default '' check (length(message) <= 3000),
  status text not null default 'new' check (status in ('new', 'contacted', 'closed')),
  notes text not null default '' check (length(notes) <= 4000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index requests_created on public.requests (created_at desc);

create table public.audit_log (
  id bigint generated always as identity primary key,
  actor uuid,
  action text not null,
  target text not null default '',
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------------ security: no direct table access
alter table public.admins enable row level security;
alter table public.events enable row level security;
alter table public.event_photos enable row level security;
alter table public.requests enable row level security;
alter table public.audit_log enable row level security;
revoke all on all tables in schema public from anon, authenticated;

-- ------------------------------------------------------------------ photo storage
-- event-photos: PUBLIC to view. 10 MB per file, images only. Only admins can add/change/remove.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('event-photos', 'event-photos', true, 10485760, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create function public.is_admin() returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid()) $$;

create policy "admins manage event photos" on storage.objects for all to authenticated
  using (bucket_id = 'event-photos' and public.is_admin())
  with check (bucket_id = 'event-photos' and public.is_admin()
    and name ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/[A-Za-z0-9_-]{1,80}\.(jpg|jpeg|png|webp)$');

-- ------------------------------------------------------------------ helpers
create function public._require_admin() returns void language plpgsql stable security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'AUTH|Please sign in.'; end if;
  if not public.is_admin() then raise exception 'FORBIDDEN|Admin access only.'; end if;
end $$;

create function public._log(p_action text, p_target text) returns void language sql security definer set search_path = public as $$
  insert into public.audit_log (actor, action, target) values (auth.uid(), p_action, left(coalesce(p_target, ''), 200)) $$;

create function public._txt(p jsonb, k text, maxlen int) returns text language sql immutable set search_path = public as $$
  select left(trim(coalesce(p ->> k, '')), maxlen) $$;

-- A short list of picked options (checkboxes). Each must be in the allowed list.
create function public._picks(p jsonb, k text, allowed text[]) returns text[] language plpgsql immutable set search_path = public as $$
declare out text[] := '{}'; v text;
begin
  if p -> k is null or jsonb_typeof(p -> k) <> 'array' then return out; end if;
  for v in select jsonb_array_elements_text(p -> k) loop
    if not (v = any (allowed)) then raise exception 'INVALID|Unknown option: %', left(v, 60); end if;
    if not (v = any (out)) then out := out || v; end if;
  end loop;
  return out;
end $$;

create function public._date(p jsonb, k text) returns date language plpgsql immutable set search_path = public as $$
begin
  if coalesce(trim(p ->> k), '') = '' then return null; end if;
  if (p ->> k) !~ '^\d{4}-\d{2}-\d{2}$' then raise exception 'INVALID|Dates must look like 2026-05-30.'; end if;
  return (p ->> k)::date;
end $$;

create function public._photo_json(e uuid) returns jsonb language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object('id', id, 'path', path, 'caption', caption) order by sort, created_at), '[]')
  from public.event_photos where event_id = e $$;

-- ------------------------------------------------------------------ public (anyone)
create function public.list_events() returns jsonb language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object(
      'id', e.id, 'title', e.title, 'event_date', e.event_date, 'end_date', e.end_date, 'time_text', e.time_text,
      'location', e.location, 'summary', e.summary, 'details', e.details, 'link_url', e.link_url, 'link_label', e.link_label,
      'cover', (select path from public.event_photos where id = e.cover_photo_id),
      'photos', public._photo_json(e.id)) order by e.event_date desc, e.created_at desc), '[]')
  from public.events e where e.published $$;

create function public.submit_request(p jsonb) returns text language plpgsql security definer set search_path = public as $$
declare
  v_ref text; v_kind text := public._txt(p, 'kind', 20); v_email text := lower(public._txt(p, 'email', 160));
  v_interests text[]; v_avail text[]; v_adult boolean;
begin
  if public._txt(p, 'website', 200) <> '' then raise exception 'SPAM|Submission blocked.'; end if;   -- honeypot
  if v_kind not in ('sponsor', 'donate', 'volunteer') then raise exception 'INVALID|Unknown form.'; end if;
  if public._txt(p, 'name', 100) = '' then raise exception 'INVALID|Please enter your name.'; end if;
  if v_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'INVALID|Please enter a valid email address.'; end if;
  if public._txt(p, 'phone', 30) <> '' and regexp_replace(public._txt(p, 'phone', 30), '\D', '', 'g') !~ '^1?\d{10}$' then
    raise exception 'INVALID|Please enter a 10-digit phone number, or leave it blank.'; end if;
  if coalesce((p ->> 'consent')::boolean, false) is not true then raise exception 'INVALID|Please agree to be contacted.'; end if;
  if v_kind = 'sponsor' then
    v_interests := public._picks(p, 'interests', array['Court and facility naming rights', 'Event sponsorships', 'Facility branding',
      'Community program sponsorships', 'Vendor partnerships', 'Not sure yet']);
    if public._txt(p, 'organization', 120) = '' then raise exception 'INVALID|Please enter your business or organization.'; end if;
  elsif v_kind = 'donate' then
    v_interests := public._picks(p, 'interests', array['Money', 'Sports equipment', 'Services or supplies (in-kind)', 'Something else']);
  else
    v_interests := public._picks(p, 'interests', array['Event day help', 'Youth programs and mentoring', 'Coaching', 'Community outreach',
      'Setup and cleanup', 'Wherever needed']);
    v_avail := public._picks(p, 'availability', array['Weekdays', 'Weekday evenings', 'Weekends']);
    if p ->> 'adult' is null then raise exception 'INVALID|Please tell us if you are 18 or older.'; end if;
    v_adult := (p ->> 'adult')::boolean;
  end if;
  if coalesce(array_length(v_interests, 1), 0) = 0 then raise exception 'INVALID|Please choose at least one option.'; end if;
  -- rate limits: 5 per email per day, 60 site-wide per hour
  if (select count(*) from public.requests where lower(email) = v_email and created_at > now() - interval '1 day') >= 5 then
    raise exception 'LIMIT|We already have several forms from this email today. We will be in touch.'; end if;
  if (select count(*) from public.requests where created_at > now() - interval '1 hour') >= 60 then
    raise exception 'LIMIT|We are receiving a lot of forms right now. Please try again shortly.'; end if;
  loop
    v_ref := 'R517-' || to_char(now(), 'YYMMDD') || '-' || upper(substr(md5(gen_random_uuid()::text), 1, 5));
    exit when not exists (select 1 from public.requests where ref = v_ref);
  end loop;
  insert into public.requests (ref, kind, name, organization, email, phone, interests, availability, adult, message)
  values (v_ref, v_kind, public._txt(p, 'name', 100), public._txt(p, 'organization', 120), v_email, public._txt(p, 'phone', 30),
    v_interests, coalesce(v_avail, '{}'), v_adult, public._txt(p, 'message', 3000));
  return v_ref;
end $$;

-- ------------------------------------------------------------------ admin
create function public.admin_me() returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object('signed_in', auth.uid() is not null, 'is_admin', public.is_admin()) $$;

create function public.admin_overview() returns jsonb language plpgsql stable security definer set search_path = public as $$
begin
  perform public._require_admin();
  return jsonb_build_object(
    'events', coalesce((select jsonb_agg(jsonb_build_object('id', e.id, 'title', e.title, 'event_date', e.event_date, 'end_date', e.end_date,
        'published', e.published, 'photos', (select count(*) from public.event_photos ph where ph.event_id = e.id),
        'cover', (select path from public.event_photos where id = e.cover_photo_id)) order by e.event_date desc, e.created_at desc) from public.events e), '[]'),
    'requests', coalesce((select jsonb_agg(jsonb_build_object('id', id, 'ref', ref, 'kind', kind, 'name', name, 'organization', organization,
        'email', email, 'status', status, 'created_at', created_at) order by created_at desc) from public.requests), '[]'));
end $$;

create function public.admin_get_event(p_id uuid) returns jsonb language plpgsql stable security definer set search_path = public as $$
declare r jsonb;
begin
  perform public._require_admin();
  select to_jsonb(e) || jsonb_build_object('photos', public._photo_json(e.id)) into r from public.events e where e.id = p_id;
  if r is null then raise exception 'NOT_FOUND|Event not found.'; end if;
  return r;
end $$;

create function public.admin_save_event(p jsonb) returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid; v_start date := public._date(p, 'event_date'); v_end date := public._date(p, 'end_date');
begin
  perform public._require_admin();
  if public._txt(p, 'title', 120) = '' then raise exception 'INVALID|Please give the event a title.'; end if;
  if v_start is null then raise exception 'INVALID|Please choose the event date.'; end if;
  if v_end is not null and v_end < v_start then raise exception 'INVALID|The end date can’t be before the start date.'; end if;
  if v_end = v_start then v_end := null; end if;
  if public._txt(p, 'link_url', 500) <> '' and public._txt(p, 'link_url', 500) !~ '^https://[^\s<>"]+$' then
    raise exception 'INVALID|The link must start with https://'; end if;
  if nullif(p ->> 'id', '') is null then
    insert into public.events (title, event_date, end_date, time_text, location, summary, details, link_url, link_label, published)
    values (public._txt(p, 'title', 120), v_start, v_end, public._txt(p, 'time_text', 80), public._txt(p, 'location', 160),
      public._txt(p, 'summary', 400), public._txt(p, 'details', 4000), public._txt(p, 'link_url', 500), public._txt(p, 'link_label', 40),
      coalesce((p ->> 'published')::boolean, false))
    returning id into v_id;
    perform public._log('event.create', v_id::text);
  else
    update public.events set title = public._txt(p, 'title', 120), event_date = v_start, end_date = v_end,
      time_text = public._txt(p, 'time_text', 80), location = public._txt(p, 'location', 160), summary = public._txt(p, 'summary', 400),
      details = public._txt(p, 'details', 4000), link_url = public._txt(p, 'link_url', 500), link_label = public._txt(p, 'link_label', 40),
      published = coalesce((p ->> 'published')::boolean, false), updated_at = now()
    where id = (p ->> 'id')::uuid returning id into v_id;
    if v_id is null then raise exception 'NOT_FOUND|Event not found.'; end if;
    perform public._log('event.update', v_id::text);
  end if;
  return v_id;
end $$;

-- Returns the photo file paths so the admin page can remove the files from storage too.
create function public.admin_delete_event(p_id uuid) returns text[] language plpgsql security definer set search_path = public as $$
declare v_paths text[];
begin
  perform public._require_admin();
  select coalesce(array_agg(path), '{}') into v_paths from public.event_photos where event_id = p_id;
  update public.events set cover_photo_id = null where id = p_id;
  delete from public.events where id = p_id;
  if not found then raise exception 'NOT_FOUND|Event not found.'; end if;
  perform public._log('event.delete', p_id::text);
  return v_paths;
end $$;

-- After the browser uploads files into "<event id>/...", this records them on the event.
create function public.admin_add_photos(p_event uuid, p_paths text[]) returns jsonb
language plpgsql security definer set search_path = public, storage as $$
declare v text; v_sort int; v_first uuid; v_new uuid;
begin
  perform public._require_admin();
  if not exists (select 1 from public.events where id = p_event) then raise exception 'NOT_FOUND|Event not found.'; end if;
  if coalesce(array_length(p_paths, 1), 0) = 0 then return public._photo_json(p_event); end if;
  if array_length(p_paths, 1) > 50 then raise exception 'INVALID|Up to 50 photos at a time.'; end if;
  if (select count(*) from public.event_photos where event_id = p_event) + array_length(p_paths, 1) > 300 then
    raise exception 'INVALID|An event can hold up to 300 photos.'; end if;
  select coalesce(max(sort), 0) into v_sort from public.event_photos where event_id = p_event;
  foreach v in array p_paths loop
    if v !~ ('^' || p_event::text || '/[A-Za-z0-9_-]{1,80}\.(jpg|jpeg|png|webp)$') then raise exception 'INVALID|Photo path not allowed.'; end if;
    if not exists (select 1 from storage.objects o where o.bucket_id = 'event-photos' and o.name = v) then
      raise exception 'INVALID|A photo didn’t finish uploading. Please try again.'; end if;
    if exists (select 1 from public.event_photos where path = v) then continue; end if;
    v_sort := v_sort + 1;
    insert into public.event_photos (event_id, path, sort) values (p_event, v, v_sort) returning id into v_new;
    v_first := coalesce(v_first, v_new);
  end loop;
  update public.events set cover_photo_id = v_first, updated_at = now() where id = p_event and cover_photo_id is null and v_first is not null;
  perform public._log('photos.add', p_event::text);
  return public._photo_json(p_event);
end $$;

create function public.admin_update_photo(p_id uuid, p_caption text) returns void language plpgsql security definer set search_path = public as $$
begin
  perform public._require_admin();
  update public.event_photos set caption = left(trim(coalesce(p_caption, '')), 200) where id = p_id;
  if not found then raise exception 'NOT_FOUND|Photo not found.'; end if;
end $$;

-- p_dir: -1 = move earlier, 1 = move later
create function public.admin_move_photo(p_id uuid, p_dir int) returns void language plpgsql security definer set search_path = public as $$
declare me public.event_photos; other public.event_photos;
begin
  perform public._require_admin();
  select * into me from public.event_photos where id = p_id;
  if me.id is null then raise exception 'NOT_FOUND|Photo not found.'; end if;
  -- renumber first so every photo has a distinct position
  update public.event_photos ph set sort = x.rn from (
    select id, row_number() over (order by sort, created_at) as rn from public.event_photos where event_id = me.event_id) x
  where ph.id = x.id;
  select * into me from public.event_photos where id = p_id;
  select * into other from public.event_photos where event_id = me.event_id and sort = me.sort + sign(p_dir)::int;
  if other.id is null then return; end if;
  update public.event_photos set sort = other.sort where id = me.id;
  update public.event_photos set sort = me.sort where id = other.id;
end $$;

create function public.admin_set_cover(p_event uuid, p_photo uuid) returns void language plpgsql security definer set search_path = public as $$
begin
  perform public._require_admin();
  if not exists (select 1 from public.event_photos where id = p_photo and event_id = p_event) then raise exception 'NOT_FOUND|Photo not found.'; end if;
  update public.events set cover_photo_id = p_photo, updated_at = now() where id = p_event;
end $$;

-- Returns the file path so the admin page can remove the file from storage too.
create function public.admin_delete_photo(p_id uuid) returns text language plpgsql security definer set search_path = public as $$
declare v_path text; v_event uuid;
begin
  perform public._require_admin();
  delete from public.event_photos where id = p_id returning path, event_id into v_path, v_event;
  if v_path is null then raise exception 'NOT_FOUND|Photo not found.'; end if;
  update public.events set cover_photo_id = (select id from public.event_photos where event_id = v_event order by sort, created_at limit 1)
   where id = v_event and cover_photo_id is null;
  perform public._log('photo.delete', v_path);
  return v_path;
end $$;

create function public.admin_get_request(p_id uuid) returns jsonb language plpgsql stable security definer set search_path = public as $$
declare r jsonb;
begin
  perform public._require_admin();
  select to_jsonb(q) into r from public.requests q where q.id = p_id;
  if r is null then raise exception 'NOT_FOUND|Form not found.'; end if;
  return r;
end $$;

create function public.admin_update_request(p_id uuid, p_status text, p_notes text) returns void language plpgsql security definer set search_path = public as $$
begin
  perform public._require_admin();
  if p_status not in ('new', 'contacted', 'closed') then raise exception 'INVALID|Unknown status.'; end if;
  update public.requests set status = p_status, notes = left(coalesce(p_notes, ''), 4000), updated_at = now() where id = p_id;
  if not found then raise exception 'NOT_FOUND|Form not found.'; end if;
  perform public._log('request.update', p_id::text);
end $$;

create function public.admin_delete_request(p_id uuid) returns void language plpgsql security definer set search_path = public as $$
begin
  perform public._require_admin();
  delete from public.requests where id = p_id;
  if not found then raise exception 'NOT_FOUND|Form not found.'; end if;
  perform public._log('request.delete', p_id::text);
end $$;

create function public.admin_export_requests() returns jsonb language plpgsql stable security definer set search_path = public as $$
begin
  perform public._require_admin();
  return coalesce((select jsonb_agg(jsonb_build_object('ref', ref, 'type', kind, 'received', created_at, 'status', status, 'name', name,
    'organization', organization, 'email', email, 'phone', phone, 'interests', array_to_string(interests, '; '),
    'availability', array_to_string(availability, '; '), 'age_18_plus', adult, 'message', message, 'notes', notes) order by created_at desc)
    from public.requests), '[]');
end $$;

-- ------------------------------------------------------------------ who can call what
revoke execute on all functions in schema public from public, anon, authenticated;
grant execute on function public.list_events(), public.submit_request(jsonb), public.is_admin() to anon, authenticated;
grant execute on function public.admin_me(), public.admin_overview(), public.admin_get_event(uuid), public.admin_save_event(jsonb),
  public.admin_delete_event(uuid), public.admin_add_photos(uuid, text[]), public.admin_update_photo(uuid, text),
  public.admin_move_photo(uuid, int), public.admin_set_cover(uuid, uuid), public.admin_delete_photo(uuid),
  public.admin_get_request(uuid), public.admin_update_request(uuid, text, text), public.admin_delete_request(uuid),
  public.admin_export_requests() to authenticated;
alter default privileges in schema public revoke execute on functions from public, anon, authenticated;
