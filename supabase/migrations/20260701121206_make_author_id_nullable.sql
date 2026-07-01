/*
# Make blog_posts.author_id nullable for seeding

## Why
The initial seed of demo blog posts is inserted via a privileged SQL context
that has no authenticated session, so `auth.uid()` returns NULL and the
`NOT NULL` constraint on `author_id` rejects the insert. Published posts are
intended to be publicly readable regardless of author, so a NULL author on
seeded content is acceptable.

## Changes
- `blog_posts.author_id` is now nullable (was `NOT NULL`).

## Security impact
- SELECT policy: `status = 'published' OR auth.uid() = author_id`. Published
  posts with NULL author are still readable (the first clause is true). Drafts
  with NULL author are not readable by anon (both clauses false). No change to
  public readability.
- INSERT/UPDATE/DELETE policies: still require `auth.uid() = author_id`. The
  admin, when signed in, inserts with `author_id` defaulting to `auth.uid()`
  (populated), so ownership checks pass. NULL-author seed rows cannot be
  modified by anyone through RLS — they are effectively read-only demo data,
  which is the desired behavior.

## Notes
1. This is a constraint relaxation, not a destructive change. No data is lost.
2. The admin can still fully CRUD their own posts created through the app.
*/

ALTER TABLE blog_posts ALTER COLUMN author_id DROP NOT NULL;
