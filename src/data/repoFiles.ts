export type RepoId = 'gcp-firewall-rules' | 'auth-frontier';

export interface RepoConfig {
  githubUsername: string;
  repoSlug: string;
  authorName: string;
  license: string;
}

export interface RepoFile {
  path: string;
  name: string;
  folder: string | null;
  category: 'root' | 'docs' | 'config' | 'asset';
  description: string;
  content: string;
  assetUrl?: string;
}

export interface MatrixRow {
  id: string;
  number: string;
  title: string;
  filePath: string;
  weaknessClass: string;
  primaryTest: string;
  keyDefense: string;
  severity: 'High' | 'Critical' | 'Medium';
}

export interface ChecklistItem {
  id: string;
  category: string;
  filePath: string;
  text: string;
}

export interface RepoBundle {
  id: RepoId;
  label: string;
  subtitle: string;
  files: RepoFile[];
  assetMap: Record<string, string>;
  matrixTitle: string;
  matrixSubtitle: string;
  matrixDescription: string;
  matrixRows: MatrixRow[];
  checklistTitle: string;
  checklistDescription: string;
  checklistItems: ChecklistItem[];
}

export const DEFAULT_REPO_CONFIGS: Record<RepoId, RepoConfig> = {
  'gcp-firewall-rules': {
    githubUsername: 'your-username',
    repoSlug: 'gcp-firewall-rules',
    authorName: 'Muhammed Abdulazeez',
    license: 'MIT',
  },
  'auth-frontier': {
    githubUsername: 'your-username',
    repoSlug: 'auth-frontier',
    authorName: 'Muhammed Abdulazeez',
    license: 'MIT',
  },
};

export const VULNERABILITY_MATRIX: MatrixRow[] = [
  {
    id: 'weak-storage',
    number: '01',
    title: 'Weak Password Storage & Cookie Handling',
    filePath: 'docs/01-weak-password-storage.md',
    weaknessClass: 'Cryptographic / Session Design',
    primaryTest: 'Base64-decode remember-me cookie & check 32-char MD5 hash',
    keyDefense: 'Argon2 / bcrypt / scrypt + unique salt + opaque UUID session IDs',
    severity: 'Critical',
  },
  {
    id: 'reset-idor',
    number: '02',
    title: 'Password Reset IDOR & Logic Flaws',
    filePath: 'docs/02-password-reset-idor.md',
    weaknessClass: 'Broken Access Control / Logic',
    primaryTest: 'Ghost Token test: strip token & swap username parameter',
    keyDefense: 'Atomic token validation & strict server-side Token-to-User binding',
    severity: 'Critical',
  },
  {
    id: 'reset-poisoning',
    number: '03',
    title: 'Password Reset Poisoning (Host Header)',
    filePath: 'docs/03-password-reset-poisoning.md',
    weaknessClass: 'HTTP Request Smuggling / Header Trust',
    primaryTest: 'Inject X-Forwarded-Host on POST /forgot-password & watch logs',
    keyDefense: 'Allowlist Host headers & hardcode static base application URLs',
    severity: 'High',
  },
  {
    id: 'user-enum',
    number: '04',
    title: 'Username Enumeration & Timing Attacks',
    filePath: 'docs/04-username-enumeration.md',
    weaknessClass: 'Information Disclosure / Side-Channel',
    primaryTest: 'Compare error messages & sort Burp Intruder results by Time',
    keyDefense: 'Generic error messages & constant-time dummy hash verification',
    severity: 'High',
  },
  {
    id: 'brute-force',
    number: '05',
    title: 'Brute-Force & Rate Limiting Bypasses',
    filePath: 'docs/05-brute-force-rate-limiting.md',
    weaknessClass: 'Rate Limit Evasion',
    primaryTest: 'X-Forwarded-For IP rotation & Lather-Rinse-Repeat counter reset',
    keyDefense: 'Account-level lockout with email unlock & exponential backoff',
    severity: 'High',
  },
  {
    id: 'mfa-bypass',
    number: '06',
    title: 'Multi-Factor Authentication (MFA) Bypasses',
    filePath: 'docs/06-mfa-bypasses.md',
    weaknessClass: 'Broken Multi-Step State',
    primaryTest: 'Forced browsing to /my-account, response tampering, OAuth swap',
    keyDefense: 'Enforce is_mfa_authenticated == true per route & prefer TOTP apps',
    severity: 'Critical',
  },
];

export const FIREWALL_MATRIX: MatrixRow[] = [
  {
    id: 'fw-ssh',
    number: '01',
    title: 'default-allow-ssh (tcp:22)',
    filePath: 'docs/01-default-firewall-rules.md',
    weaknessClass: 'Ingress · Apply to all · Priority 65534 · Logs Off',
    primaryTest: 'Exposed SSH port 22 across 0.0.0.0/0 on every VM with an external IP',
    keyDefense: 'Delete default rule & restrict tcp:22 to IAP range 35.235.240.0/20',
    severity: 'Critical',
  },
  {
    id: 'fw-rdp',
    number: '02',
    title: 'default-allow-rdp (tcp:3389)',
    filePath: 'docs/01-default-firewall-rules.md',
    weaknessClass: 'Ingress · Apply to all · Priority 65534 · Logs Off',
    primaryTest: 'Exposed RDP port 3389 across 0.0.0.0/0 inviting credential brute-force',
    keyDefense: 'Delete default rule & tunnel RDP exclusively over Identity-Aware Proxy',
    severity: 'Critical',
  },
  {
    id: 'fw-internal',
    number: '03',
    title: 'default-allow-internal (tcp/udp:0-65535, icmp)',
    filePath: 'docs/02-firewall-hardening-and-policies.md',
    weaknessClass: 'Ingress · Apply to all · Priority 65534 · Logs Off',
    primaryTest: 'Unrestricted lateral port reachability across all internal VPC subnets',
    keyDefense: 'Replace with service-account-scoped ingress rules for required ports only',
    severity: 'High',
  },
  {
    id: 'fw-icmp',
    number: '04',
    title: 'default-allow-icmp (icmp)',
    filePath: 'docs/01-default-firewall-rules.md',
    weaknessClass: 'Ingress · Apply to all · Priority 65534 · Logs Off',
    primaryTest: 'Unauthenticated ICMP echo probing permitted against all instances',
    keyDefense: 'Restrict ICMP to internal monitoring CIDRs & enable Firewall Rules Logging',
    severity: 'Medium',
  },
];

