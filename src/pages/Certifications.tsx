import { motion } from 'framer-motion';
import { Award, ExternalLink } from 'lucide-react';
import { certifications } from '../data/portfolio';
import SectionHeading from '../components/SectionHeading';

const accentMap: Record<string, { border: string; text: string; bg: string; glow: string }> = {
  green: {
    border: 'border-term-green/30',
    text: 'text-term-green',
    bg: 'bg-term-green/5',
    glow: 'hover:shadow-glow-green',
  },
  cyan: {
    border: 'border-term-blue/30',
    text: 'text-term-blue',
    bg: 'bg-term-blue/5',
    glow: 'hover:shadow-glow-blue',
  },
  purple: {
    border: 'border-term-blue-bright/30',
    text: 'text-term-blue-bright',
    bg: 'bg-term-blue/5',
    glow: 'hover:shadow-glow-blue',
  },
};

export default function Certifications() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
      <SectionHeading label="~/certs" title="Credentials" />

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {certifications.map((c, idx) => {
          const a = accentMap[c.accent];
          return (
            <motion.a
              key={c.name}
              href={c.credentialUrl}
              target="_blank"
              rel="noreferrer"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, delay: idx * 0.06 }}
              className={`glass card-hover group relative overflow-hidden rounded-xl p-6 ${a.border} ${a.glow}`}
            >
              <div className="flex items-start justify-between">
                <div className={`terminal-text flex h-14 w-14 items-center justify-center rounded-lg border ${a.border} ${a.text} ${a.bg} text-sm font-bold`}>
                  {c.abbr}
                </div>
                <Award size={18} className="transition-colors group-hover:text-term-green" style={{ color: 'var(--text-muted)' }} />
              </div>
              <h3 className="mt-5 text-base font-semibold" style={{ color: 'var(--text-primary)' }}>{c.name}</h3>
              <div className="terminal-text mt-2 flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                <span>{c.issuer}</span>
                <span style={{ color: 'var(--border-strong)' }}>·</span>
                <span>{c.date}</span>
              </div>
              <div className={`terminal-text mt-5 inline-flex items-center gap-1.5 text-xs ${a.text} opacity-0 transition-all group-hover:opacity-100`}>
                verify credential <ExternalLink size={12} />
              </div>
            </motion.a>
          );
        })}
      </div>
    </div>
  );
}
