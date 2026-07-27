// Lightweight markdown renderer tailored for technical security writeups.
// Supports: headings, paragraphs, bold/italic/code, links, lists (ordered/unordered,
// task lists), blockquotes, fenced code blocks with language, tables, hr,
// inline code, footnotes refs, and GitHub-style admonitions ("> [!tip]").
// Not a full CommonMark implementation — focused on the subset used in posts.

export type TocItem = { id: string; text: string; level: number };

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function inline(text: string): string {
  let out = escapeHtml(text);
  // images ![alt](url)
  out = out.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    (_, alt, url) => `<img src="${url}" alt="${alt}" loading="lazy" />`,
  );
  // inline code
  out = out.replace(/`([^`]+)`/g, (_, c) => `<code>${c}</code>`);
  // bold
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  // italic
  out = out.replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');
  // links [text](url)
  out = out.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (_, label, url) => `<a href="${url}" target="_blank" rel="noreferrer">${label}</a>`,
  );
  // footnote refs [^1]
  out = out.replace(/\[\^([^\]]+)\]/g, '<sup><a href="#fn-$1">[$1]</a></sup>');
  return out;
}

export function renderMarkdown(md: string): { html: string; toc: TocItem[] } {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const toc: TocItem[] = [];
  let html = '';
  let i = 0;

  const collectBlock = (predicate: (line: string) => boolean): string[] => {
    const block: string[] = [];
    while (i < lines.length && predicate(lines[i])) {
      block.push(lines[i]);
      i++;
    }
    return block;
  };

  while (i < lines.length) {
    const line = lines[i];

    // fenced code block
    if (/^```/.test(line)) {
      const lang = line.replace(/^```/, '').trim();
      const code: string[] = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) {
        code.push(lines[i]);
        i++;
      }
      i++; // closing fence
      html += renderCodeBlock(code.join('\n'), lang);
      continue;
    }

    // admonition: > [!type] title
    const adm = line.match(/^>\s*\[!(\w+)\]\s*(.*)$/);
    if (adm) {
      const type = adm[1].toLowerCase();
      const title = adm[2];
      const body: string[] = [];
      i++;
      while (i < lines.length && /^>/.test(lines[i])) {
        body.push(lines[i].replace(/^>\s?/, ''));
        i++;
      }
      html += renderAdmonition(type, title, body.join('\n'));
      continue;
    }

    // blockquote (non-admonition)
    if (/^>/.test(line)) {
      const block = collectBlock((l) => /^>/.test(l)).map((l) => l.replace(/^>\s?/, ''));
      html += `<blockquote>${inline(block.join(' '))}</blockquote>`;
      continue;
    }

    // headings
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      const level = h[1].length;
      const text = h[2].trim();
      const id = slugify(text);
      toc.push({ id, text, level });
      html += `<h${level} id="${id}">${inline(text)}</h${level}>`;
      i++;
      continue;
    }

    // standalone image
    const img = line.match(/^!\[([^\]]*)\]\(([^)]+)\)\s*$/);
    if (img) {
      html += `<figure><img src="${escapeHtml(img[2])}" alt="${escapeHtml(img[1])}" loading="lazy" /></figure>`;
      i++;
      continue;
    }

    // hr
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
      html += '<hr />';
      i++;
      continue;
    }

    // table
    if (line.includes('|') && i + 1 < lines.length && /^\s*\|?[\s:|-]+\|?\s*$/.test(lines[i + 1])) {
      const header = line.split('|').map((c) => c.trim()).filter(Boolean);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].includes('|') && lines[i].trim() !== '') {
        rows.push(lines[i].split('|').map((c) => c.trim()).filter((cell, idx, arr) => idx !== 0 && idx !== arr.length - 1 || cell !== ''));
        i++;
      }
      html += '<table><thead><tr>';
      header.forEach((c) => (html += `<th>${inline(c)}</th>`));
      html += '</tr></thead><tbody>';
      rows.forEach((r) => {
        html += '<tr>';
        r.forEach((c) => (html += `<td>${inline(c)}</td>`));
        html += '</tr>';
      });
      html += '</tbody></table>';
      continue;
    }

    // task list
    if (/^\s*[-*]\s+\[[ x]\]/i.test(line)) {
      const block = collectBlock((l) => /^\s*[-*]\s+\[[ x]\]/i.test(l));
      html += '<ul class="contains-task-list">';
      block.forEach((l) => {
        const checked = /\[[x]\]/i.test(l);
        const text = l.replace(/^\s*[-*]\s+\[[ x]\]\s+/i, '');
        html += `<li><input type="checkbox" disabled ${checked ? 'checked' : ''} /> ${inline(text)}</li>`;
      });
      html += '</ul>';
      continue;
    }

    // unordered list
    if (/^\s*[-*]\s+/.test(line)) {
      const block = collectBlock((l) => /^\s*[-*]\s+/.test(l));
      html += '<ul>';
      block.forEach((l) => {
        html += `<li>${inline(l.replace(/^\s*[-*]\s+/, ''))}</li>`;
      });
      html += '</ul>';
      continue;
    }

    // ordered list
    if (/^\s*\d+\.\s+/.test(line)) {
      const block = collectBlock((l) => /^\s*\d+\.\s+/.test(l));
      html += '<ol>';
      block.forEach((l) => {
        html += `<li>${inline(l.replace(/^\s*\d+\.\s+/, ''))}</li>`;
      });
      html += '</ol>';
      continue;
    }

    // blank line
    if (line.trim() === '') {
      i++;
      continue;
    }

    // paragraph (collect consecutive non-empty, non-special lines)
    const block = collectBlock((l) => l.trim() !== '' && !/^(#{1,6}\s|```|>|[-*]\s+\[|\d+\.\s|[-*]\s)/.test(l) && !(l.includes('|') && i + 1 < lines.length && /^\s*\|?[\s:|-]+\|?\s*$/.test(lines[i + 1])));
    if (block.length) {
      html += `<p>${inline(block.join(' '))}</p>`;
    }
  }

  return { html, toc };
}

