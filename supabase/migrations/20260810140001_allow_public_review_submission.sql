-- Lets a customer submit a review from the product page without an
-- account, same "public can write, only admins can read back the full
-- picture" shape as the newsletter_subscribers insert policy. The
-- `with check (approved = false)` clause is the actual moderation
-- gate — it blocks a public insert from ever setting approved = true
-- directly, regardless of what the client sends, so every public
-- submission lands in the pending queue for /admin/reviews.
create policy "Public can submit reviews pending approval"
  on public.reviews for insert
  to anon, authenticated
  with check (approved = false);
