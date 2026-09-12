-- QUINZOWORK: perfil, roles e RLS
-- Execute no Supabase SQL Editor. Esta migration não contém segredos.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  role text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_role_check check (role is null or role in ('freelancer', 'job_seeker', 'remote_worker', 'creator', 'business'))
);

alter table public.profiles enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can create own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;

create policy "Users can view own profile" on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "Users can create own profile" on public.profiles for insert to authenticated with check ((select auth.uid()) = id);
create policy "Users can update own profile" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'))
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
 create trigger on_auth_user_created
   after insert on auth.users
   for each row execute procedure public.handle_new_user();

-- Permissões necessárias para o cliente Supabase consultar a tabela; o RLS limita as linhas.
grant select, insert, update on table public.profiles to authenticated;

-- Perfis já existentes (incluindo utilizadores criados antes desta migration).
insert into public.profiles (id, full_name)
select id, coalesce(raw_user_meta_data ->> 'full_name', raw_user_meta_data ->> 'name')
from auth.users
on conflict (id) do nothing;

-- Atualização segura do timestamp em alterações.
create or replace function public.set_profiles_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute procedure public.set_profiles_updated_at();

-- Verificação opcional: deve retornar a tabela, RLS=true e as três policies acima.
-- select relname, relrowsecurity from pg_class where relname = 'profiles';
-- select policyname, cmd from pg_policies where tablename = 'profiles';
