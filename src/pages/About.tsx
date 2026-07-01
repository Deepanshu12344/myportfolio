import { motion } from 'framer-motion';
import { Monitor, Code, Terminal as TerminalIcon, Briefcase, GraduationCap, Trophy } from 'lucide-react';
import { profile, skillGroups, timeline } from '../data/portfolio';
import SectionHeading from '../components/SectionHeading';

const iconMap: Record<string, typeof Monitor> = {
  monitor: Monitor,
  code: Code,
  terminal: TerminalIcon,
};

const tagIcon: Record<string, typeof Briefcase> = {
  work: Briefcase,
  education: GraduationCap,
  achievement: Trophy,
};

const tagColor: Record<string, string> = {
  work: 'text-term-green',
  education: 'text-term-blue',
  achievement: 'text-term-blue-bright',
};

export default function About() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
      <SectionHeading label="~/about" title="whoami" />

      {/* Bio card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-strong mt-8 rounded-xl p-6 sm:p-8"
      >
        <div className="terminal-text mb-4 text-xs" style={{ color: 'var(--text-muted)' }}>
          <span className="text-term-green">$</span> whoami
        </div>
        <p className="text-[15px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{profile.bio}</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="terminal-text text-sm">
            <span style={{ color: 'var(--text-muted)' }}>location</span>
            <span className="mx-1.5" style={{ color: 'var(--border-strong)' }}>·</span>
            <span style={{ color: 'var(--text-primary)' }}>{profile.location}</span>
          </div>
          <div className="terminal-text text-sm">
            <span style={{ color: 'var(--text-muted)' }}>focus</span>
            <span className="mx-1.5" style={{ color: 'var(--border-strong)' }}>·</span>
            <span style={{ color: 'var(--text-primary)' }}>{profile.focus.join(', ')}</span>
          </div>
        </div>
      </motion.div>

      {/* Skills */}
      <section className="mt-16">
        <div className="terminal-text mb-6 text-xs" style={{ color: 'var(--text-muted)' }}>
          <span className="text-term-green">$</span> ls -la skills/
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {skillGroups.map((group, gi) => {
            const Icon = iconMap[group.icon];
            return (
              <motion.div
                key={group.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ delay: gi * 0.08, duration: 0.4 }}
                className="glass card-hover rounded-xl p-5 hover:border-term-green/20"
              >
                <div className="flex items-center gap-2.5">
                  <Icon size={16} className="text-term-green" />
                  <h3 className="terminal-text text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{group.label}</h3>
                </div>
                <div className="mt-4 space-y-3">
                  {group.items.map((item) => (
                    <div key={item.name}>
                      <div className="flex items-center justify-between text-xs">
                        <span className="terminal-text" style={{ color: 'var(--text-secondary)' }}>{item.name}</span>
                        <span className="terminal-text" style={{ color: 'var(--text-muted)' }}>{item.level}%</span>
                      </div>
                      <div className="mt-1.5 h-1 overflow-hidden rounded-full" style={{ background: 'var(--border-strong)' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${item.level}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                          className="h-full rounded-full bg-term-green/70"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Timeline */}
      <section className="mt-16">
        <div className="terminal-text mb-6 text-xs" style={{ color: 'var(--text-muted)' }}>
          <span className="text-term-green">$</span> git log --oneline
        </div>
        <div className="relative">
          <div className="absolute left-[7px] top-2 bottom-2 w-px bg-term-green/30" />
          <div className="space-y-6">
            {timeline.map((item, idx) => {
              const Icon = tagIcon[item.tag];
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  className="relative pl-8"
                >
                  <div className="absolute left-0 top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border border-term-green/40" style={{ background: 'var(--bg-card-solid)' }}>
                    <Icon size={8} className={tagColor[item.tag]} />
                  </div>
                  <div className="terminal-text text-xs" style={{ color: 'var(--text-muted)' }}>{item.year}</div>
                  <div className="mt-1 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item.title}</div>
                  <div className="terminal-text text-xs text-term-blue">{item.org}</div>
                  <p className="mt-1.5 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{item.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
