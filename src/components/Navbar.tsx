import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Command as CommandIcon, Sun, Moon } from 'lucide-react';

const links = [
  { to: '/', label: 'home' },
  { to: '/blogs', label: 'blogs' },
  { to: '/projects', label: 'projects' },
  { to: '/writeups', label: 'writeups' },
  // { to: '/certifications', label: 'certifications' },
  { to: '/about', label: 'about' },
  { to: '/contact', label: 'contact' },
];

export default function Navbar({
  onOpenPalette,
  isDark,
  onToggleTheme,
}: {
  onOpenPalette: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [location.pathname]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'glass-strong border-b'
          : 'border-b border-transparent'
      }`}
      style={scrolled ? { borderColor: 'var(--border)' } : undefined}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        {/* Logo — terminal style: ~/ */}
        <Link to="/" className="group focus-ring rounded-md">
          <span className="terminal-text text-base font-bold tracking-tight">
            <span className="text-term-green">~</span>
            <span className="text-term-blue">/</span>
            <span className="ml-0.5 inline-block h-4 w-1.5 translate-y-0.5 bg-term-green" />
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                `terminal-text relative rounded-md px-3 py-1.5 text-[13px] transition-colors focus-ring ${
                  isActive ? 'text-term-green' : ''
                }`
              }
              style={({ isActive }) => ({ color: isActive ? undefined : 'var(--text-muted)' })}
            >
              {({ isActive }) => isActive ? `/${l.label}` : l.label}
            </NavLink>
          ))}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={onToggleTheme}
            className="flex h-8 w-8 items-center justify-center rounded-md border transition-colors focus-ring"
            style={{ borderColor: 'var(--border-strong)', color: 'var(--text-muted)' }}
            aria-label="Toggle theme"
          >
            {isDark
              ? <Sun size={14} className="text-term-green" />
              : <Moon size={14} className="text-term-blue" />}
          </button>

          {/* Command palette shortcut */}
          <button
            onClick={onOpenPalette}
            className="hidden items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[11px] terminal-text transition-colors focus-ring sm:flex"
            style={{ borderColor: 'var(--border-strong)', color: 'var(--text-muted)' }}
            aria-label="Open command palette"
          >
            <CommandIcon size={12} />
            <span>K</span>
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="rounded-md border p-2 transition-colors focus-ring md:hidden"
            style={{ borderColor: 'var(--border-strong)', color: 'var(--text-secondary)' }}
            aria-label="Toggle menu"
          >
            {open ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden glass-strong md:hidden"
            style={{ borderTop: '1px solid var(--border)' }}
          >
            <div className="flex flex-col gap-1 px-5 py-4">
              {links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.to === '/'}
                  className={({ isActive }) =>
                    `terminal-text rounded-md px-3 py-2 text-sm transition-colors ${
                      isActive ? 'bg-term-green/10 text-term-green' : ''
                    }`
                  }
                  style={({ isActive }) => ({ color: isActive ? undefined : 'var(--text-secondary)' })}
                >
                  {({ isActive }) => isActive ? `/${l.label}` : l.label}
                </NavLink>
              ))}
              <button
                onClick={() => { setOpen(false); onOpenPalette(); }}
                className="terminal-text mt-1 flex items-center gap-2 rounded-md px-3 py-2 text-sm"
                style={{ color: 'var(--text-secondary)' }}
              >
                <CommandIcon size={14} /> Command palette
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
