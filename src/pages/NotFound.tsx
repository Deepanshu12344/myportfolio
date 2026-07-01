import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Terminal as TerminalIcon, CornerDownLeft } from 'lucide-react';

export default function NotFound() {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (input.trim().toLowerCase() === 'home') {
          navigate('/');
        } else {
          setError(`command not found: ${input || '<empty>'}`);
          setTimeout(() => setError(''), 2000);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [input, navigate]);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-5 py-16 text-center">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full"
      >
        <div className="terminal-text text-7xl font-bold text-term-red sm:text-8xl">
          404
        </div>
        <div className="terminal-text mt-4 text-sm text-zinc-400">
          <span className="text-term-red">ERR_CONNECTION_TIMED_OUT</span> — the requested route could not be reached
        </div>

        <div className="glass-strong mx-auto mt-10 max-w-md overflow-hidden rounded-xl text-left">
          <div className="flex items-center gap-2 border-b border-white/5 bg-white/[0.02] px-4 py-2.5">
            <TerminalIcon size={13} className="text-term-green" />
            <span className="terminal-text text-xs text-zinc-500">reconnect.sh</span>
          </div>
          <div className="terminal-text space-y-1.5 p-4 text-[13px]">
            <div className="text-zinc-500">
              <span className="text-term-red">error</span>: connection timed out
            </div>
            <div className="text-zinc-500">
              <span className="text-term-amber">hint</span>: type <span className="text-term-green">"home"</span> to reconnect
            </div>
            <div className="flex items-baseline gap-2 pt-2">
              <span className="text-term-green">$</span>
              <input
                autoFocus
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="type home + enter"
                className="terminal-text flex-1 bg-transparent text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
              />
              <CornerDownLeft size={13} className="text-zinc-600" />
            </div>
            {error && <div className="text-term-red text-xs">{error}</div>}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
