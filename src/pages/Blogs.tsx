import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Clock, ArrowRight, Filter, X, FileText } from 'lucide-react';
import { fetchPublishedPosts } from '../lib/posts';
import type { BlogPost } from '../lib/supabase';
import { blogCategories, difficulties, platforms } from '../data/portfolio';
import SectionHeading from '../components/SectionHeading';

const difficultyColor: Record<string, string> = {
  Easy: 'text-term-green',
  Medium: 'text-term-blue',
  Hard: 'text-term-red',
  Insane: 'text-term-blue-bright',
};

export default function Blogs() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [difficulty, setDifficulty] = useState<string>('all');
  const [platform, setPlatform] = useState<string>('all');
  const [year, setYear] = useState<string>('all');

  useEffect(() => {
    fetchPublishedPosts()
      .then(setPosts)
      .finally(() => setLoading(false));
  }, []);

  const years = useMemo(() => {
    const ys = new Set<string>();
    posts.forEach((p) => {
      if (p.published_at) ys.add(new Date(p.published_at).getFullYear().toString());
    });
    return Array.from(ys).sort((a, b) => Number(b) - Number(a));
  }, [posts]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((p) => {
      if (category !== 'all' && p.category !== category) return false;
      if (difficulty !== 'all' && p.difficulty !== difficulty) return false;
      if (platform !== 'all' && p.platform !== platform) return false;
      if (year !== 'all' && new Date(p.published_at ?? p.created_at).getFullYear().toString() !== year)
        return false;
      if (q) {
        const hay = (p.title + ' ' + (p.excerpt ?? '') + ' ' + p.tags.join(' ') + ' ' + p.category).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [posts, query, category, difficulty, platform, year]);

  const activeFilters = [category !== 'all', difficulty !== 'all', platform !== 'all', year !== 'all', query !== ''].filter(Boolean).length;

  const reset = () => {
    setQuery('');
    setCategory('all');
    setDifficulty('all');
    setPlatform('all');
    setYear('all');
  };

  return (
    <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
      <SectionHeading label="~/BLOG" title="Archive" subtitle="all writeups & notes" />
      <p className="terminal-text mt-4 max-w-2xl text-sm" style={{ color: 'var(--text-muted)' }}>
        <span className="text-term-green">$</span> ls -la ~/blog/ | grep -i $query
      </p>

      {/* Search + filters */}
      <div className="mt-8 glass rounded-xl p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-white/10 bg-base-850 px-3 py-2">
            <Search size={15} className="text-term-green" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="search posts…"
              className="terminal-text flex-1 bg-transparent text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-zinc-600 hover:text-zinc-300">
                <X size={14} />
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={category} onChange={setCategory} options={['all', ...blogCategories]} label="category" />
            <Select value={difficulty} onChange={setDifficulty} options={['all', ...difficulties]} label="difficulty" />
            <Select value={platform} onChange={setPlatform} options={['all', ...platforms]} label="platform" />
            <Select value={year} onChange={setYear} options={['all', ...years]} label="year" />
            {activeFilters > 0 && (
              <button
                onClick={reset}
                className="terminal-text inline-flex items-center gap-1.5 rounded-md border border-white/10 px-2.5 py-1.5 text-[11px] text-zinc-400 hover:border-term-red/30 hover:text-term-red transition-colors"
              >
                <X size={12} /> clear ({activeFilters})
              </button>
            )}
          </div>
        </div>
        <div className="terminal-text mt-3 flex items-center gap-2 text-[11px] text-zinc-600">
          <Filter size={11} />
          {filtered.length} {filtered.length === 1 ? 'post' : 'posts'} found
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass h-72 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-16 text-center">
          <FileText size={32} className="mx-auto text-zinc-700" />
          <div className="terminal-text mt-4 text-sm text-zinc-500">no posts match your filters</div>
          <button onClick={reset} className="btn-ghost mt-5">
            reset filters
          </button>
        </div>
      ) : (
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p, idx) => (
            <motion.div
              key={p.slug}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4, delay: Math.min(idx * 0.04, 0.3) }}
            >
              <Link
                to={`/blog/${p.slug}`}
                className="card-hover group flex h-full flex-col rounded-xl p-5 transition-colors hover:border-term-green/25"
                style={{ background: 'var(--bg-card-solid)', border: '1px solid var(--border)' }}
              >
                <div className="flex items-center justify-between">
                  <div className="terminal-text flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-term-green">
                    <span className="h-1.5 w-1.5 rounded-full bg-term-green" />
                    {p.category}
                  </div>
                  {p.difficulty && (
                    <span className={`terminal-text text-[10px] uppercase tracking-wider font-medium ${difficultyColor[p.difficulty] ?? 'text-term-blue'}`}>
                      {p.difficulty}
                    </span>
                  )}
                </div>
                <h3 className="mt-3 text-lg font-bold leading-snug transition-colors group-hover:text-term-green" style={{ color: 'var(--text-primary)' }}>
                  {p.title}
                </h3>
                {p.excerpt && (
                  <p className="mt-2 flex-1 text-sm leading-relaxed line-clamp-3" style={{ color: 'var(--text-secondary)' }}>
                    {p.excerpt}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {p.tags.slice(0, 3).map((t) => (
                    <span key={t} className="chip text-[10px]">
                      #{t}
                    </span>
                  ))}
                </div>
                <div className="terminal-text mt-5 flex items-center justify-between text-[11px]" style={{ color: 'var(--text-muted)' }}>
                  <span>{formatDate(p.published_at ?? p.created_at)}</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock size={11} /> {estimateRead(p.content)} min read
                  </span>
                </div>
                <div className="terminal-text mt-3 inline-flex items-center gap-1 text-xs text-term-green">
                  open <ArrowRight size={12} />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  label: string;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="terminal-text cursor-pointer appearance-none rounded-md border border-white/10 bg-base-850 py-1.5 pl-2.5 pr-7 text-[11px] text-zinc-300 transition-colors hover:border-white/25 focus:border-term-green/40 focus:outline-none"
      >
        {options.map((o) => (
          <option key={o} value={o} className="bg-base-850 text-zinc-200">
            {o === 'all' ? `all ${label}` : o}
          </option>
        ))}
      </select>
      <span className="terminal-text pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-zinc-600">
        ▾
      </span>
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

function estimateRead(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}
