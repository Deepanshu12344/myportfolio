import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, Crosshair } from 'lucide-react';
import { fetchPublishedPosts } from '../lib/posts';
import type { BlogPost } from '../lib/supabase';
import SectionHeading from '../components/SectionHeading';

const difficultyColor: Record<string, string> = {
  Easy: 'text-term-green',
  Medium: 'text-term-blue',
  Hard: 'text-term-red',
  Insane: 'text-term-blue-bright',
};

export default function Writeups() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'Hack The Box' | 'TryHackMe'>('Hack The Box');

  useEffect(() => {
    fetchPublishedPosts()
      .then((all) => setPosts(all.filter((p) => p.platform === 'Hack The Box' || p.platform === 'TryHackMe')))
      .finally(() => setLoading(false));
  }, []);

  const filtered = posts.filter((p) => p.platform === tab);

  return (
    <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
      <SectionHeading label="~/writeups" title="Engagements" subtitle="HTB · THM · CTF" />
      <p className="terminal-text mt-4 max-w-2xl text-sm text-zinc-400">
        <span className="text-term-green">$</span> cat writeups/*.md | grep -A10 '## Enumeration'
      </p>

      <div className="mt-8 inline-flex rounded-lg border border-white/10 bg-base-850 p-1">
        {(['Hack The Box', 'TryHackMe'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`terminal-text rounded-md px-4 py-1.5 text-xs transition-colors ${
              tab === t ? 'bg-term-green/10 text-term-green' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass h-64 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-16 text-center">
          <Crosshair size={32} className="mx-auto text-zinc-700" />
          <div className="terminal-text mt-4 text-sm text-zinc-500">no {tab} writeups yet</div>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p, idx) => (
            <motion.div
              key={p.slug}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
            >
              <Link
                to={`/blog/${p.slug}`}
                className="card-hover group flex h-full flex-col rounded-xl p-5 transition-colors hover:border-term-green/25"
                style={{ background: 'var(--bg-card-solid)', border: '1px solid var(--border)' }}
              >
                <div className="flex items-center justify-between">
                  <div className="terminal-text flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-term-blue">
                    <span className="h-1.5 w-1.5 rounded-full bg-term-blue" />
                    {p.platform}
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
                  <p className="mt-2 flex-1 text-sm leading-relaxed line-clamp-3" style={{ color: 'var(--text-secondary)' }}>{p.excerpt}</p>
                )}
                <div className="terminal-text mt-5 flex items-center justify-between text-[11px]" style={{ color: 'var(--text-muted)' }}>
                  <span className="inline-flex items-center gap-1">
                    <Clock size={11} /> {estimateRead(p.content)} min read
                  </span>
                  <span className="inline-flex items-center gap-1 text-term-green">
                    read <ArrowRight size={12} />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function estimateRead(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}