export const AUDIT_CHECKLIST_ITEMS: ChecklistItem[] = [
  {
    id: 'chk-1',
    category: 'Password Storage & Cookies',
    filePath: 'docs/01-weak-password-storage.md',
    text: 'Passwords are hashed using Argon2, bcrypt, or scrypt with a unique random salt per user.',
  },
  {
    id: 'chk-2',
    category: 'Password Storage & Cookies',
    filePath: 'docs/01-weak-password-storage.md',
    text: 'Persistent cookies (stay-logged-in / remember-me) store opaque random UUID session tokens, never username:hash.',
  },
  {
    id: 'chk-3',
    category: 'Password Reset Security',
    filePath: 'docs/02-password-reset-idor.md',
    text: 'Final password reset POST endpoint validates a non-empty token atomically before updating credentials.',
  },
  {
    id: 'chk-4',
    category: 'Password Reset Security',
    filePath: 'docs/02-password-reset-idor.md',
    text: 'Reset tokens are cryptographically bound to a single user account (Token A cannot reset User B).',
  },
  {
    id: 'chk-5',
    category: 'Password Reset Security',
    filePath: 'docs/03-password-reset-poisoning.md',
    text: 'Reset links use a static configured base URL rather than trusting Host or X-Forwarded-Host headers.',
  },
  {
    id: 'chk-6',
    category: 'Enumeration & Brute Force',
    filePath: 'docs/04-username-enumeration.md',
    text: 'Login and reset endpoints return generic errors ("Invalid username or password.") for all failures.',
  },
  {
    id: 'chk-7',
    category: 'Enumeration & Brute Force',
    filePath: 'docs/04-username-enumeration.md',
    text: 'Login executes a dummy hash check when a username does not exist to keep response times uniform.',
  },
  {
    id: 'chk-8',
    category: 'Enumeration & Brute Force',
    filePath: 'docs/05-brute-force-rate-limiting.md',
    text: 'Rate limiting tracks per-account attempts (not spoofable X-Forwarded-For headers) with exponential backoff.',
  },
  {
    id: 'chk-9',
    category: 'Enumeration & Brute Force',
    filePath: 'docs/05-brute-force-rate-limiting.md',
    text: 'A successful login to Account A does not reset failed-attempt counters for Account B or the caller IP.',
  },
  {
    id: 'chk-10',
    category: 'Multi-Factor Authentication',
    filePath: 'docs/06-mfa-bypasses.md',
    text: 'Every protected route enforces is_mfa_authenticated == true server-side (blocks forced browsing).',
  },
  {
    id: 'chk-11',
    category: 'Multi-Factor Authentication',
    filePath: 'docs/06-mfa-bypasses.md',
    text: '2FA verification relies on server-side session state, immune to JSON {"success":true} response tampering.',
  },
  {
    id: 'chk-12',
    category: 'Multi-Factor Authentication',
    filePath: 'docs/06-mfa-bypasses.md',
    text: 'OAuth callbacks validate signed ID tokens/userinfo server-side instead of trusting client email parameters.',
  },
];

export const FIREWALL_CHECKLIST_ITEMS: ChecklistItem[] = [
  {
    id: 'fw-chk-1',
    category: 'Default Rule Cleanup',
    filePath: 'docs/01-default-firewall-rules.md',
    text: 'default-allow-ssh (tcp:22 from 0.0.0.0/0) is deleted or restricted to bastion/admin CIDRs.',
  },
  {
    id: 'fw-chk-2',
    category: 'Default Rule Cleanup',
    filePath: 'docs/01-default-firewall-rules.md',
    text: 'default-allow-rdp (tcp:3389 from 0.0.0.0/0) is deleted or replaced with IAP tunneling.',
  },
  {
    id: 'fw-chk-3',
    category: 'Default Rule Cleanup',
    filePath: 'docs/01-default-firewall-rules.md',
    text: 'default-allow-icmp is reviewed and scoped if external ping discovery is unnecessary.',
  },
  {
    id: 'fw-chk-4',
    category: 'Default Rule Cleanup',
    filePath: 'docs/02-firewall-hardening-and-policies.md',
    text: 'default-allow-internal (tcp:0-65535, udp:0-65535) is narrowed to required service ports and tiers.',
  },
  {
    id: 'fw-chk-5',
    category: 'Least-Privilege & Identity',
    filePath: 'docs/02-firewall-hardening-and-policies.md',
    text: 'Administrative SSH/RDP traffic uses Identity-Aware Proxy (35.235.240.0/20) rather than public IPs.',
  },
  {
    id: 'fw-chk-6',
    category: 'Least-Privilege & Identity',
    filePath: 'docs/02-firewall-hardening-and-policies.md',
    text: 'Ingress rules target explicit service accounts or network tags instead of "Apply to all".',
  },
  {
    id: 'fw-chk-7',
    category: 'Least-Privilege & Identity',
    filePath: 'docs/02-firewall-hardening-and-policies.md',
    text: 'Operators auditing inherited policies have compute.organizations.listAssociations where appropriate.',
  },
  {
    id: 'fw-chk-8',
    category: 'Observability & Egress',
    filePath: 'docs/02-firewall-hardening-and-policies.md',
    text: 'Firewall Rules Logging is enabled (Logs: On) for perimeter allow and deny rules.',
  },
];

