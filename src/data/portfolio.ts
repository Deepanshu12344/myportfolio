export const profile = {
  name: 'Deepanshu Sharma',
  handle: 'deepanshu',
  roles: ['Cybersecurity Researcher', 'Penetration Tester', 'CTF Player', 'Security Engineer'],
  location: 'India',
  email: 'deepanshu123sharma4@gmail.com',
  socials: {
    github: 'https://github.com/Deepanshu12344',
    linkedin: 'https://www.linkedin.com/in/deepanshu-sharma-164057250/',
    tryhackme: 'https://tryhackme.com/p/Deepanshu12345',
  },
  focus: ['Web Security', 'Cloud Security', 'Red Teaming', 'Active Directory', 'Malware Analysis'],
  status: 'Learning. Building. Breaking. Securing.',
  bio: `Security researcher focused on offensive security — web application exploitation, active directory attack paths, and cloud misconfigurations. I break things to understand them, then write about how to keep them together. Active CTF player and occasional writeup author.`,
};

export type SkillGroup = {
  label: string;
  icon: string;
  items: { name: string; level: number }[];
};

export const skillGroups: SkillGroup[] = [
  {
    label: 'Operating Systems',
    icon: 'monitor',
    items: [
      { name: 'Linux', level: 95 },
      { name: 'Windows', level: 85 },
    ],
  },
  {
    label: 'Languages',
    icon: 'code',
    items: [
      { name: 'Python', level: 92 },
      { name: 'JavaScript', level: 70 },
      { name: 'C++', level: 65 },
      { name: 'Bash', level: 70 },
    ],
  },
  {
    label: 'Tools',
    icon: 'terminal',
    items: [
      { name: 'Burp Suite', level: 92 },
      { name: 'Nmap', level: 95 },
      { name: 'Metasploit', level: 80 },
      { name: 'Wireshark', level: 85 },
      { name: 'Gobuster', level: 90 },
      { name: 'ffuf', level: 90 },
      { name: 'Hashcat', level: 85 },
      { name: 'John the Ripper', level: 82 },
      { name: 'Docker', level: 80 },
      { name: 'Git', level: 92 },
    ],
  },
];

export type TimelineItem = {
  year: string;
  title: string;
  org: string;
  description: string;
  tag: 'work' | 'education' | 'achievement';
};

export const timeline: TimelineItem[] = [
  {
    year: '2022 — 2026',
    title: 'B.Tech, Computer Science Engineering',
    org: 'Dr. Vishwanath Karad MIT World Peace University (MIT-WPU)',
    description:
      'CGPA: 7.82. Developed strong foundations in computer networks, operating systems, programming, and cybersecurity.',
    tag: 'education',
  },
  {
    year: '2022',
    title: 'Senior Secondary (CBSE)',
    org: 'Mother Divine Public School',
    description: 'Completed Class XII with 82.6%.',
    tag: 'education',
  },
  {
    year: '2020',
    title: 'Secondary (CBSE)',
    org: 'Mother Divine Public School',
    description: 'Completed Class X with 79.4%.',
    tag: 'education',
  },
];

export type Certification = {
  name: string;
  issuer: string;
  date: string;
  credentialUrl: string;
  abbr: string;
  accent: 'green' | 'cyan' | 'purple';
};

export const certifications: Certification[] = [
  {
    name: 'Offensive Security Certified Professional',
    issuer: 'OffSec',
    date: '2023',
    credentialUrl: 'https://www.offsec.com/certifications/oscp/',
    abbr: 'OSCP',
    accent: 'green',
  },
  {
    name: 'Certified Ethical Hacker',
    issuer: 'EC-Council',
    date: '2022',
    credentialUrl: 'https://www.eccouncil.org/programs/certified-ethical-hacker-ceh/',
    abbr: 'CEH',
    accent: 'cyan',
  },
  {
    name: 'CompTIA Security+',
    issuer: 'CompTIA',
    date: '2022',
    credentialUrl: 'https://www.comptia.org/certifications/security',
    abbr: 'SEC+',
    accent: 'purple',
  },
  {
    name: 'TryHackMe Top 1%',
    issuer: 'TryHackMe',
    date: '2023',
    credentialUrl: 'https://tryhackme.com',
    abbr: 'THM',
    accent: 'green',
  },
  {
    name: 'Hack The Box Pro Hacker',
    issuer: 'Hack The Box',
    date: '2023',
    credentialUrl: 'https://www.hackthebox.com',
    abbr: 'HTB',
    accent: 'cyan',
  },
  {
    name: 'AWS Cloud Practitioner',
    issuer: 'Amazon Web Services',
    date: '2021',
    credentialUrl: 'https://aws.amazon.com/certification/certified-cloud-practitioner/',
    abbr: 'AWS',
    accent: 'purple',
  },
];