function renderAdmonition(type: string, title: string, body: string): string {
  const styles: Record<string, { color: string; label: string }> = {
    tip: { color: 'term-green', label: 'Tip' },
    warning: { color: 'term-amber', label: 'Warning' },
    info: { color: 'term-blue', label: 'Info' },
    danger: { color: 'term-red', label: 'Danger' },
    note: { color: 'term-blue-bright', label: 'Note' },
  };
  const s = styles[type] ?? styles.info;
  const label = title || s.label;
  const bodyHtml = renderMarkdown(body).html;
  return `<div class="admonition admonition-${s.color} my-5 rounded-lg border-l-2 border-${s.color}/60 bg-${s.color}/[0.04] px-4 py-3">
    <div class="admonition-title terminal-text flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-${s.color}">
      <span>${s.label}</span>
      <span class="text-zinc-300 normal-case tracking-normal">${label === s.label ? '' : inline(label)}</span>
    </div>
    <div class="admonition-body mt-2 text-sm text-zinc-300">${bodyHtml}</div>
  </div>`;
}

function renderCodeBlock(code: string, lang: string): string {
  const highlighted = highlightCode(code, lang);
  const id = `code-${Math.random().toString(36).slice(2, 9)}`;
  return `<div class="code-block group relative my-5 overflow-hidden rounded-lg border border-white/8 bg-base-850">
    <div class="flex items-center justify-between border-b border-white/5 bg-white/[0.02] px-4 py-2">
      <div class="terminal-text flex items-center gap-2 text-xs text-zinc-500">
        <span class="h-2 w-2 rounded-full bg-term-green/60"></span>
        ${lang || 'shell'}
      </div>
      <button class="copy-btn terminal-text text-[11px] text-zinc-500 hover:text-term-green transition-colors" data-code-id="${id}">
        copy
      </button>
    </div>
    <pre id="${id}" class="overflow-x-auto p-4 text-[13px] leading-relaxed"><code>${highlighted}</code></pre>
  </div>`;
}

function highlightCode(code: string, lang: string): string {
  // Keep commands as plain escaped text. The old regex highlighter edited its
  // own generated HTML (for example, matching "-command" in a class name),
  // which leaked token markup into the rendered command.
  void lang;
  return escapeHtml(code);
}

export function estimateReadingTime(md: string): number {
  const words = md.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}