export function buildAuthRepoFiles(config: RepoConfig): RepoFile[] {
  const { githubUsername, repoSlug, authorName, license } = config;

  const readme = `# The Authentication Frontier

> Practical field notes on modern web authentication flaws, exploitation workflows, and defensive architecture.

- **Repository:** \`${githubUsername}/${repoSlug}\`
- **Author:** ${authorName}
- **Source Material:** PortSwigger Web Security Academy (Authentication Vulnerabilities — 55/55 Labs Completed)

## Overview

This repository documents how seemingly secure authentication controls—password hashing, "remember me" cookies, multi-factor authentication (MFA), rate limiters, and password reset flows—fail when implemented with flawed business logic.

Rather than focusing purely on brute-force password guessing, **Auth Frontier** breaks down logic-based exploitation techniques and pairs each vulnerability class with concrete engineering remediations.

## Repository Structure

\`\`\`text
${repoSlug}/
├── README.md
├── CHECKLIST.md
├── CONTRIBUTING.md
├── .gitignore
└── docs/
    ├── 01-weak-password-storage.md
    ├── 02-password-reset-idor.md
    ├── 03-password-reset-poisoning.md
    ├── 04-username-enumeration.md
    ├── 05-brute-force-rate-limiting.md
    └── 06-mfa-bypasses.md
\`\`\`

## Core Vulnerabilities & Exploits

| # | Vulnerability Class | Primary Attack Vector | Key Defense | Guide |
| :--- | :--- | :--- | :--- | :--- |
| 01 | Weak Password Storage & Cookie Handling | Base64-decoded \`stay-logged-in\` cookie revealing \`username:md5\` | Slow salted hashing (\`Argon2\`/\`bcrypt\`) + opaque UUID tokens | [Read Guide](docs/01-weak-password-storage.md) |
| 02 | Password Reset IDOR & Logic Flaws | Ghost Token test (stripping token & swapping \`username\`) | Atomic token verification + strict Token-to-User binding | [Read Guide](docs/02-password-reset-idor.md) |
| 03 | Password Reset Poisoning | Injecting \`X-Forwarded-Host\` to hijack reset links | Static base URLs + strict \`Host\` header allowlisting | [Read Guide](docs/03-password-reset-poisoning.md) |
| 04 | Username Enumeration & Timing Attacks | Error string diffs & response latency spikes during hashing | Generic error copy + constant-time dummy hash check | [Read Guide](docs/04-username-enumeration.md) |
| 05 | Brute-Force & Rate Limiting Bypasses | \`X-Forwarded-For\` spoofing & Lather-Rinse-Repeat resets | Per-account lockout + exponential backoff (\`1s, 2s, 4s, 8s...\`) | [Read Guide](docs/05-brute-force-rate-limiting.md) |
| 06 | Multi-Factor Authentication Bypasses | Forced browsing, \`{"success":true}\` tampering, OAuth swap | Server-side \`is_mfa_authenticated\` checks + TOTP apps | [Read Guide](docs/06-mfa-bypasses.md) |

## Key Takeaway

> Moving from simple password guessing to **logic-based exploitation** shows that attackers do not need to crack a password if they can trick the server into ignoring the verification check entirely.

## Quick Start

Clone this repository locally for reference during security assessments or code reviews:

\`\`\`bash
git clone https://github.com/${githubUsername}/${repoSlug}.git
cd ${repoSlug}
\`\`\`

For pre-release security reviews, follow the verification items in [CHECKLIST.md](CHECKLIST.md).

## License

Released under the ${license} License.
`;

  const doc01 = `# 01. Weak Password Storage & Cookie Handling

When authentication is implemented hastily, applications frequently leak credentials or unsalted password hashes directly inside client-side cookies.

---

## Root Cause

Developers sometimes build persistent login features (\`stay-logged-in\` or \`remember-me\`) by encoding a deterministic \`username:hash\` string into a cookie rather than issuing an opaque, randomly generated session identifier stored server-side.

## How to Find It (Step-by-Step)

1. **Identify Cookies**
   Log in with "Stay logged in" enabled and inspect your browser's DevTools (**Storage / Application** tab) or Burp Suite **Proxy > HTTP history**. Look for cookies named \`stay-logged-in\` or \`remember-me\`.

2. **Decode the Cookie Value**
   Most persistent cookies are Base64 encoded. Send the raw cookie string to **Burp Decoder** and decode as Base64.

3. **Pattern Match**
   Inspect the decoded output for structured pairs such as:
   \`\`\`text
   wiener:51dc30ddc473d43a6011e9ebba6ca770
   \`\`\`
   A 32-character hexadecimal string strongly indicates an unsalted **MD5** hash.

4. **Reverse the Hash**
   Paste the extracted hash into a lookup engine or rainbow-table service such as **CrackStation**. If it resolves back to the plaintext password immediately, the system is using unsalted, fast hashing.

---

## Defensive Engineering

- **Slow Adaptive Hashing**
  Use memory-hard or computationally expensive password hashing algorithms: **Argon2id**, **bcrypt**, or **scrypt**. Never use MD5, SHA-1, or raw SHA-256 for passwords.
- **Per-User Salting**
  Generate a unique, cryptographically random salt for every password before hashing to neutralize precomputed rainbow tables.
- **Opaque Session Tokens**
  Never store credentials or password hashes in cookies. Issue a cryptographically random **UUID / CSPRNG Session ID** that maps to a user session record in a secure server-side store, with \`HttpOnly\`, \`Secure\`, and \`SameSite\` flags enabled.
`;

  const doc02 = `# 02. Password Reset IDOR & Logic Flaws

Password reset endpoints are often the weakest link in an authentication architecture because they authorize a password change without requiring knowledge of the current password.

---

## Root Cause

Broken state validation between the email link generation step and the final password-change submission allows an attacker to either omit the verification token altogether or supply their own valid token while targeting a different user's \`username\`.

## How to Find It (Step-by-Step)

1. **Trigger a Reset**
   Initiate a normal password reset for your own test account (\`wiener\`).

2. **Inspect the URL & Parameters**
   Examine the reset link and submission payload for parameters such as:
   \`\`\`text
   temp-forgot-password-token=...
   username=wiener
   \`\`\`

3. **Run the "Ghost Token" Test**
   Capture the final \`POST\` password-submission request in **Burp Proxy / Repeater**:
   - Delete the \`temp-forgot-password-token\` parameter value (or supply your own valid token).
   - Change the \`username\` parameter to a victim account (e.g., \`carlos\`).

4. **Evaluate the Result**
   If the server updates \`carlos\`'s password despite the missing or mismatched token, the reset validation logic is broken (Insecure Direct Object Reference / Logic Bypass).

---

## Defensive Engineering

- **Atomic Token Validation**
  The final \`POST\` request that commits a new password **must** require a valid, non-empty, unexpired reset token and reject any request missing one.
- **Strict Token-to-User Binding**
  Enforce a one-to-one mapping server-side so that \`Token A\` belongs strictly to \`User A\`. Derive the target user account from the token record on the server rather than trusting a client-supplied \`username\` or \`user_id\` field.
- **Single-Use Invalidation**
  Immediately invalidate the reset token upon first successful use and terminate active sessions.
`;

  const doc03 = `# 03. Password Reset Poisoning (Host Header Injection)

Password reset poisoning abuses the server's own link-generation logic to hijack a victim's secret reset token before they ever click it.

---

## Root Cause

When building absolute password-reset URLs for outgoing emails, applications sometimes dynamically read untrusted HTTP headers—such as \`Host\` or \`X-Forwarded-Host\`—instead of using a statically configured application origin.

## How to Find It (Step-by-Step)

1. **Intercept the Reset Request**
   Capture the \`POST /forgot-password\` request in Burp Suite where the target username or email is submitted.

2. **Inject Routing Headers**
   Add or modify the \`X-Forwarded-Host\` header (or test \`Host\` header overrides) to point to your **Exploit Server** or **Burp Collaborator** domain:
   \`\`\`http
   POST /forgot-password HTTP/2
   Host: target-app.example
   X-Forwarded-Host: attacker-exploit-server.example
   Content-Type: application/x-www-form-urlencoded

   username=carlos
   \`\`\`

3. **Monitor Server Logs**
   Watch your Exploit Server access logs or Burp Collaborator interactions. When the victim clicks the poisoned link in their inbox, an incoming request containing \`?temp-forgot-password-token=...\` will appear in your logs.

4. **Execute Account Takeover**
   Take the captured token and submit it directly against the **real** target website to reset the victim's password.

---

## Defensive Engineering

- **Allowlist Permitted Hosts**
  Validate the incoming \`Host\` header at the reverse proxy and application layer against an explicit allowlist of authorized domains.
- **Static Base URLs**
  Hardcode the canonical base URL (e.g., \`APP_BASE_URL\`) inside server configuration rather than constructing password-reset or OAuth redirect links dynamically from HTTP request headers.
- **Strip Untrusted Forwarding Headers**
  Configure edge proxies/load balancers to strip or overwrite client-supplied \`X-Forwarded-Host\` headers.
`;

  const doc04 = `# 04. Username Enumeration & Timing Attacks

Determining whether an account exists is frequently the first step in a targeted credential-stuffing or brute-force campaign.

---

## Root Cause

Applications inadvertently reveal account existence either through inconsistent error copy or through measurable CPU timing differences when password hashing is skipped for nonexistent users.

## How to Find It (Step-by-Step)

1. **Error Message Analysis**
   Attempt to log in with a known fake username and compare the response against a valid username with a wrong password. Look for distinct responses such as:
   - \`"Invalid User"\` vs. \`"Invalid Password"\`
   - Subtle differences in HTTP status codes, whitespace, or redirect targets.

2. **Timing Analysis in Burp Intruder**
   Send a wordlist of ~100 candidate usernames (mixing fake names and likely real accounts like \`admin\` or \`carlos\`) to the login endpoint using **Burp Intruder** (use a single thread or controlled concurrency to reduce network jitter).

3. **Inspect Response Latency**
   Sort the Intruder results by the **Response received / Time** column:
   - \`fakeuser\` completes in **~10 ms** (database lookup returns null, hashing skipped).
   - \`admin\` completes in **~200 ms** (server spends CPU cycles executing bcrypt/Argon2 verification).

   That latency gap leaks that \`admin\` is a valid account.

---

## Defensive Engineering

- **Generic Error Messaging**
  Always return an identical message and HTTP status code for every authentication failure:
  \`\`\`text
  "Invalid username or password."
  \`\`\`
- **Constant-Time Validation**
  When a username is not found in the database, perform a **dummy password hash calculation** using the same cost factor before returning the error response so valid and invalid usernames exhibit uniform latency.
`;

  const doc05 = `# 05. Brute-Force & Rate Limiting Bypasses

Even when rate limiting or IP blocking is enabled, flawed counter logic often lets attackers run high-speed password guessing uninterrupted.

---

## Root Cause

Rate limiters frequently rely on client-spoofable IP headers, reset strike counters upon any valid login from the same IP, or fail to apply throttling across secondary credential endpoints such as password-change forms.

## How to Find It (Step-by-Step)

1. **Baseline Intruder Test**
   Use **Burp Intruder** to send 100 rapid login attempts and observe whether the server triggers a \`403 Forbidden\`, \`429 Too Many Requests\`, or a CAPTCHA.

2. **IP Rotation via Forwarding Headers**
   Inject spoofed client IP headers and increment them per request:
   \`\`\`http
   X-Forwarded-For: 1.1.1.1
   X-Forwarded-For: 1.1.1.2
   \`\`\`
   Check if rotating this header resets the server's attempt counter.

3. **The "Lather, Rinse, Repeat" Test**
   - Send 3 incorrect password guesses for a victim (\`carlos\`).
   - Send **1 valid login** for your own test account (\`wiener\`).
   - Repeat the cycle. Check whether logging in successfully as yourself clears the strike counter tracked against your IP address.

4. **Secondary Endpoint Check (Password Change Brute-Force)**
   Test non-login endpoints that verify \`current-password\` without strict rate limits, such as \`POST /my-account/change-password\`:
   \`\`\`http
   POST /my-account/change-password HTTP/2
   Host: target-lab.web-security-academy.net
   Cookie: session=kbRfhtbsOLfFDcpqw4lF5eOHa7auELBO
   Content-Type: application/x-www-form-urlencoded

   username=wiener&current-password=peter&new-password-1=pass1&new-password-2=pass1
   \`\`\`

---

## Defensive Engineering

- **Account-Level Lockout**
  Lock or challenge the target account after \`X\` consecutive failed attempts (paired with a secure, rate-limited email unlock workflow).
- **Exponential Backoff**
  Increase delay intervals progressively after each failed attempt (\`1s\`, \`2s\`, \`4s\`, \`8s\`...) across all credential-checking endpoints (login, password change, MFA).
- **Independent Strike Tracking**
  Never clear failed-attempt counters for Account B when a user successfully authenticates to Account A, and never trust unverified \`X-Forwarded-For\` headers for security rate limiting.
`;

  const doc06 = `# 06. Multi-Factor Authentication (MFA) Bypasses

Multi-Factor Authentication only protects an application if the server enforces MFA completion state across every protected route and API endpoint.

---

## Root Cause

Developers often treat the 2FA verification screen as a standalone UI step rather than a mandatory session-state gate. Once a user passes the first factor (password), partial session cookies may already be accepted by internal routes.

## How to Find It (Step-by-Step)

1. **The "Forced Browsing" Test**
   Log in with a valid username and password. When the 2FA prompt appears, **do not submit a code**. Instead, manually navigate directly to protected paths in the address bar or Burp Repeater:
   \`\`\`text
   /my-account
   /admin
   \`\`\`
   If the page loads with authenticated data, MFA enforcement is missing on the target route.

2. **Response Manipulation**
   Submit an incorrect 2FA code while intercepting the HTTP response in Burp Proxy. Inspect JSON responses for client-trusted flags and tamper them:
   \`\`\`json
   {"success":false}  -->  {"success":true}
   \`\`\`

3. **OAuth Callback Misconfiguration**
   If the application supports third-party SSO ("Sign in with Google"), intercept the OAuth callback request and check whether modifying the \`email\` parameter to a victim's email address logs you in as that victim.

---

## Defensive Engineering

- **Per-Request MFA State Enforcement**
  Middleware on **every** protected route and API endpoint must verify \`session.is_mfa_authenticated === true\`—never rely solely on the login flow redirecting through \`/login2\`.
- **Server-Side Verification Only**
  Never let client-side JavaScript or tamperable JSON response booleans decide whether MFA succeeded. Upgrade the server session only after validating the OTP code server-side.
- **Prefer TOTP & Hardware Keys Over SMS**
  Favor **TOTP Authenticator apps** (or WebAuthn/FIDO2 passkeys) instead of SMS OTPs to eliminate SIM-swapping and SS7 interception risks.
- **Validate Signed OAuth Tokens**
  Verify OAuth \`id_token\` signatures and fetch user identity from trusted provider endpoints server-side rather than trusting client-supplied profile parameters.
`;

  const checklist = `# Authentication Security Audit Checklist

Use this verification checklist during pull-request reviews, architecture audits, and penetration tests.

## 01. Weak Password Storage & Cookie Handling

- [ ] Passwords are hashed with **Argon2id**, **bcrypt**, or **scrypt** (never MD5/SHA-1/unsalted SHA-256).
- [ ] Every user password uses a unique, cryptographically random salt.
- [ ] Persistent cookies (\`stay-logged-in\`, \`remember-me\`) contain opaque random UUID/CSPRNG tokens—never \`username:hash\`.
- [ ] Session cookies enforce \`HttpOnly\`, \`Secure\`, and \`SameSite\` attributes.

## 02. Password Reset IDOR & Logic Flaws

- [ ] Password reset submission (\`POST\`) rejects missing, empty, or malformed reset tokens atomically.
- [ ] Reset tokens are strictly bound to the issuing user account (\`Token A\` cannot reset \`User B\`).
- [ ] Target user identity is resolved server-side from the token, ignoring client-supplied \`username\` fields.

## 03. Password Reset Poisoning

- [ ] \`Host\` headers are validated against a strict domain allowlist.
- [ ] Password reset URLs are built from a statically configured base URL (\`APP_BASE_URL\`), never \`X-Forwarded-Host\`.

## 04. Username Enumeration & Timing Attacks

- [ ] Login and password-reset endpoints return uniform generic copy (\`"Invalid username or password."\`).
- [ ] Nonexistent usernames trigger a dummy password hash calculation to keep response times constant.

## 05. Brute-Force & Rate Limiting Bypasses

- [ ] Rate limiting keys on account/identity rather than client-spoofable \`X-Forwarded-For\` headers.
- [ ] Successful login to one account never clears failed-attempt counters for other accounts.
- [ ] Account lockout and exponential backoff (\`1s, 2s, 4s, 8s...\`) protect login and password-change endpoints.

## 06. Multi-Factor Authentication (MFA)

- [ ] Every protected page and API route verifies \`is_mfa_authenticated === true\` server-side.
- [ ] 2FA verification cannot be bypassed by forced browsing or modifying \`{"success":false}\` responses.
- [ ] TOTP authenticator apps or passkeys are favored over SMS OTPs.
- [ ] OAuth SSO callbacks validate signed tokens server-side rather than trusting client \`email\` parameters.
`;

  const contributing = `# Contributing to ${repoSlug}

Contributions that expand defensive patterns, add sanitized lab notes, or improve testing methodologies are welcome.

## Guidelines

1. **Sanitize Lab Captures**: Never commit live production credentials, real user PII, or active session tokens. Replace real domains with \`example.net\` or lab placeholders.
2. **Pair Attacks with Fixes**: Every exploitation walkthrough must include a concrete engineering remediation section.
3. **Keep Markdown Clean**: Follow standard GitHub-Flavored Markdown formatting with clear headings, fenced code blocks with language tags (\`http\`, \`json\`, \`text\`, \`bash\`), and relative links.

## Submitting Changes

\`\`\`bash
git checkout -b docs/improve-mfa-notes
git add .
git commit -m "docs: clarify OAuth callback verification"
git push origin docs/improve-mfa-notes
\`\`\`
`;

  const gitignore = `# Burp Suite & Proxy Captures
*.burp
*.pcap
*.pcapng
collaborator-logs/

# Wordlists & Local Test Data
wordlists/*.txt
*.csv

# Environment & Secrets
.env
.env.local

# OS & Editor Artifacts
.DS_Store
Thumbs.db
.vscode/
.idea/
`;

  return [
    {
      path: 'README.md',
      name: 'README.md',
      folder: null,
      category: 'root',
      description: 'Repository home, vulnerability index, and quick-start guide',
      content: readme,
    },
    {
      path: 'docs/01-weak-password-storage.md',
      name: '01-weak-password-storage.md',
      folder: 'docs',
      category: 'docs',
      description: 'Base64 cookies, unsalted MD5 reversal, and Argon2/UUID defenses',
      content: doc01,
    },
    {
      path: 'docs/02-password-reset-idor.md',
      name: '02-password-reset-idor.md',
      folder: 'docs',
      category: 'docs',
      description: 'Ghost Token testing, IDOR parameter swaps, and atomic binding',
      content: doc02,
    },
    {
      path: 'docs/03-password-reset-poisoning.md',
      name: '03-password-reset-poisoning.md',
      folder: 'docs',
      category: 'docs',
      description: 'X-Forwarded-Host poisoning, Collaborator logs, and static URLs',
      content: doc03,
    },
    {
      path: 'docs/04-username-enumeration.md',
      name: '04-username-enumeration.md',
      folder: 'docs',
      category: 'docs',
      description: 'Message diffs, Burp Intruder timing spikes, and dummy hashing',
      content: doc04,
    },
    {
      path: 'docs/05-brute-force-rate-limiting.md',
      name: '05-brute-force-rate-limiting.md',
      folder: 'docs',
      category: 'docs',
      description: 'IP rotation, Lather-Rinse-Repeat, and exponential backoff',
      content: doc05,
    },
    {
      path: 'docs/06-mfa-bypasses.md',
      name: '06-mfa-bypasses.md',
      folder: 'docs',
      category: 'docs',
      description: 'Forced browsing, response tampering, OAuth swaps, and TOTP',
      content: doc06,
    },
    {
      path: 'CHECKLIST.md',
      name: 'CHECKLIST.md',
      folder: null,
      category: 'root',
      description: 'Interactive PR & pentest authentication audit checklist',
      content: checklist,
    },
    {
      path: 'CONTRIBUTING.md',
      name: 'CONTRIBUTING.md',
      folder: null,
      category: 'root',
      description: 'Contribution standards and sanitization guidelines',
      content: contributing,
    },
    {
      path: '.gitignore',
      name: '.gitignore',
      folder: null,
      category: 'config',
      description: 'Excludes Burp projects, wordlists, and environment secrets',
      content: gitignore,
    },
  ];
}

