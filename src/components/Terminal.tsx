import { useEffect, useRef, useState, type ReactNode } from 'react';

type Line = {
  prompt?: string;
  command?: string;
  output?: ReactNode;
  delay?: number;
};

export default function Terminal({
  title = 'deepanshu@kali',
  path = '~',
  lines,
  className = '',
  autoStart = true,
}: {
  title?: string;
  path?: string;
  lines: Line[];
  className?: string;
  autoStart?: boolean;
}) {
  const [visible, setVisible] = useState(-1);
  const [typed, setTyped] = useState<Record<number, string>>({});
  const [done, setDone] = useState(false);
  const linesRef = useRef(lines);
  linesRef.current = lines;

  useEffect(() => {
    if (!autoStart) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    setVisible(-1);
    setTyped({});
    setDone(false);

    const run = async () => {
      const ls = linesRef.current;
      for (let i = 0; i < ls.length; i++) {
        if (cancelled) return;
        const line = ls[i];
        const delay = i === 0 ? 200 : (line.delay ?? 350);
        await new Promise((r) => (timer = setTimeout(r, delay)));
        if (cancelled) return;
        setVisible(i);
        if (line.command) {
          const full = line.command;
          setTyped((t) => ({ ...t, [i]: '' }));
          for (let j = 1; j <= full.length; j++) {
            if (cancelled) return;
            setTyped((t) => ({ ...t, [i]: full.slice(0, j) }));
            await new Promise((r) => (timer = setTimeout(r, 28)));
          }
        }
      }
      setDone(true);
    };
    run();

    return () => { cancelled = true; clearTimeout(timer); };
  }, [autoStart]);

  return (
    <div className={`overflow-hidden rounded-xl shadow-card ${className}`} style={{ background: 'var(--bg-card-solid)', border: '1px solid var(--border)' }}>
      {/* Title bar */}
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

      {/* Content */}
      <div className="terminal-text min-h-[13rem] space-y-1.5 p-4 text-[13px] leading-relaxed sm:min-h-[14rem] sm:text-sm">
        {lines.slice(0, Math.max(0, visible + 1)).map((line, i) => {
          const isTyping = i === visible && line.command !== undefined && typed[i] !== undefined && typed[i]!.length < (line.command?.length ?? 0);
          const isCurrent = i === visible;
          const isComplete = i < visible || done;
          return (
            <div key={i} className="min-h-[1.4em]">
              {line.command !== undefined ? (
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <span style={{ color: 'var(--terminal-prompt)' }}>{line.prompt ?? '$'}</span>
                  <span style={{ color: 'var(--terminal-command)' }}>
                    {typed[i] ?? ''}
                    {isCurrent && isTyping && (
                      <span className="ml-0.5 inline-block h-3.5 w-1.5 translate-y-0.5 bg-current animate-blink" style={{ color: 'var(--terminal-command)' }} />
                    )}
                  </span>
                </div>
              ) : null}
              {line.output && isComplete && !isTyping ? (
                <div style={{ color: 'var(--terminal-output)' }}>{line.output}</div>
              ) : null}
            </div>
          );
        })}
        {done && visible >= lines.length - 1 && (
          <div className="flex items-baseline gap-2 pt-1">
            <span style={{ color: 'var(--terminal-prompt)' }}>$</span>
            <span className="inline-block h-3.5 w-1.5 translate-y-0.5 bg-current animate-blink" style={{ color: 'var(--terminal-command)' }} />
          </div>
        )}
      </div>
    </div>
  );
}
