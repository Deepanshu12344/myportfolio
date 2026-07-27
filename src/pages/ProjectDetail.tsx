import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Github, ExternalLink, Tag } from 'lucide-react';
import { projects } from '../data/portfolio';

export default function ProjectDetail() {
  const { slug } = useParams();
  const project = projects.find((p) => p.slug === slug);

  if (!project) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-24 text-center">
        <div className="terminal-text text-sm text-term-red">$ project: not found</div>
        <Link to="/projects" className="btn-ghost mt-6">
          <ArrowLeft size={15} /> back to projects
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8">
      <Link
        to="/projects"
        className="terminal-text mb-8 inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-term-green transition-colors"
      >
        <ArrowLeft size={14} /> cd ../projects
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="terminal-text text-xs text-zinc-500">./projects/{project.slug}</div>
        <h1 className="terminal-text mt-2 text-3xl font-bold text-zinc-100 sm:text-4xl">
          {project.title}
        </h1>

        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={project.github}
            target="_blank"
            rel="noreferrer"
            className="btn-primary"
          >
            <Github size={15} /> GitHub
          </a>
          {project.demo && (
            <a href={project.demo} target="_blank" rel="noreferrer" className="btn-ghost">
              <ExternalLink size={15} /> Live Demo
            </a>
          )}
        </div>

        <div className="mt-8 glass rounded-xl p-6">
          <div className="terminal-text mb-3 text-xs text-term-green/70">$ cat README.md</div>
          <p className="text-[15px] leading-relaxed text-zinc-300">{project.longDescription}</p>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <div className="glass rounded-xl p-5">
            <div className="terminal-text mb-3 text-xs text-term-blue/70">$ tech-stack --list</div>
            <div className="flex flex-wrap gap-2">
              {project.tech.map((t) => (
                <span key={t} className="chip">
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div className="glass rounded-xl p-5">
            <div className="terminal-text mb-3 flex items-center gap-2 text-xs text-term-blue/70">
              <Tag size={12} /> $ tags
            </div>
            <div className="flex flex-wrap gap-2">
              {project.tags.map((t) => (
                <span key={t} className="chip">
                  #{t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
