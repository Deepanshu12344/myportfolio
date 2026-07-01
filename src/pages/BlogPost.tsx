import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Calendar,
  Tag,
  Share2,
  Link2,
  Check,
  ChevronRight,
  List,
} from 'lucide-react';
import { fetchPostBySlug, fetchPublishedPosts } from '../lib/posts';
import type { BlogPost } from '../lib/supabase';
import { renderMarkdown, estimateReadingTime, type TocItem } from '../lib/markdown';

const difficultyColor: Record<string, string> = {
  Easy: 'text-term-green border-term-green/30 bg-term-green/5',
  Medium: 'text-term-amber border-term-amber/30 bg-term-amber/5',
  Hard: 'text-term-red border-term-red/30 bg-term-red/5',
  Insane: 'text-term-blue-bright border-term-blue/30 bg-term-blue/5',
};

export default function BlogPostPage() {
  const { slug } = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [progress, setProgress] = useState(0);
  const [activeHeading, setActiveHeading] = useState<string>('');
  const [copied, setCopied] = useState<string | null>(null);
  const [shared, setShared] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    fetchPostBySlug(slug ?? '')
      .then((p) => setPost(p))
      .finally(() => setLoading(false));
    fetchPublishedPosts().then(setAllPosts);
  }, [slug]);

  const { html, toc } = useMemo(() => {
    if (!post?.content) return { html: '', toc: [] as TocItem[] };
    return renderMarkdown(post.content);
  }, [post]);

  // Reading progress
  useEffect(() => {
    const onScroll = () => {
      const el = contentRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      const scrolled = Math.min(Math.max(-rect.top, 0), total);
      setProgress(total > 0 ? (scrolled / total) * 100 : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [post]);

  // Active heading tracking
  useEffect(() => {
    if (!toc.length) return;
    const headings = toc
      .map((t) => document.getElementById(t.id))
      .filter(Boolean) as HTMLElement[];
    if (!headings.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveHeading(visible[0].target.id);
      },
      { rootMargin: '-100px 0px -70% 0px' },
    );
    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [toc]);

  // Code copy buttons + copy feedback
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const buttons = el.querySelectorAll<HTMLButtonElement>('.copy-btn');
    const handlers: Array<() => void> = [];
    buttons.forEach((btn) => {
      const handler = async () => {
        const id = btn.dataset.codeId;
        const pre = id ? document.getElementById(id) : null;
        if (!pre) return;
        try {
          await navigator.clipboard.writeText(pre.innerText);
          setCopied(id ?? 'copied');
          setTimeout(() => setCopied(null), 1500);
        } catch {
          /* ignore */
        }
      };
      btn.addEventListener('click', handler);
      handlers.push(() => btn.removeEventListener('click', handler));
    });
    return () => handlers.forEach((h) => h());
  }, [html]);

  const related = useMemo(() => {
    if (!post) return [];
    return allPosts
      .filter((p) => p.slug !== post.slug && p.category === post.category)
      .slice(0, 2);
  }, [allPosts, post]);

  const { prev, next } = useMemo(() => {
    if (!post) return { prev: null, next: null };
    const idx = allPosts.findIndex((p) => p.slug === post.slug);
    return {
      prev: idx > 0 ? allPosts[idx - 1] : null,
      next: idx >= 0 && idx < allPosts.length - 1 ? allPosts[idx + 1] : null,
    };
  }, [allPosts, post]);

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShared(true);
      setTimeout(() => setShared(false), 1500);
    } catch {
      /* ignore */
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-24">
        <div className="glass h-96 animate-pulse rounded-xl" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-24 text-center">
        <div className="terminal-text text-sm text-term-red">$ cat: post: No such file or directory</div>
        <Link to="/blogs" className="btn-ghost mt-6">
          <ArrowLeft size={15} /> back to archive
        </Link>
      </div>
    );
  }

  const readingTime = estimateReadingTime(post.content);

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
      {/* Reading progress bar */}
      <div className="fixed left-0 top-16 z-30 h-0.5 w-full bg-transparent">
        <div className="reading-progress h-full transition-[width] duration-150" style={{ width: `${progress}%` }} />
      </div>

      <Link
        to="/blogs"
        className="terminal-text mb-8 inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-term-green transition-colors"
      >
        <ArrowLeft size={14} /> cd ../blogs
      </Link>

      <div className="grid gap-10 lg:grid-cols-[1fr_220px]">
        <article className="min-w-0">
          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="terminal-text flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded bg-term-green/10 px-2 py-0.5 text-term-green">{post.category}</span>
              {post.platform && (
                <span className="rounded bg-term-blue/10 px-2 py-0.5 text-term-blue">{post.platform}</span>
              )}
              {post.difficulty && (
                <span className={`rounded border px-2 py-0.5 ${difficultyColor[post.difficulty] ?? ''}`}>
                  {post.difficulty}
                </span>
              )}
            </div>
            <h1 className="terminal-text mt-4 text-3xl font-bold leading-tight text-zinc-100 sm:text-4xl">
              {post.title}
            </h1>
            {post.excerpt && <p className="mt-3 text-lg leading-relaxed text-zinc-400">{post.excerpt}</p>}
            <div className="terminal-text mt-5 flex flex-wrap items-center gap-4 text-xs text-zinc-500">
              <span className="inline-flex items-center gap-1.5">
                <Calendar size={12} /> {formatDate(post.published_at ?? post.created_at)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock size={12} /> {readingTime} min read
              </span>
              <button
                onClick={share}
                className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-term-green transition-colors"
              >
                {shared ? <Check size={12} className="text-term-green" /> : <Share2 size={12} />}
                {shared ? 'link copied' : 'share'}
              </button>
            </div>
            <div className="mt-4 h-px bg-white/10" />
          </motion.header>

          {/* Content */}
          <div
            ref={contentRef}
            className="prose-term mt-8 min-w-0"
            dangerouslySetInnerHTML={{ __html: html }}
          />

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="mt-10 flex flex-wrap items-center gap-2 border-t border-white/5 pt-6">
              <Tag size={13} className="text-zinc-600" />
              {post.tags.map((t) => (
                <span key={t} className="chip">
                  #{t}
                </span>
              ))}
            </div>
          )}

          {/* Prev / Next */}
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {prev ? (
              <Link
                to={`/blog/${prev.slug}`}
                className="glass card-hover group rounded-xl p-4 hover:border-term-green/25"
              >
                <div className="terminal-text flex items-center gap-1 text-[11px] text-zinc-500">
                  <ArrowLeft size={11} /> previous
                </div>
                <div className="mt-1 text-sm font-medium text-zinc-200 group-hover:text-term-green transition-colors">
                  {prev.title}
                </div>
              </Link>
            ) : (
              <div />
            )}
            {next ? (
              <Link
                to={`/blog/${next.slug}`}
                className="glass card-hover group rounded-xl p-4 text-right hover:border-term-green/25"
              >
                <div className="terminal-text flex items-center justify-end gap-1 text-[11px] text-zinc-500">
                  next <ArrowRight size={11} />
                </div>
                <div className="mt-1 text-sm font-medium text-zinc-200 group-hover:text-term-green transition-colors">
                  {next.title}
                </div>
              </Link>
            ) : (
              <div />
            )}
          </div>

          {/* Related */}
          {related.length > 0 && (
            <div className="mt-12">
              <div className="terminal-text mb-4 text-xs text-zinc-500">
                <span className="text-term-green">$</span> related --category="{post.category}"
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {related.map((r) => (
                  <Link
                    key={r.slug}
                    to={`/blog/${r.slug}`}
                    className="glass card-hover group flex items-center gap-3 rounded-xl p-4 hover:border-term-blue/25"
                  >
                    {r.featured_image && (
                      <img src={r.featured_image} alt="" className="h-12 w-12 rounded object-cover opacity-60" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-zinc-200 group-hover:text-term-blue transition-colors">
                        {r.title}
                      </div>
                      <div className="terminal-text text-[11px] text-zinc-500">{r.category}</div>
                    </div>
                    <ChevronRight size={14} className="text-zinc-600 group-hover:text-term-blue transition-colors" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </article>

        {/* TOC sidebar */}
        {toc.length > 0 && (
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <div className="terminal-text mb-3 flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-zinc-500">
                <List size={12} /> table of contents
              </div>
              <nav className="space-y-1 border-l border-white/5">
                {toc.map((t) => (
                  <a
                    key={t.id}
                    href={`#${t.id}`}
                    className={`terminal-text block border-l-2 py-1 text-xs transition-colors ${
                      activeHeading === t.id
                        ? 'border-term-green text-term-green'
                        : 'border-transparent text-zinc-500 hover:text-zinc-300'
                    }`}
                    style={{ paddingLeft: `${(t.level - 1) * 10 + 12}px` }}
                  >
                    {t.text}
                  </a>
                ))}
              </nav>
              <button
                onClick={share}
                className="terminal-text mt-6 inline-flex items-center gap-1.5 text-[11px] text-zinc-500 hover:text-term-green transition-colors"
              >
                <Link2 size={11} /> copy link
              </button>
            </div>
          </aside>
        )}
      </div>

      {/* Copy toast */}
      {copied && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-md border border-term-green/30 bg-base-800 px-4 py-2 text-xs terminal-text text-term-green shadow-glow-green">
          <Check size={12} className="mr-1.5 inline" /> copied to clipboard
        </div>
      )}
    </div>
  );
}

function formatDate(d: string): string {
  try {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return '';
  }
}
