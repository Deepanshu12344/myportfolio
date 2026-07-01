/*
# Create blog_posts table for the cybersecurity blog platform

## Overview
Adds a single `blog_posts` table that stores markdown-based blog posts and
HTB/THM writeups. Public visitors (anon role) can read posts that have been
published; only the authenticated admin owner can create, edit, or delete them.

## New Tables
- `blog_posts`
  - `id` uuid primary key (default gen_random_uuid())
  - `slug` text, unique, not null — URL-friendly identifier used in routes
  - `title` text, not null
  - `excerpt` text, nullable — short summary shown on cards
  - `content` text, not null — full markdown body of the post
  - `featured_image` text, nullable — URL to a cover image
  - `category` text, not null — e.g. "Hack The Box", "Web Security"
  - `tags` text[] default '{}' — flexible list of tags
  - `difficulty` text, nullable — "Easy" | "Medium" | "Hard" | "Insane"
  - `platform` text, nullable — "Hack The Box" | "TryHackMe" | "Labs" | null
  - `status` text, not null default 'draft' — 'draft' | 'published'
  - `published_at` timestamptz, nullable — set when a draft is published
  - `author_id` uuid, not null, default auth.uid() — owner of the post
  - `seo_title` text, nullable
  - `seo_description` text, nullable
  - `created_at` timestamptz default now()
  - `updated_at` timestamptz default now()

## Indexes
- unique index on `slug` (also enforced by unique constraint)
- index on `status` for filtering published vs draft
- index on `category` for category pages
- index on `published_at desc` for archive ordering

## Security (RLS)
- RLS enabled on `blog_posts`.
- SELECT policy (anon + authenticated): a row is visible if it is published
  OR the requesting user is its owner. Drafts are only visible to the owner.
- INSERT policy (authenticated only): owner must match auth.uid().
- UPDATE policy (authenticated only): owner must match auth.uid() (both USING
  and WITH CHECK).
- DELETE policy (authenticated only): owner must match auth.uid().

## Notes
1. `author_id` defaults to `auth.uid()` so the admin client can insert a new
   post without explicitly passing an owner; the database fills it from the
   authenticated session and the INSERT WITH CHECK passes.
2. Public visitors use the anon key and can only see `status = 'published'`.
3. The admin (authenticated) sees both drafts and published posts.
*/

CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  excerpt text,
  content text NOT NULL DEFAULT '',
  featured_image text,
  category text NOT NULL DEFAULT 'Notes',
  tags text[] NOT NULL DEFAULT '{}',
  difficulty text,
  platform text,
  status text NOT NULL DEFAULT 'draft',
  published_at timestamptz,
  author_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  seo_title text,
  seo_description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS blog_posts_status_idx ON blog_posts (status);
CREATE INDEX IF NOT EXISTS blog_posts_category_idx ON blog_posts (category);
CREATE INDEX IF NOT EXISTS blog_posts_published_at_idx ON blog_posts (published_at DESC);

-- SELECT: published posts are public; drafts visible to owner only
DROP POLICY IF EXISTS "read_blog_posts" ON blog_posts;
CREATE POLICY "read_blog_posts"
ON blog_posts FOR SELECT
TO anon, authenticated
USING (status = 'published' OR auth.uid() = author_id);

-- INSERT: only authenticated owner, owner must match session
DROP POLICY IF EXISTS "insert_own_blog_posts" ON blog_posts;
CREATE POLICY "insert_own_blog_posts"
ON blog_posts FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = author_id);

-- UPDATE: only owner
DROP POLICY IF EXISTS "update_own_blog_posts" ON blog_posts;
CREATE POLICY "update_own_blog_posts"
ON blog_posts FOR UPDATE
TO authenticated
USING (auth.uid() = author_id)
WITH CHECK (auth.uid() = author_id);

-- DELETE: only owner
DROP POLICY IF EXISTS "delete_own_blog_posts" ON blog_posts;
CREATE POLICY "delete_own_blog_posts"
ON blog_posts FOR DELETE
TO authenticated
USING (auth.uid() = author_id);

-- Auto-update updated_at on row change
DROP TRIGGER IF EXISTS blog_posts_set_updated_at ON blog_posts;
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER blog_posts_set_updated_at
BEFORE UPDATE ON blog_posts
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