export function buildFirewallRepoFiles(config: RepoConfig): RepoFile[] {
  const { githubUsername, repoSlug, authorName, license } = config;
  const screenshotUrl = '/assets/aistudio/01-default-firewall-rules_2f854997.png';

  const readme = `# GCP VPC Firewall Rules & Network Security

> Practical documentation and hardening guide for Google Cloud VPC default firewall rules, Cloud NGFW policies, and perimeter risk mitigation.

- **Repository:** \`${githubUsername}/${repoSlug}\`
- **Author:** ${authorName}
- **Platform:** Google Cloud Platform (Network Security / Cloud NGFW)

## Overview

When a new Google Cloud project is created with the \`default\` VPC network, GCP automatically provisions four permissive ingress firewall rules at priority \`65534\` with logging disabled (\`Off\`) and targets set to **Apply to all** instances. While convenient for quick prototyping, leaving \`default-allow-ssh\` (\`tcp:22\`) and \`default-allow-rdp\` (\`tcp:3389\`) open to the public internet exposes compute instances to automated scanning and brute-force attacks.

![Default VPC Firewall Rules in Google Cloud Console](assets/01-default-firewall-rules.png)

## Repository Structure

\`\`\`text
${repoSlug}/
├── README.md
├── CHECKLIST.md
├── CONTRIBUTING.md
├── .gitignore
├── assets/
│   └── 01-default-firewall-rules.png
└── docs/
    ├── 01-default-firewall-rules.md
    └── 02-firewall-hardening-and-policies.md
\`\`\`

## Default VPC Firewall Rules Summary

| Rule Name | Direction | Targets | Protocols / Ports | Action | Priority | Logs | Guide |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| \`default-allow-icmp\` | Ingress | Apply to all | \`icmp\` | Allow | \`65534\` | Off | [Inspect Rule](docs/01-default-firewall-rules.md) |
| \`default-allow-internal\` | Ingress | Apply to all | \`tcp:0-65535\`, \`udp:0-65535\`, \`icmp\` | Allow | \`65534\` | Off | [Inspect Rule](docs/01-default-firewall-rules.md) |
| \`default-allow-rdp\` | Ingress | Apply to all | \`tcp:3389\` | Allow | \`65534\` | Off | [Inspect Rule](docs/01-default-firewall-rules.md) |
| \`default-allow-ssh\` | Ingress | Apply to all | \`tcp:22\` | Allow | \`65534\` | Off | [Inspect Rule](docs/01-default-firewall-rules.md) |

## Key Observations from Cloud Console

1. **Implied Baseline**: By default, all incoming traffic to a VPC network is blocked (\`65535\` implied deny ingress) unless explicitly permitted by a higher-priority rule such as \`65534\`.
2. **SMTP Restriction**: Google Cloud blocks outbound \`SMTP port 25\` by default in standard projects to prevent abuse.
3. **Organization Policy Visibility**: Viewing inherited hierarchical firewall policies requires \`compute.organizations.listAssociations\` IAM permission.
4. **Logging Disabled**: All four default rules ship with Firewall Rules Logging set to **Off**, limiting visibility into accepted connection attempts.

## Quick Start

\`\`\`bash
git clone https://github.com/${githubUsername}/${repoSlug}.git
cd ${repoSlug}
\`\`\`

Review the verification steps in [CHECKLIST.md](CHECKLIST.md) before promoting a VPC network to production.

## License

Released under the ${license} License.
`;

  const doc01 = `# 01. Default VPC Firewall Rules Analysis

In Google Cloud **Network Security > Cloud NGFW > Firewall policies**, a newly initialized \`default\` VPC network contains four pre-configured ingress rules evaluated just above the implied deny-all ingress rule (\`65535\`).

![Default VPC Firewall Rules in Google Cloud Console](../assets/01-default-firewall-rules.png)

---

## Observed Rule Inventory

| Name | Type | Targets | Filters | Protocols / Ports | Action | Priority | Network | Logs |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| \`default-allow-icmp\` | Ingress | Apply to all | IP ranges (\`0.0.0.0/0\`) | \`icmp\` | Allow | \`65534\` | \`default\` | Off |
| \`default-allow-internal\` | Ingress | Apply to all | IP ranges (\`10.128.0.0/9\`) | \`tcp:0-65535\`, \`udp:0-65535\`, \`icmp\` | Allow | \`65534\` | \`default\` | Off |
| \`default-allow-rdp\` | Ingress | Apply to all | IP ranges (\`0.0.0.0/0\`) | \`tcp:3389\` | Allow | \`65534\` | \`default\` | Off |
| \`default-allow-ssh\` | Ingress | Apply to all | IP ranges (\`0.0.0.0/0\`) | \`tcp:22\` | Allow | \`65534\` | \`default\` | Off |

---

## Security Implications

1. **Broad Internet Exposure (\`0.0.0.0/0\`)**
   Both \`default-allow-ssh\` (\`tcp:22\`) and \`default-allow-rdp\` (\`tcp:3389\`) allow inbound administrative connections from any public IP address to **all** VM instances in the \`default\` network that have external IPs.
2. **Flat Internal Lateral Movement (\`default-allow-internal\`)**
   All ports (\`tcp:0-65535\`, \`udp:0-65535\`, \`icmp\`) are permitted across every subnet inside the VPC, allowing compromised workloads to probe neighboring services without restriction.
3. **Zero Audit Telemetry (\`Logs: Off\`)**
   Because logging is disabled on all four rules, security teams cannot inspect hit counts or source IPs in Cloud Logging unless logging is explicitly enabled.
4. **Organization Inheritance Blind Spots**
   Without \`compute.organizations.listAssociations\`, project-level operators cannot verify whether higher-level organization or folder firewall policies are already enforcing guardrails above the VPC.

## Auditing via \`gcloud\` CLI

Inspect active firewall rules and logging status from Cloud Shell or a workstation:

\`\`\`bash
gcloud compute firewall-rules list \\
  --filter="network:default" \\
  --format="table(name,direction,priority,sourceRanges.list():label=SRC_RANGES,allowed[].map().firewall_rule().list():label=ALLOW,logConfig.enable:label=LOGS)"
\`\`\`
`;

  const doc02 = `# 02. Firewall Hardening & Network Firewall Policies

Moving from permissive \`default\` VPC rules to least-privilege network segmentation requires replacing broad \`0.0.0.0/0\` rules with Identity-Aware Proxy (IAP) tunneling, network tags/service accounts, and IAM-governed Network Firewall Policies.

---

## Hardening Steps

### 1. Replace Public SSH & RDP with Identity-Aware Proxy (IAP)

Instead of allowing \`tcp:22\` and \`tcp:3389\` from \`0.0.0.0/0\`, restrict administrative access strictly to Google's IAP forwarding range (\`35.235.240.0/20\`) and remove public external IPs from compute instances:

\`\`\`bash
# Delete permissive default SSH and RDP rules
gcloud compute firewall-rules delete default-allow-ssh default-allow-rdp --quiet

# Allow SSH/RDP strictly through IAP TCP forwarding
gcloud compute firewall-rules create allow-iap-ssh-rdp \\
  --network=default \\
  --direction=INGRESS \\
  --action=ALLOW \\
  --rules=tcp:22,tcp:3389 \\
  --source-ranges=35.235.240.0/20 \\
  --enable-logging
\`\`\`

### 2. Scope Rules with Service Accounts or Network Tags

Avoid \`Apply to all\` targets for application ports. Bind ingress rules to explicit **target service accounts** (preferred, IAM-controlled) or **network tags**:

\`\`\`bash
gcloud compute firewall-rules create allow-https-web-tier \\
  --network=default \\
  --direction=INGRESS \\
  --action=ALLOW \\
  --rules=tcp:443 \\
  --source-ranges=0.0.0.0/0 \\
  --target-service-accounts=web-frontend@PROJECT_ID.iam.gserviceaccount.com \\
  --priority=1000 \\
  --enable-logging
\`\`\`

### 3. Enable Firewall Rules Logging

Enable logging on critical allow and explicit deny rules to surface connection telemetry in Cloud Logging and verify hit counts:

\`\`\`bash
gcloud compute firewall-rules update default-allow-icmp --enable-logging
\`\`\`

### 4. Adopt Network Firewall Policies

As noted in Cloud NGFW, **Network firewall policies** allow teams to group multiple rules into a single versioned policy object controlled by IAM roles (\`compute.networkFirewallPolicyAdmin\`), supporting:
- Geo-location, threat intelligence, and FQDN objects
- Address groups instead of hardcoding raw CIDR blocks
- Consistent ordering across subnets and VPCs
`;

  const checklist = `# GCP VPC Firewall Security Audit Checklist

Use this checklist when auditing default VPC networks or reviewing Cloud NGFW firewall policy changes.

## 01. Default Rule Cleanup

- [ ] \`default-allow-ssh\` (\`tcp:22\` from \`0.0.0.0/0\`) is removed or restricted to specific bastion/admin CIDRs.
- [ ] \`default-allow-rdp\` (\`tcp:3389\` from \`0.0.0.0/0\`) is removed or replaced with IAP tunneling.
- [ ] \`default-allow-icmp\` is reviewed and restricted if external ping discovery is unnecessary.
- [ ] \`default-allow-internal\` (\`tcp:0-65535\`, \`udp:0-65535\`) is narrowed to required service ports and tiers.

## 02. Least-Privilege & Identity Controls

- [ ] Administrative SSH/RDP traffic uses Identity-Aware Proxy (\`35.235.240.0/20\`) rather than public IPs.
- [ ] Ingress rules target specific **service accounts** or network tags instead of **Apply to all**.
- [ ] Network firewall policies are governed via IAM least-privilege roles.
- [ ] Operators auditing inherited policies hold \`compute.organizations.listAssociations\` (read-only) where appropriate.

## 03. Observability & Egress Controls

- [ ] Firewall Rules Logging is enabled (\`Logs: On\`) for perimeter allow and deny rules.
- [ ] Explicit deny-egress or DNS/proxy controls supplement GCP's built-in \`SMTP port 25\` restriction.
`;

  const contributing = `# Contributing to ${repoSlug}

Contributions covering Cloud NGFW rules, hierarchical firewall policies, and Terraform/\`gcloud\` hardening examples are welcome.

## Guidelines

1. **Sanitize Project Identifiers**: Replace live organization IDs, internal IPs, and sensitive project numbers with placeholders before committing screenshots or CLI outputs.
2. **Keep Images Under \`assets/\`**: Reference screenshots with relative Markdown paths (\`assets/...\` from root or \`../assets/...\` from \`docs/\`).
3. **Include Verification Commands**: Pair architectural recommendations with reproducible \`gcloud\` commands.
`;

  const gitignore = `# Terraform & IaC State
*.tfstate
*.tfstate.*
.terraform/
*.tfvars

# GCP Credentials & Local Config
*-key.json
credentials.json
.env
.env.local

# OS & Editor Artifacts
.DS_Store
Thumbs.db
.vscode/
.idea/
`;

  return [
    {
      path: 'README.md',
      name: 'README.md',
      folder: null,
      category: 'root',
      description: 'Repository overview with embedded GCP Console screenshot and rule summary',
      content: readme,
    },
    {
      path: 'docs/01-default-firewall-rules.md',
      name: '01-default-firewall-rules.md',
      folder: 'docs',
      category: 'docs',
      description: 'Rule-by-rule breakdown, security risks, and gcloud inspection commands',
      content: doc01,
    },
    {
      path: 'docs/02-firewall-hardening-and-policies.md',
      name: '02-firewall-hardening-and-policies.md',
      folder: 'docs',
      category: 'docs',
      description: 'IAP tunneling, service-account scoping, logging, and Network Firewall Policies',
      content: doc02,
    },
    {
      path: 'assets/01-default-firewall-rules.png',
      name: '01-default-firewall-rules.png',
      folder: 'assets',
      category: 'asset',
      description: 'Google Cloud Console VPC firewall policies screenshot',
      content: '',
      assetUrl: screenshotUrl,
    },
    {
      path: 'CHECKLIST.md',
      name: 'CHECKLIST.md',
      folder: null,
      category: 'root',
      description: 'GCP VPC default firewall and Cloud NGFW audit checklist',
      content: checklist,
    },
    {
      path: 'CONTRIBUTING.md',
      name: 'CONTRIBUTING.md',
      folder: null,
      category: 'root',
      description: 'Contribution standards and screenshot sanitization rules',
      content: contributing,
    },
    {
      path: '.gitignore',
      name: '.gitignore',
      folder: null,
      category: 'config',
      description: 'Excludes Terraform state, GCP key JSONs, and local artifacts',
      content: gitignore,
    },
  ];
}

