-- Tighten feedback insert: only allow inserts for businesses that are public
drop policy if exists "Anyone can submit feedback" on public.feedback;
create policy "Anyone can submit feedback to public businesses"
  on public.feedback for insert
  with check (
    exists (select 1 from public.businesses b where b.id = business_id and b.is_public = true)
  );

-- Lock down SECURITY DEFINER trigger function from being called via API
revoke execute on function public.handle_new_user() from public, anon, authenticated;