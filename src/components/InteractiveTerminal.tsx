import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { profile, projects } from '../data/portfolio';

type Entry = {
  command?: string;
  output?: ReactNode;
};

const prompt = '$';

export default function InteractiveTerminal({
  title = 'deepanshu@kali',
  path = '~',
  className = '',
}: {
  title?: string;
  path?: string;
  className?: string;
}) {
  const [entries, setEntries] = useState<Entry[]>([
    { command: 'whoami', output: profile.name },
    {
      command: 'current_focus',
      output: (
        <div className="space-y-0.5">
          {profile.focus.map((focus) => (
            <div key={focus}>
              <span>&bull;</span>
              <span> {focus}</span>
            </div>
          ))}
        </div>
      ),
    },
    { output: <span className="text-zinc-500">type help and press enter</span> },
  ]);
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const commands = useMemo(
    () => ({
      help: (
        <div className="grid gap-1 sm:grid-cols-2">
          <span>whoami</span>
          <span>focus</span>
          <span>projects</span>
          <span>contact</span>
          <span>github</span>
          <span>linkedin</span>
          <span>tryhackme</span>
          <span>clear</span>
        </div>
      ),
      whoami: profile.name,
      focus: (
        <div className="space-y-0.5">
          {profile.focus.map((focus) => (
            <div key={focus}>
              <span>&bull;</span>
              <span> {focus}</span>
            </div>
          ))}
        </div>
      ),
      projects: (
        <div className="space-y-0.5">
          {projects.slice(0, 4).map((project) => (
            <div key={project.slug}>
              <span className="text-term-blue">./{project.slug}</span>
              <span className="text-zinc-500"> - {project.title}</span>
            </div>
          ))}
        </div>
      ),
      contact: (
        <a className="text-term-green underline-offset-4 hover:underline" href={`mailto:${profile.email}`}>
          {profile.email}
        </a>
      ),
      github: (
        <a className="text-term-green underline-offset-4 hover:underline" href={profile.socials.github} target="_blank" rel="noreferrer">
          opening GitHub...
        </a>
      ),
      linkedin: (
        <a className="text-term-blue underline-offset-4 hover:underline" href={profile.socials.linkedin} target="_blank" rel="noreferrer">
          opening LinkedIn...
        </a>
      ),
      tryhackme: (
        <a className="text-term-green underline-offset-4 hover:underline" href={profile.socials.tryhackme} target="_blank" rel="noreferrer">
          opening TryHackMe...
        </a>
      ),
    }),
    [],
  );

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [entries]);

  const runCommand = (raw: string) => {
    const command = raw.trim().toLowerCase();
    if (!command) return;

    if (command === 'clear') {
      setEntries([]);
      setInput('');
      return;
    }

    if (command === 'github') {
      window.open(profile.socials.github, '_blank', 'noreferrer');
    }
    if (command === 'linkedin') {
      window.open(profile.socials.linkedin, '_blank', 'noreferrer');
    }
    if (command === 'tryhackme') {
      window.open(profile.socials.tryhackme, '_blank', 'noreferrer');
    }

    const output = commands[command as keyof typeof commands] ?? (
      <span>
        command not found: <span className="text-term-red">{command}</span>. try help.
      </span>
    );

    setEntries((current) => [...current, { command: raw.trim(), output }]);
    setInput('');
  };

  return (
    <div
      className={`overflow-hidden rounded-xl shadow-card ${className}`}
      style={{ background: 'var(--bg-card-solid)', border: '1px solid var(--border)' }}
      onClick={() => inputRef.current?.focus()}
    >
      <div className="flex items-center gap-2 border-b px-4 py-2.5" style={{ borderColor: 'var(--border)', background: 'rgba(128,128,128,0.04)' }}>
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-term-red/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-term-amber/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-term-green/70" />
        </div>
        <div className="terminal-text ml-2 truncate text-xs" style={{ color: 'var(--text-muted)' }}>
          {title}<span style={{ color: 'var(--text-muted)' }}>:</span>{path}
        </div>
      </div>

      <div ref={scrollRef} className="terminal-text min-h-[13rem] max-h-[18rem] space-y-1.5 overflow-y-auto p-4 text-[13px] leading-relaxed sm:min-h-[14rem] sm:text-sm">
        {entries.map((entry, index) => (
          <div key={index} className="min-h-[1.4em]">
            {entry.command && (
              <div className="flex flex-wrap items-baseline gap-x-2">
                <span style={{ color: 'var(--terminal-prompt)' }}>{prompt}</span>
                <span style={{ color: 'var(--terminal-command)' }}>{entry.command}</span>
              </div>
            )}
            {entry.output && <div style={{ color: 'var(--terminal-output)' }}>{entry.output}</div>}
          </div>
        ))}

        <form
          className="flex items-baseline gap-2 pt-1"
          onSubmit={(e) => {
            e.preventDefault();
            runCommand(input);
          }}
        >
          <span style={{ color: 'var(--terminal-prompt)' }}>{prompt}</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            autoComplete="off"
            autoFocus
            aria-label="Terminal command"
            className="min-w-0 flex-1 bg-transparent text-sm caret-term-green outline-none"
            style={{ color: 'var(--terminal-command)' }}
          />
        </form>
      </div>
    </div>
  );
}
