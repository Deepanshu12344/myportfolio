import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Home,
  FileText,
  FolderGit2,
  Award,
  User,
  Mail,
  Terminal as TerminalIcon,
  Github,
  ArrowRight,
} from 'lucide-react';
import { profile } from '../data/portfolio';

type Command = {
  id: string;
  label: string;
  hint: string;
  icon: typeof Home;
  action: () => void;
  keywords: string;
};

export default function CommandPalette({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const navigate = useNavigate();

  const commands = useMemo<Command[]>(() => {
    const go = (path: string) => () => {
      navigate(path);
      onClose();
    };
    return [
      { id: 'home', label: 'Home', hint: '/', icon: Home, action: go('/'), keywords: 'home landing' },
      { id: 'blogs', label: 'Blogs', hint: '/blogs', icon: FileText, action: go('/blogs'), keywords: 'blog posts archive' },
      { id: 'projects', label: 'Projects', hint: '/projects', icon: FolderGit2, action: go('/projects'), keywords: 'projects work' },
      { id: 'writeups', label: 'Writeups', hint: '/writeups', icon: TerminalIcon, action: go('/writeups'), keywords: 'writeups htb thm ctf' },
      { id: 'certifications', label: 'Certifications', hint: '/certifications', icon: Award, action: go('/certifications'), keywords: 'certs certifications' },
      { id: 'about', label: 'About', hint: '/about', icon: User, action: go('/about'), keywords: 'about bio skills' },
      { id: 'contact', label: 'Contact', hint: '/contact', icon: Mail, action: go('/contact'), keywords: 'contact email' },
      {
        id: 'github',
        label: 'GitHub',
        hint: 'external',
        icon: Github,
        action: () => {
          window.open(profile.socials.github, '_blank');
          onClose();
        },
        keywords: 'github source code',
      },
    ];
  }, [navigate, onClose]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) =>
      (c.label + ' ' + c.keywords + ' ' + c.hint).toLowerCase().includes(q),
    );
  }, [query, commands]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  useEffect(() => {
    if (!open) {
      setQuery('');
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActive((a) => Math.min(a + 1, filtered.length - 1));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActive((a) => Math.max(a - 1, 0));
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        filtered[active]?.action();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, filtered, active, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 px-4 pt-[15vh] backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: -12, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -12, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="glass-strong w-full max-w-xl overflow-hidden rounded-xl shadow-card"
          >
            <div className="flex items-center gap-3 border-b border-white/5 px-4 py-3">
              <Search size={16} className="text-term-green" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type a command or search… (try /blogs)"
                className="terminal-text flex-1 bg-transparent text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
              />
              <kbd className="terminal-text rounded border border-white/10 px-1.5 py-0.5 text-[10px] text-zinc-500">
                ESC
              </kbd>
            </div>
            <div className="max-h-80 overflow-y-auto p-2">
              {filtered.length === 0 ? (
                <div className="terminal-text px-3 py-6 text-center text-sm text-zinc-500">
                  No matches found.
                </div>
              ) : (
                filtered.map((c, i) => {
                  const Icon = c.icon;
                  return (
                    <button
                      key={c.id}
                      onMouseEnter={() => setActive(i)}
                      onClick={c.action}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                        i === active
                          ? 'bg-term-green/10 text-term-green'
                          : 'text-zinc-300 hover:bg-white/5'
                      }`}
                    >
                      <Icon size={15} className={i === active ? 'text-term-green' : 'text-zinc-500'} />
                      <span className="terminal-text text-sm">{c.label}</span>
                      <span className="terminal-text ml-auto text-xs text-zinc-600">{c.hint}</span>
                      {i === active && <ArrowRight size={13} className="text-term-green" />}
                    </button>
                  );
                })
              )}
            </div>
            <div className="flex items-center justify-between border-t border-white/5 px-4 py-2 text-[10px] terminal-text text-zinc-600">
              <span>↑↓ navigate · ↵ select · esc close</span>
              <span>deepanshu@workstation</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
