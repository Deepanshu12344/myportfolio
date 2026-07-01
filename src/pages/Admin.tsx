import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  Save,
  Eye,
  EyeOff,
  X,
  FileText,
  Check,
  AlertCircle,
  Upload,
} from 'lucide-react';
import { supabase, type BlogPost } from '../lib/supabase';
import { fetchAllPostsAdmin } from '../lib/posts';
import { blogCategories, difficulties, platforms } from '../data/portfolio';

type Session = { user: { email: string } } | null;

const emptyDraft: Partial<BlogPost> = {
  slug: '',
  title: '',
  excerpt: '',
  content: '',
  featured_image: '',
  category: 'Notes',
  tags: [],
  difficulty: '',
  platform: '',
  status: 'draft',
  seo_title: '',
  seo_description: '',
};

export default function Admin() {
  const [session, setSession] = useState<Session | undefined>(undefined);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [editing, setEditing] = useState<Partial<BlogPost> | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setSession(data.session as Session);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      (async () => {
        if (mounted) setSession(sess as Session);
      })();
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session) return;
    setLoadingPosts(true);
    fetchAllPostsAdmin()
      .then(setPosts)
      .catch(() => setPosts([]))
      .finally(() => setLoadingPosts(false));
  }, [session]);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setAuthError(error.message);
    setAuthLoading(false);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  const startNew = () => {
    setEditing({ ...emptyDraft });
    setTagInput('');
    setSaveMsg(null);
  };

  const startEdit = (p: BlogPost) => {
    setEditing({ ...p });
    setTagInput('');
    setSaveMsg(null);
  };

  const closeEditor = () => {
    setEditing(null);
    setSaveMsg(null);
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (!t || !editing) return;
    const tags = editing.tags ?? [];
    if (!tags.includes(t)) setEditing({ ...editing, tags: [...tags, t] });
    setTagInput('');
  };

  const removeTag = (t: string) => {
    if (!editing) return;
    setEditing({ ...editing, tags: (editing.tags ?? []).filter((x) => x !== t) });
  };

  const insertContentAtCursor = (textarea: HTMLTextAreaElement, text: string) => {
    if (!editing) return;
    const content = editing.content ?? '';
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const next = `${content.slice(0, start)}${text}${content.slice(end)}`;
    setEditing({ ...editing, content: next });
    requestAnimationFrame(() => {
      textarea.focus();
      const cursor = start + text.length;
      textarea.setSelectionRange(cursor, cursor);
    });
  };

  const pasteContent = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    const imageFromFiles = Array.from(e.clipboardData.files).find((file) => file.type.startsWith('image/'));
    const imageFromItems = Array.from(e.clipboardData.items)
      .find((item) => item.kind === 'file' && item.type.startsWith('image/'))
      ?.getAsFile();
    const image = imageFromFiles ?? imageFromItems;

    if (!image) return;
    e.preventDefault();

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      const name = image.name.replace(/\.[^.]+$/, '') || 'pasted image';
      insertContentAtCursor(textarea, `\n\n![${name}](${dataUrl})\n\n`);
      setSaveMsg({ type: 'ok', text: 'Image pasted into markdown.' });
    };
    reader.onerror = () => setSaveMsg({ type: 'err', text: 'Could not paste image.' });
    reader.readAsDataURL(image);
  };

  const insertImageFile = (file: File) => {
    if (!editing) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      const name = file.name.replace(/\.[^.]+$/, '') || 'image';
      setEditing((current) => ({
        ...current,
        content: `${current?.content ?? ''}\n\n![${name}](${dataUrl})\n\n`,
      }));
      setSaveMsg({ type: 'ok', text: 'Image added to markdown.' });
    };
    reader.onerror = () => setSaveMsg({ type: 'err', text: 'Could not add image.' });
    reader.readAsDataURL(file);
  };

  const save = async (publish: boolean) => {
    if (!editing) return;
    if (!editing.title || !editing.slug) {
      setSaveMsg({ type: 'err', text: 'Title and slug are required.' });
      return;
    }
    setSaving(true);
    setSaveMsg(null);
    const payload = {
      slug: editing.slug,
      title: editing.title,
      excerpt: editing.excerpt || null,
      content: editing.content || '',
      featured_image: editing.featured_image || null,
      category: editing.category || 'Notes',
      tags: editing.tags ?? [],
      difficulty: editing.difficulty || null,
      platform: editing.platform || null,
      status: (publish ? 'published' : 'draft') as 'published' | 'draft',
      published_at: publish
        ? editing.published_at ?? new Date().toISOString()
        : editing.published_at ?? null,
      seo_title: editing.seo_title || null,
      seo_description: editing.seo_description || null,
    };

    const existing = posts.find((p) => p.slug === editing.slug);
    let result;
    if (existing) {
      result = await supabase.from('blog_posts').update(payload).eq('id', existing.id).select().maybeSingle();
    } else {
      result = await supabase.from('blog_posts').insert(payload).select().maybeSingle();
    }

    if (result.error) {
      setSaveMsg({ type: 'err', text: result.error.message });
      setSaving(false);
      return;
    }
    const saved = result.data as BlogPost;
    setPosts((prev) => {
      const idx = prev.findIndex((p) => p.id === saved.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      }
      return [saved, ...prev];
    });
    setSaveMsg({ type: 'ok', text: publish ? 'Published.' : 'Draft saved.' });
    setSaving(false);
    setEditing({ ...saved });
  };

  const remove = async (p: BlogPost) => {
    if (!confirm(`Delete "${p.title}"? This cannot be undone.`)) return;
    const { error } = await supabase.from('blog_posts').delete().eq('id', p.id);
    if (error) {
      alert(error.message);
      return;
    }
    setPosts((prev) => prev.filter((x) => x.id !== p.id));
  };

  // ---- Auth screen ----
  if (session === undefined) {
    return (
      <div className="mx-auto max-w-md px-5 py-24 text-center">
        <div className="terminal-text text-sm text-zinc-500">$ establishing secure channel…</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-5 py-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass-strong rounded-xl p-7"
        >
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-term-green/30 bg-term-green/5">
              <Lock size={18} className="text-term-green" />
            </span>
            <div>
              <div className="terminal-text text-sm font-semibold text-zinc-100">admin@workstation</div>
              <div className="terminal-text text-[11px] text-zinc-500">secure login required</div>
            </div>
          </div>

          <form onSubmit={signIn} className="mt-6 space-y-4">
            <label className="block">
              <div className="terminal-text mb-1.5 text-[11px] text-zinc-500">email</div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="terminal-text w-full rounded-lg border border-white/10 bg-base-850 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-term-green/40 focus:outline-none"
              />
            </label>
            <label className="block">
              <div className="terminal-text mb-1.5 text-[11px] text-zinc-500">password</div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="terminal-text w-full rounded-lg border border-white/10 bg-base-850 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-term-green/40 focus:outline-none"
              />
            </label>
            {authError && (
              <div className="terminal-text flex items-center gap-2 rounded-lg border border-term-red/30 bg-term-red/5 px-3 py-2 text-xs text-term-red">
                <AlertCircle size={13} /> {authError}
              </div>
            )}
            <button type="submit" disabled={authLoading} className="btn-primary w-full justify-center disabled:opacity-50">
              {authLoading ? 'authenticating…' : 'authenticate'}
            </button>
          </form>
          <div className="terminal-text mt-5 text-[11px] leading-relaxed text-zinc-600">
            <span className="text-term-amber">note</span> — sign in with the admin account provisioned for this
            project. Drafts and published posts are managed here.
          </div>
        </motion.div>
      </div>
    );
  }

  // ---- Dashboard ----
  return (
    <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <div className="terminal-text text-xs text-zinc-600">// admin dashboard</div>
          <h1 className="terminal-text mt-1.5 text-2xl font-semibold text-zinc-100 sm:text-3xl">
            <span className="text-term-green">$</span> cms
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="terminal-text text-xs text-zinc-500">
            signed in as <span className="text-term-green">{session.user.email}</span>
          </span>
          <button onClick={signOut} className="btn-ghost">
            <LogOut size={14} /> sign out
          </button>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="terminal-text text-sm text-zinc-400">
          {posts.length} {posts.length === 1 ? 'post' : 'posts'} ·{' '}
          {posts.filter((p) => p.status === 'published').length} published ·{' '}
          {posts.filter((p) => p.status === 'draft').length} draft
        </div>
        <button onClick={startNew} className="btn-primary">
          <Plus size={15} /> new post
        </button>
      </div>

      {/* Posts table */}
      <div className="mt-6 glass overflow-hidden rounded-xl">
        {loadingPosts ? (
          <div className="p-8 text-center">
            <div className="terminal-text text-sm text-zinc-500">loading posts…</div>
          </div>
        ) : posts.length === 0 ? (
          <div className="p-12 text-center">
            <FileText size={28} className="mx-auto text-zinc-700" />
            <div className="terminal-text mt-3 text-sm text-zinc-500">no posts yet</div>
            <button onClick={startNew} className="btn-ghost mt-4">
              <Plus size={14} /> create your first post
            </button>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {posts.map((p) => (
              <div key={p.id} className="flex flex-wrap items-center gap-3 p-4 hover:bg-white/[0.02]">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`terminal-text rounded px-1.5 py-0.5 text-[10px] ${
                        p.status === 'published'
                          ? 'bg-term-green/10 text-term-green'
                          : 'bg-term-amber/10 text-term-amber'
                      }`}
                    >
                      {p.status}
                    </span>
                    <span className="truncate text-sm font-medium text-zinc-100">{p.title}</span>
                  </div>
                  <div className="terminal-text mt-0.5 truncate text-[11px] text-zinc-500">
                    /{p.slug} · {p.category} · {p.published_at ? new Date(p.published_at).toLocaleDateString() : '—'}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => startEdit(p)}
                    className="terminal-text inline-flex items-center gap-1 rounded-md border border-white/10 px-2.5 py-1.5 text-[11px] text-zinc-300 hover:border-term-blue/30 hover:text-term-blue transition-colors"
                  >
                    <Pencil size={12} /> edit
                  </button>
                  <button
                    onClick={() => remove(p)}
                    className="terminal-text inline-flex items-center gap-1 rounded-md border border-white/10 px-2.5 py-1.5 text-[11px] text-zinc-300 hover:border-term-red/30 hover:text-term-red transition-colors"
                  >
                    <Trash2 size={12} /> delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Editor drawer */}
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-x-0 bottom-0 top-16 z-50 flex justify-end bg-black/60 backdrop-blur-sm"
            onClick={closeEditor}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="glass-strong h-full w-full max-w-2xl overflow-y-auto"
            >
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/5 bg-base-900/80 px-5 py-3 backdrop-blur">
                <div className="terminal-text text-sm font-medium text-zinc-100">
                  {posts.find((p) => p.id === editing.id) ? 'edit post' : 'new post'}
                </div>
                <button onClick={closeEditor} className="text-zinc-500 hover:text-zinc-200">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-5 p-5">
                {saveMsg && (
                  <div
                    className={`terminal-text flex items-center gap-2 rounded-lg border px-3 py-2 text-xs ${
                      saveMsg.type === 'ok'
                        ? 'border-term-green/30 bg-term-green/5 text-term-green'
                        : 'border-term-red/30 bg-term-red/5 text-term-red'
                    }`}
                  >
                    {saveMsg.type === 'ok' ? <Check size={13} /> : <AlertCircle size={13} />}
                    {saveMsg.text}
                  </div>
                )}

                <Input label="title" value={editing.title ?? ''} onChange={(v) => setEditing({ ...editing, title: v })} placeholder="Post title" />
                <Input label="slug" value={editing.slug ?? ''} onChange={(v) => setEditing({ ...editing, slug: v.toLowerCase().replace(/\s+/g, '-') })} placeholder="url-slug" mono />

                <div>
                  <div className="terminal-text mb-1.5 text-[11px] text-zinc-500">excerpt</div>
                  <textarea
                    rows={2}
                    value={editing.excerpt ?? ''}
                    onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })}
                    placeholder="Short summary shown on cards"
                    className="terminal-text w-full resize-none rounded-lg border border-white/10 bg-base-850 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-term-green/40 focus:outline-none"
                  />
                </div>

                <div>
                  <div className="terminal-text mb-1.5 flex items-center justify-between text-[11px] text-zinc-500">
                    <span>content (markdown)</span>
                    <label className="inline-flex cursor-pointer items-center gap-1 text-zinc-600 transition-colors hover:text-term-green">
                      <Upload size={10} /> add image
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (file) insertImageFile(file);
                          event.target.value = '';
                        }}
                      />
                    </label>
                  </div>
                  <textarea
                    rows={14}
                    value={editing.content ?? ''}
                    onChange={(e) => setEditing({ ...editing, content: e.target.value })}
                    onPaste={pasteContent}
                    placeholder="# Heading&#10;&#10;Write your post in markdown.&#10;&#10;![image description](https://example.com/image.png)&#10;&#10;Supports code blocks, images, admonitions, tables..."
                    className="terminal-text w-full resize-y rounded-lg border border-white/10 bg-base-850 px-3 py-2.5 text-[13px] leading-relaxed text-zinc-100 placeholder:text-zinc-600 focus:border-term-green/40 focus:outline-none"
                  />
                </div>

                <Input label="featured image URL" value={editing.featured_image ?? ''} onChange={(v) => setEditing({ ...editing, featured_image: v })} placeholder="https://…" />

                <div className="grid gap-4 sm:grid-cols-2">
                  <SelectField label="category" value={editing.category ?? 'Notes'} onChange={(v) => setEditing({ ...editing, category: v })} options={blogCategories} />
                  <SelectField label="difficulty" value={editing.difficulty ?? ''} onChange={(v) => setEditing({ ...editing, difficulty: v })} options={['', ...difficulties]} allowEmpty />
                  <SelectField label="platform" value={editing.platform ?? ''} onChange={(v) => setEditing({ ...editing, platform: v })} options={['', ...platforms]} allowEmpty />
                </div>

                <div>
                  <div className="terminal-text mb-1.5 text-[11px] text-zinc-500">tags</div>
                  <div className="flex flex-wrap gap-1.5">
                    {(editing.tags ?? []).map((t) => (
                      <span key={t} className="chip">
                        #{t}
                        <button onClick={() => removeTag(t)} className="ml-1 text-zinc-500 hover:text-term-red">
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="mt-2 flex gap-2">
                    <input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                      placeholder="add tag + enter"
                      className="terminal-text flex-1 rounded-lg border border-white/10 bg-base-850 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-term-green/40 focus:outline-none"
                    />
                    <button onClick={addTag} className="btn-ghost">
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                <div className="rounded-lg border border-white/5 bg-base-850 p-4">
                  <div className="terminal-text mb-3 text-[11px] text-zinc-500">SEO</div>
                  <Input label="seo title" value={editing.seo_title ?? ''} onChange={(v) => setEditing({ ...editing, seo_title: v })} placeholder="Optional SEO title" />
                  <div className="mt-3">
                    <Input label="seo description" value={editing.seo_description ?? ''} onChange={(v) => setEditing({ ...editing, seo_description: v })} placeholder="Meta description" />
                  </div>
                </div>

                <div className="flex items-center gap-2 border-t border-white/5 pt-4">
                  <button onClick={() => save(false)} disabled={saving} className="btn-ghost">
                    {saving ? 'saving…' : (<><Save size={14} /> save draft</>)}
                  </button>
                  <button onClick={() => save(true)} disabled={saving} className="btn-primary">
                    {saving ? 'publishing…' : (<><Eye size={14} /> publish</>)}
                  </button>
                  {editing.status === 'published' && (
                    <button
                      onClick={async () => {
                        if (!editing.id) return;
                        const { error } = await supabase
                          .from('blog_posts')
                          .update({ status: 'draft', published_at: null })
                          .eq('id', editing.id);
                        if (error) {
                          setSaveMsg({ type: 'err', text: error.message });
                          return;
                        }
                        setEditing({ ...editing, status: 'draft' });
                        setPosts((prev) => prev.map((p) => (p.id === editing.id ? { ...p, status: 'draft' } : p)));
                        setSaveMsg({ type: 'ok', text: 'Unpublished.' });
                      }}
                      className="btn-ghost"
                    >
                      <EyeOff size={14} /> unpublish
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  mono,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  mono?: boolean;
}) {
  return (
    <label className="block">
      <div className="terminal-text mb-1.5 text-[11px] text-zinc-500">{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`terminal-text w-full rounded-lg border border-white/10 bg-base-850 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-term-green/40 focus:outline-none ${mono ? 'font-mono' : ''}`}
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  allowEmpty,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  allowEmpty?: boolean;
}) {
  return (
    <label className="block">
      <div className="terminal-text mb-1.5 text-[11px] text-zinc-500">{label}</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="terminal-text w-full cursor-pointer rounded-lg border border-white/10 bg-base-850 px-3 py-2.5 text-sm text-zinc-100 focus:border-term-green/40 focus:outline-none"
      >
        {allowEmpty && <option value="">— none —</option>}
        {options.filter(Boolean).map((o) => (
          <option key={o} value={o} className="bg-base-850">
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
