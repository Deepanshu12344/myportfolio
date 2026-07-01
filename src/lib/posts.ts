import { supabase, type BlogPost } from './supabase';
import { seedPosts } from '../data/seedPosts';

// Fetch all published posts. Falls back to local seed data if the DB is
// unreachable or empty, so the blog always has content.
export async function fetchPublishedPosts(): Promise<BlogPost[]> {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false });
    if (error) throw error;
    if (!data || data.length === 0) return seedFallback();
    return mergeWithSeed(data as BlogPost[]);
  } catch {
    return seedFallback();
  }
}

export async function fetchPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      const seed = seedPosts.find((p) => p.slug === slug);
      return seed ? (seedToBlogPost(seed) as BlogPost) : null;
    }
    const post = data as BlogPost;
    if (!post.content || post.content.trim() === '') {
      const seed = seedPosts.find((p) => p.slug === slug);
      if (seed) post.content = seed.content;
    }
    return post;
  } catch {
    const seed = seedPosts.find((p) => p.slug === slug);
    return seed ? (seedToBlogPost(seed) as BlogPost) : null;
  }
}

// Admin: fetch all posts (drafts + published). Requires authenticated session.
export async function fetchAllPostsAdmin(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as BlogPost[];
}

function seedFallback(): BlogPost[] {
  return seedPosts.map((p) => seedToBlogPost(p) as BlogPost);
}

// If a DB row has empty content, fill it from the local seed of the same slug
// so the rich writeup markdown is shown.
function mergeWithSeed(rows: BlogPost[]): BlogPost[] {
  return rows.map((row) => {
    if (!row.content || row.content.trim() === '') {
      const seed = seedPosts.find((p) => p.slug === row.slug);
      if (seed) row.content = seed.content;
    }
    return row;
  });
}

function seedToBlogPost(seed: (typeof seedPosts)[number]): Omit<BlogPost, 'id' | 'author_id' | 'seo_title' | 'seo_description' | 'created_at' | 'updated_at'> & Partial<BlogPost> {
  return {
    slug: seed.slug,
    title: seed.title,
    excerpt: seed.excerpt,
    content: seed.content,
    featured_image: seed.featured_image,
    category: seed.category,
    tags: seed.tags,
    difficulty: seed.difficulty,
    platform: seed.platform,
    status: 'published',
    published_at: seed.published_at,
    id: '',
    author_id: null,
    seo_title: null,
    seo_description: null,
    created_at: seed.published_at,
    updated_at: seed.published_at,
  };
}
