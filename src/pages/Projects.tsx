import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Github, ExternalLink, ArrowRight } from 'lucide-react';
import { projects } from '../data/portfolio';
import SectionHeading from '../components/SectionHeading';

const accentText: Record<string, string> = {
  green: 'text-term-green',
  cyan: 'text-term-blue',
  purple: 'text-term-blue-bright',
};

export default function Projects() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
      <SectionHeading label="/ projects" title="Builds" subtitle="tools, research & open-source" />
      <p className="terminal-text mt-4 max-w-2xl text-sm text-zinc-400">
        <span className="text-term-green">$</span> find ./projects -type f -name '*.py' -o -name '*.ts'
      </p>

      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((p, idx) => (
          <motion.div
            key={p.slug}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.4, delay: idx * 0.05 }}
          >
            <div
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
              <Link to={`/projects/${p.slug}`}>
                <h3 className="mt-3 text-lg font-bold leading-snug transition-colors group-hover:text-term-blue" style={{ color: 'var(--text-primary)' }}>
                  {p.title}
                </h3>
              </Link>
              <p className="mt-2 flex-1 text-sm leading-relaxed line-clamp-3" style={{ color: 'var(--text-secondary)' }}>{p.description}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {p.tech.slice(0, 3).map((t) => (
                  <span key={t} className="chip text-[10px]">
                    {t}
                  </span>
                ))}
              </div>
              <div className="terminal-text mt-5 flex items-center gap-3 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                <a
                  href={p.github}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-term-green transition-colors"
                >
                  <Github size={13} /> code
                </a>
                {p.demo && (
                  <a
                    href={p.demo}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 hover:text-term-blue transition-colors"
                  >
                    <ExternalLink size={13} /> demo
                  </a>
                )}
                <Link
                  to={`/projects/${p.slug}`}
                  className={`ml-auto inline-flex items-center gap-1 ${accentText[p.accent]} hover:gap-2 transition-all`}
                >
                  details <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
