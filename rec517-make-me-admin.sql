-- REC 517: give a login access to the Admin page.
-- 1) First create the login: Authentication > Users > Add user (tick "Auto Confirm User").
-- 2) Change the email below to that login's email, then run this in SQL Editor.
insert into public.admins (user_id)
select id from auth.users where email = lower('sapdevelopmentsolutions@gmail.com')
on conflict (user_id) do nothing;

-- Check: this should list the admin email(s).
select u.email from public.admins a join auth.users u on u.id = a.user_id;
