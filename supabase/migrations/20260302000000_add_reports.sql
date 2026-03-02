create table if not exists public.reports (
    id               uuid primary key default gen_random_uuid(),
    reporter_id      uuid references auth.users(id) on delete set null,
    book_id          uuid references public.books(id) on delete cascade,
    reported_user_id uuid,
    reason           text not null check (reason in ('inappropriate', 'spam', 'copyright', 'other')),
    details          text,
    created_at       timestamptz default now()
);

alter table public.reports enable row level security;

create policy "Users can insert reports"
    on public.reports for insert
    with check (auth.uid() = reporter_id);

create policy "Users can view own reports"
    on public.reports for select
    using (auth.uid() = reporter_id);
