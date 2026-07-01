import { motion } from 'framer-motion';

export default function SectionHeading({
  label,
  title,
  subtitle,
  action,
}: {
  label: string;      // e.g. "~/BLOG" or "/ projects"
  title: string;      // e.g. "Latest research"
  subtitle?: string;  // e.g. "fresh writeups & notes"
  action?: { label: string; href: string };
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="terminal-text text-xs text-term-green mb-1">{label}</div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl" style={{ color: 'var(--text-primary)' }}>
            {title}
          </h2>
          {subtitle && (
            <p className="terminal-text mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
              {subtitle}
            </p>
          )}
        </div>
        {action && (
          <a
            href={action.href}
            className="terminal-text mt-1 shrink-0 text-sm text-term-blue hover:text-term-green transition-colors"
          >
            {action.label} →
          </a>
        )}
      </div>
    </motion.div>
  );
}