export function getRepoBundle(repoId: RepoId, config: RepoConfig): RepoBundle {
  if (repoId === 'gcp-firewall-rules') {
    const screenshotUrl = '/assets/aistudio/01-default-firewall-rules_2f854997.png';
    return {
      id: 'gcp-firewall-rules',
      label: 'gcp-firewall-rules',
      subtitle: '7 files · 2 guides · 1 screenshot · Google Cloud Network Security',
      files: buildFirewallRepoFiles(config),
      assetMap: {
        'assets/01-default-firewall-rules.png': screenshotUrl,
        '../assets/01-default-firewall-rules.png': screenshotUrl,
      },
      matrixTitle: 'Default VPC Firewall Rules Matrix',
      matrixSubtitle: 'Google Cloud Network Security · Cloud NGFW',
      matrixDescription:
        'Inventory of the four default ingress firewall rules provisioned at priority 65534, their exposure profile, and least-privilege remediation steps.',
      matrixRows: FIREWALL_MATRIX,
      checklistTitle: 'GCP VPC Firewall Audit Checklist',
      checklistDescription:
        'Verify default rule cleanup, IAP administrative tunneling, service-account targeting, and Cloud Logging status.',
      checklistItems: FIREWALL_CHECKLIST_ITEMS,
    };
  }

  return {
    id: 'auth-frontier',
    label: 'auth-frontier',
    subtitle: '10 files · 6 vulnerability guides · PortSwigger Web Security Academy',
    files: buildAuthRepoFiles(config),
    assetMap: {},
    matrixTitle: 'Authentication Vulnerability Matrix',
    matrixSubtitle: 'PortSwigger Web Security Academy · Authentication Vulnerabilities',
    matrixDescription:
      'Structured index of all six authentication attack classes covered in the repository, mapping detection workflows to server-side engineering defenses.',
    matrixRows: VULNERABILITY_MATRIX,
    checklistTitle: 'Authentication Security Audit Checklist',
    checklistDescription:
      'Verify controls across storage, password resets, rate limiting, and MFA enforcement before shipping.',
    checklistItems: AUDIT_CHECKLIST_ITEMS,
  };
}
