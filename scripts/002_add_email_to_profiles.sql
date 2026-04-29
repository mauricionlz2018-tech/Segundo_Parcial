alter table public.profiles
  add column if not exists email text;

create unique index if not exists profiles_email_key on public.profiles (email);

update public.profiles p
set email = u.email
from auth.users u
where u.id = p.id
  and p.email is null;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, username, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'role', 'alumno')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
