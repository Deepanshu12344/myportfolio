import { createClient } from '@supabase/supabase-js';

// Kept here so the public portfolio works without requiring a local .env file.
// These are browser-safe Supabase project credentials (not a service-role key).
const url =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) ??
  'https://wzqanhofkhgquatxmujg.supabase.co';
const anonKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ??
  'sb_publishable_J3jVdbvVaqbWvKYtq25nGQ_i9d3X4Wt';

export const supabase = createClient(
  url,
  anonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
);

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  featured_image: string | null;
  category: string;
  tags: string[];
  difficulty: string | null;
  platform: string | null;
  status: 'draft' | 'published';
  published_at: string | null;
  author_id: string | null;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
};
