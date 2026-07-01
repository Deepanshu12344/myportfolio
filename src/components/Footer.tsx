import { Link } from 'react-router-dom';
import { Github, Linkedin, Mail } from 'lucide-react';
import { profile } from '../data/portfolio';

export default function Footer() {
  return (
    <footer className="site-footer relative mt-32 border-t border-white/5 bg-base-900/40">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <div className="terminal-text mb-10 text-sm text-zinc-500">
          <span className="text-term-green">$</span> exit
        </div>

        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <div className="terminal-text text-lg font-bold">
              <span className="text-term-green">DS</span>
              <span className="text-zinc-500">{'>'}</span>
            </div>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-zinc-400">
              {profile.name} — {profile.roles[0]}. Building, breaking, and securing systems.
            </p>
          </div>

          <div>
            <div className="section-label">Connect</div>
            <div className="mt-4 flex flex-col gap-2.5 text-sm">
              <a
                href={profile.socials.github}
                target="_blank"
                rel="noreferrer"
                className="link-underline inline-flex items-center gap-2 text-zinc-300 hover:text-term-green w-fit"
              >
                <Github size={15} /> GitHub
              </a>
              <a
                href={profile.socials.linkedin}
                target="_blank"
                rel="noreferrer"
                className="link-underline inline-flex items-center gap-2 text-zinc-300 hover:text-term-blue w-fit"
              >
                <Linkedin size={15} /> LinkedIn
              </a>
              <a
                href={`mailto:${profile.email}`}
                className="link-underline inline-flex items-center gap-2 text-zinc-300 hover:text-term-blue w-fit"
              >
                <Mail size={15} /> Email
              </a>
            </div>
          </div>

          <div>
            <div className="section-label">Sitemap</div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              {[
                ['/', 'Home'],
                ['/blogs', 'Blogs'],
                ['/projects', 'Projects'],
                ['/writeups', 'Writeups'],
                ['/certifications', 'Certifications'],
                ['/about', 'About'],
                ['/contact', 'Contact'],
                ['/admin', 'Admin'],
              ].map(([to, label]) => (
                <Link
                  key={to}
                  to={to}
                  className="terminal-text text-zinc-400 hover:text-term-green transition-colors w-fit"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-white/5 pt-6 text-xs terminal-text text-zinc-600 sm:flex-row sm:items-center">
          <div>
            <span className="text-term-green">$</span> echo &copy; {new Date().getFullYear()}{' '}
            {profile.name}. All rights reserved.
          </div>
          <div className="text-zinc-600">
            <span className="text-term-green">session</span> closed · connection terminated
          </div>
        </div>
      </div>
    </footer>
  );
}
