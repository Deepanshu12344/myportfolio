import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Download, Clock, Github, Linkedin } from 'lucide-react';
import InteractiveTerminal from '../components/InteractiveTerminal';
import SectionHeading from '../components/SectionHeading';
import { profile, projects } from '../data/portfolio';
import { fetchPublishedPosts } from '../lib/posts';
import type { BlogPost } from '../lib/supabase';

const difficultyStyle: Record<string, string> = {
  Easy: 'text-term-green',
  Medium: 'text-term-blue',
  Hard: 'text-term-red',
  Insane: 'text-term-blue-bright',
};

function formatDate(d: string): string {
  try {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch { return ''; }
}
function readTime(content: string): number {
  return Math.max(1, Math.round(content.trim().split(/\s+/).length / 200));
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
};

export default function Home() {
  const [posts, setPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    fetchPublishedPosts().then((p) => setPosts(p.slice(0, 3)));
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-5 sm:px-8">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="grid items-center gap-10 py-16 lg:grid-cols-2 lg:py-24">
        <motion.div variants={fadeUp} initial="hidden" animate="show">
          <div className="terminal-text mb-5 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs" style={{ borderColor: 'var(--border-strong)', color: 'var(--text-muted)' }}>
            <span className="h-1.5 w-1.5 rounded-full bg-term-green animate-pulseGlow" />
            session established · encrypted
          </div>
          <h1 className="terminal-text text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Hi, I'm{' '}
            <span className="text-term-green">Deepanshu Sharma</span>
          </h1>
          <p className="terminal-text mt-5 text-sm sm:text-base">
            <span className="text-term-blue">Cybersecurity Researcher</span>
            <span className="mx-2" style={{ color: 'var(--border-strong)' }}>|</span>
            <span className="text-term-blue">Penetration Tester</span>
            <span className="mx-2" style={{ color: 'var(--border-strong)' }}>|</span>
            <span className="text-term-blue">CTF Player</span>
            <span className="mx-2" style={{ color: 'var(--border-strong)' }}>|</span>
            <span className="text-term-blue">Security Engineer</span>
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={profile.socials.github} target="_blank" rel="noreferrer" className="btn-primary">
              <Github size={15} /> GitHub
            </a>
            <a href={profile.socials.linkedin} target="_blank" rel="noreferrer" className="btn-ghost">
              <Linkedin size={15} /> LinkedIn
            </a>
            <a href="/Deepanshu_Resume_Cybersec.pdf%20(1).pdf" className="btn-ghost" download="Deepanshu_Resume_Cybersec.pdf (1).pdf">
              <Download size={15} /> Resume
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          <InteractiveTerminal />
        </motion.div>
      </section>

      {/* ── About section ─────────────────────────────────────────── */}
      <section className="py-16">
        <SectionHeading
          label="~/about"
          title="whoami"
          subtitle="background & skills"
          action={{ label: 'full page', href: '/about' }}
        />

        <div className="mt-8">
          {/* Bio block */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.4 }}
          >
            <div
              className="card-hover group rounded-xl p-6 transition-colors hover:border-term-blue/25 sm:p-7"
              style={{ background: 'var(--bg-card-solid)', border: '1px solid var(--border)' }}
            >
              <div className="terminal-text flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-term-blue">
                <span className="h-1.5 w-1.5 rounded-full bg-term-blue" />
                bio
              </div>
              <p className="mt-4 max-w-4xl text-sm leading-7 sm:text-base" style={{ color: 'var(--text-secondary)' }}>
                {profile.bio}
              </p>
              <div className="terminal-text mt-4 space-y-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                <div>
                  <span>location</span>
                  <span className="mx-1.5" style={{ color: 'var(--border-strong)' }}>·</span>
                  <span style={{ color: 'var(--text-primary)' }}>{profile.location}</span>
                </div>
                <div>
                  <span>focus</span>
                  <span className="mx-1.5" style={{ color: 'var(--border-strong)' }}>·</span>
                  <span style={{ color: 'var(--text-primary)' }}>{profile.focus.join(', ')}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Blog section — exactly as image ──────────────────────── */}
      <section className="py-16">
        <SectionHeading
          label="~/BLOG"
          title="Latest research"
          subtitle="fresh writeups & notes"
          action={{ label: 'view all', href: '/blogs' }}
        />

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {posts.length === 0
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-64 animate-pulse rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }} />
              ))
            : posts.map((post, idx) => (
                <motion.div
                  key={post.slug}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.4, delay: idx * 0.06 }}
                >
                  <Link
                    to={`/blog/${post.slug}`}
                    className="card-hover group flex h-full flex-col rounded-xl p-5 transition-colors hover:border-term-green/25"
                    style={{ background: 'var(--bg-card-solid)', border: '1px solid var(--border)' }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="terminal-text flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-term-green">
                        <span className="h-1.5 w-1.5 rounded-full bg-term-green" />
                        {post.category}
                      </div>
                      {post.difficulty && (
                        <span className={`terminal-text text-[10px] uppercase tracking-wider font-medium ${difficultyStyle[post.difficulty] ?? 'text-term-blue'}`}>
                          {post.difficulty}
                        </span>
                      )}
                    </div>
                    <h3 className="mt-3 text-lg font-bold leading-snug transition-colors group-hover:text-term-green" style={{ color: 'var(--text-primary)' }}>
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="mt-2 flex-1 text-sm leading-relaxed line-clamp-3" style={{ color: 'var(--text-secondary)' }}>
                        {post.excerpt}
                      </p>
                    )}
                    <div className="terminal-text mt-5 flex items-center justify-between text-[11px]" style={{ color: 'var(--text-muted)' }}>
                      <span>{formatDate(post.published_at ?? post.created_at)}</span>
                      <span className="inline-flex items-center gap-1">
                        <Clock size={11} /> {readTime(post.content)} min read
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
        </div>
      </section>

      {/* ── Projects section ──────────────────────────────────────── */}
      <section className="py-16">
        <SectionHeading
          label="/ projects"
          title="Selected work"
          subtitle="tools, research & open-source"
          action={{ label: 'view all', href: '/projects' }}
        />

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {projects.slice(0, 3).map((p, idx) => (
            <motion.div
              key={p.slug}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: idx * 0.06 }}
            >
              <Link
                to={`/projects/${p.slug}`}
                className="card-hover group flex h-full flex-col rounded-xl p-5 transition-colors hover:border-term-blue/25"
                style={{ background: 'var(--bg-card-solid)', border: '1px solid var(--border)' }}
              >
                <div className="flex items-center justify-between">
                  <div className="terminal-text flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-term-blue">
                    <span className="h-1.5 w-1.5 rounded-full bg-term-blue" />
                    {p.tags[0] ?? 'project'}
                  </div>
                  <span className="terminal-text text-[10px] uppercase tracking-wider text-term-green">
                    ./{p.slug}
                  </span>
                </div>
                <h3 className="mt-3 text-lg font-bold leading-snug transition-colors group-hover:text-term-blue" style={{ color: 'var(--text-primary)' }}>
                  {p.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed line-clamp-3" style={{ color: 'var(--text-secondary)' }}>
                  {p.description}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {p.tech.slice(0, 3).map((t) => (
                    <span key={t} className="chip text-[10px]">{t}</span>
                  ))}
                </div>
                <div className="terminal-text mt-5 flex items-center justify-between text-[11px]" style={{ color: 'var(--text-muted)' }}>
                  <span className="inline-flex items-center gap-1">
                    <Github size={11} /> code
                  </span>
                  <span className="inline-flex items-center gap-1 text-term-green">
                    details <ArrowRight size={11} />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

    </div>
  );
}