export type Project = {
  slug: string;
  title: string;
  description: string;
  longDescription: string;
  tech: string[];
  tags: string[];
  github: string;
  demo: string | null;
  accent: 'green' | 'cyan' | 'purple';
  // image: string;
};

export const projects: Project[] = [
  {
    slug: 'secure-cicd-pipeline',
    title: 'Secure CI/CD Pipeline',
    description:
      'AI-powered DevSecOps platform that scans code, dependencies, and configs during CI/CD and assigns ML-based risk scores to flag or block risky builds.',
    longDescription:
      'An enterprise-grade DevSecOps solution combining a React dashboard, a Node.js/Express backend API, and a Python ML engine to automatically scan for vulnerabilities in code, dependencies, and configurations during the CI/CD pipeline. Risk scores are calculated using a weighted vulnerability model (SQL injection, auth bypass, XSS, weak encryption, insecure dependencies, and more), with configurable thresholds to allow, warn, or block builds. Includes a GitHub Actions workflow that runs security scans on every push/PR, uploads report artifacts, and builds/pushes Docker images for backend, frontend, and ML services. A companion VS Code extension gives developers real-time security feedback while coding.',
    tech: ['React', 'Node.js', 'Express', 'Python', 'Flask', 'Docker', 'GitHub Actions', 'MongoDB'],
    tags: ['DevSecOps', 'CI/CD', 'Risk Scoring', 'Vulnerability Detection'],
    github: 'https://github.com/Deepanshu12344/secure_cicd_pipeline',
    demo: 'https://secure-cicd-pipeline.vercel.app',
    accent: 'purple',
  },
  {
    slug: 'sentinelx',
    title: 'SentinelX',
    description:
      'Security monitoring dashboard with a background malware-scanning worker, built on React, Redux, and Supabase.',
    longDescription:
      'A React + TypeScript dashboard (Vite, Redux Toolkit, Recharts) backed by Supabase for auth and data storage, paired with a standalone Node.js malware-worker service for scanning and reporting on suspicious files or activity. The frontend visualizes findings and trends via Recharts, with routing handled by React Router and state managed through Redux Toolkit and React Query.',
    tech: ['React', 'TypeScript', 'Redux Toolkit', 'Supabase', 'Vite', 'Node.js', 'Recharts'],
    tags: ['Security', 'Malware Detection', 'Dashboard'],
    github: 'https://github.com/Deepanshu12344/sentinelx',
    demo: 'https://sentinelx-delta.vercel.app/',
    accent: 'green',
},
{
    slug: 'proxy-server',
    title: 'Multithreaded Proxy Server',
    description:
      'A multithreaded HTTP proxy server written in C, with an optional in-memory caching layer for repeated requests.',
    longDescription:
      'A from-scratch HTTP proxy server implemented in C using POSIX threads to handle multiple client connections concurrently. Includes a custom HTTP request parser (proxy_parse.c/h) for reading and validating incoming requests, and two server variants: one with an in-memory LRU-style cache to serve repeated requests faster and reduce redundant upstream calls, and one without caching for a simpler baseline. Demonstrates core systems concepts like socket programming, multithreading with mutex/semaphore synchronization, and manual HTTP parsing.',
    tech: ['C', 'POSIX Threads', 'Sockets', 'HTTP'],
    tags: ['Networking', 'Systems Programming', 'Caching'],
    github: 'https://github.com/Deepanshu12344/Proxy_Server',
    demo: null,
    accent: 'cyan',
},
];

export const blogCategories = [
  'Hack The Box',
  'TryHackMe',
  'Labs',
  'Web Security',
  'Active Directory',
  'Cloud',
  'Malware',
  'OSINT',
  'Reverse Engineering',
  'CTFs',
  'Notes',
];

export const difficulties = ['Easy', 'Medium', 'Hard', 'Insane'];

export const platforms = ['Hack The Box', 'TryHackMe', 'Labs', 'Custom'];
