create extension if not exists "pgcrypto";

create table if not exists public.sales (
  id uuid primary key default gen_random_uuid(),
  item_name text not null,
  age text,
  quantity integer not null default 1,
  price_per_item numeric(10,2) not null,
  total numeric(10,2) not null,
  payment_method text,
  buyer_phone text,
  created_at timestamptz not null default now()
);

alter table public.sales enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'sales'
      and policyname = 'Allow read sales'
  ) then
    create policy "Allow read sales"
    on public.sales
    for select
    to anon, authenticated
    using (true);
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'sales'
      and policyname = 'Allow update sales'
  ) then
    create policy "Allow update sales"
    on public.sales
    for update
    to anon, authenticated
    using (true)
    with check (true);
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'sales'
      and policyname = 'Allow delete sales'
  ) then
    create policy "Allow delete sales"
    on public.sales
    for delete
    to anon, authenticated
    using (true);
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'sales'
      and policyname = 'Allow insert sales'
  ) then
    create policy "Allow insert sales"
    on public.sales
    for insert
    to anon, authenticated
    with check (true);
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'sales'
  ) then
    alter publication supabase_realtime add table public.sales;
  end if;
end
$$;
