-- Remove the placeholder posts shipped with the portfolio template.
DELETE FROM blog_posts
WHERE slug IN (
  'htb-lame',
  'thm-rootme',
  'bypassing-jwt-signature-validation',
  'kerberoasting-without-mimikatz',
  'enumerating-misconfigured-s3-buckets',
  'reverse-shell-cheat-sheet'
);
