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
  image: string;
};

export const projects: Project[] = [
  {
    slug: 'red-team-toolkit',
    title: 'Red Team Toolkit',
    description:
      'A curated collection of offensive scripts, payloads, and automation for adversary simulation engagements.',
    longDescription:
      'Modular Python framework bundling common red team operations: C2 helper scripts, payload generation, AD enumeration wrappers, and reporting templates. Designed to be drop-in for engagements.',
    tech: ['Python', 'Impacket', 'NetExec', 'Sliver'],
    tags: ['Red Teaming', 'Automation', 'Offensive'],
    github: 'https://github.com/Deepanshu12344/red-team-toolkit',
    demo: null,
    accent: 'green',
    image:
      'https://images.pexels.com/photos/5380642/pexels-photo-5380642.jpeg?auto=compress&cs=tinysrgb&w=1200',
  },
  {
    slug: 'malware-sandbox',
    title: 'Malware Sandbox',
    description:
      'Lightweight detonation chamber for suspicious binaries with network capture, API tracing, and IOC extraction.',
    longDescription:
      'Isolated Docker-based sandbox that runs unknown samples, captures network traffic with tcpdump, logs syscalls via strace, and produces a summary report of observed indicators of compromise.',
    tech: ['Docker', 'Python', 'tcpdump', 'YARA'],
    tags: ['Malware Analysis', 'Detection', 'Forensics'],
    github: 'https://github.com/Deepanshu12344/malware-sandbox',
    demo: null,
    accent: 'cyan',
    image:
      'https://images.pexels.com/photos/60504/security-protection-anti-virus-software-60504.jpeg?auto=compress&cs=tinysrgb&w=1200',
  },
  {
    slug: 'soc-dashboard',
    title: 'SOC Dashboard',
    description:
      'Real-time security operations dashboard aggregating alerts, threat feeds, and SIEM metrics into one pane.',
    longDescription:
      'Web-based SOC console that ingests alerts from multiple sources, normalizes them, and presents a prioritized queue with enrichment from threat intel feeds. Built for small security teams.',
    tech: ['React', 'TypeScript', 'Elastic', 'Python'],
    tags: ['SOC', 'Detection', 'Monitoring'],
    github: 'https://github.com/Deepanshu12344/soc-dashboard',
    demo: null,
    accent: 'purple',
    image:
      'https://images.pexels.com/photos/1181271/pexels-photo-1181271.jpeg?auto=compress&cs=tinysrgb&w=1200',
  },
  {
    slug: 'osint-toolkit',
    title: 'OSINT Toolkit',
    description:
      'Reconnaissance toolkit for passive intelligence gathering — domains, emails, leaks, and infrastructure mapping.',
    longDescription:
      'CLI + web interface that orchestrates passive OSINT sources, deduplicates results, and exports structured reports. Useful for pre-engagement recon and threat actor profiling.',
    tech: ['Python', 'FastAPI', 'React', 'theHarvester'],
    tags: ['OSINT', 'Recon', 'Intelligence'],
    github: 'https://github.com/Deepanshu12344/osint-toolkit',
    demo: null,
    accent: 'green',
    image:
      'https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg?auto=compress&cs=tinysrgb&w=1200',
  },
  {
    slug: 'password-auditor',
    title: 'Password Auditor',
    description:
      'Offline password policy auditor that evaluates hash sets against dictionaries and reports weak password prevalence.',
    longDescription:
      'Tool for security teams to audit the strength of their password baseline. Runs hashcat in audit mode against a sanitized dump and produces a statistical report without exposing plaintext.',
    tech: ['Python', 'Hashcat', 'Jupyter'],
    tags: ['Password', 'Audit', 'Cracking'],
    github: 'https://github.com/Deepanshu12344/password-auditor',
    demo: null,
    accent: 'cyan',
    image:
      'https://images.pexels.com/photos/270700/pexels-photo-270700.jpeg?auto=compress&cs=tinysrgb&w=1200',
  },
  {
    slug: 'ad-attack-playbook',
    title: 'AD Attack Playbook',
    description:
      'Documented active directory attack chains with reproducible lab setups and detection guidance for each step.',
    longDescription:
      'Open knowledge base of AD attack techniques mapped to MITRE ATT&CK, each with a lab setup script, exploitation commands, and defensive detection rules for Sentinel/Elastic.',
    tech: ['Markdown', 'PowerShell', 'Impacket', 'BloodHound'],
    tags: ['Active Directory', 'Detection', 'MITRE'],
    github: 'https://github.com/Deepanshu12344/ad-attack-playbook',
    demo: null,
    accent: 'purple',
    image:
      'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=1200',
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
