import { useState } from 'react';
import { motion } from 'framer-motion';
import { Github, Linkedin, Mail, Send, Check, MapPin } from 'lucide-react';
import { profile } from '../data/portfolio';
import SectionHeading from '../components/SectionHeading';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError('');
    setSent(false);

    try {
      const response = await fetch('https://formspree.io/f/xykqnnzj', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          message: form.message,
        }),
      });

      if (!response.ok) {
        throw new Error('Form submission failed');
      }

      setSent(true);
      setForm({ name: '', email: '', message: '' });
    } catch {
      setError('message failed. email me directly or try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
      <SectionHeading label="~/contact" title="Get in touch" />
      <p className="terminal-text mt-4 max-w-2xl text-sm text-zinc-400">
        <span className="text-term-green">$</span> nc -lvnp 4444 # waiting for inbound
      </p>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass rounded-xl p-6"
        >
          <div className="terminal-text mb-4 text-xs text-term-green/70">$ cat contact.vcf</div>
          <div className="space-y-4">
            <a
              href={`mailto:${profile.email}`}
              className="flex items-center gap-3 text-sm text-zinc-300 hover:text-term-green transition-colors"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-term-green/20 bg-term-green/5">
                <Mail size={15} className="text-term-green" />
              </span>
              {profile.email}
            </a>
            <div className="flex items-center gap-3 text-sm text-zinc-400">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.02]">
                <MapPin size={15} className="text-zinc-500" />
              </span>
              {profile.location}
            </div>
          </div>

          <div className="terminal-text mt-6 mb-3 text-xs text-zinc-500">$ social --list</div>
          <div className="flex flex-wrap gap-2">
            <a
              href={profile.socials.github}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-xs text-zinc-300 hover:border-term-green/30 hover:text-term-green transition-colors"
            >
              <Github size={14} /> GitHub
            </a>
            <a
              href={profile.socials.linkedin}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-xs text-zinc-300 hover:border-term-blue/30 hover:text-term-blue transition-colors"
            >
              <Linkedin size={14} /> LinkedIn
            </a>
          </div>

          <div className="terminal-text mt-8 rounded-lg border border-white/5 bg-base-850 p-4 text-xs leading-relaxed text-zinc-500">
            <span className="text-term-green">$</span> status: available for security research,
            collaboration, and select freelance engagements. Response time ~24-48h.
          </div>
        </motion.div>

        <motion.form
          onSubmit={submit}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="glass-strong rounded-xl p-6"
        >
          <div className="terminal-text mb-4 text-xs text-term-blue/70">$ echo "message" | send --to=deepanshu</div>
          <div className="space-y-4">
            <Field label="name">
              <input
                required
                name="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="your name"
                className="terminal-text w-full rounded-lg border border-white/10 bg-base-850 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-term-green/40 focus:outline-none"
              />
            </Field>
            <Field label="email">
              <input
                required
                name="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="terminal-text w-full rounded-lg border border-white/10 bg-base-850 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-term-green/40 focus:outline-none"
              />
            </Field>
            <Field label="message">
              <textarea
                required
                name="message"
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="what's on your mind?"
                className="terminal-text w-full resize-none rounded-lg border border-white/10 bg-base-850 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-term-green/40 focus:outline-none"
              />
            </Field>
            {error && (
              <div className="terminal-text rounded-lg border border-term-red/20 bg-term-red/5 px-3 py-2 text-xs text-term-red">
                {error}
              </div>
            )}
            <button type="submit" disabled={sending} className="btn-primary w-full justify-center disabled:cursor-not-allowed disabled:opacity-60">
              {sent ? <Check size={15} /> : <Send size={15} />}
              {sending ? 'sending...' : sent ? 'message sent' : 'send message'}
            </button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="terminal-text mb-1.5 text-[11px] text-zinc-500">{label}</div>
      {children}
    </label>
  );
}
