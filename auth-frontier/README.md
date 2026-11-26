# The Authentication Frontier

> Practical field notes on modern web authentication flaws, exploitation workflows, and defensive architecture.

- **Repository:** `your-username/auth-frontier`
- **Author:** Muhammed Abdulazeez
- **Source Material:** PortSwigger Web Security Academy (Authentication Vulnerabilities — 55/55 Labs Completed)

## Overview

This repository documents how seemingly secure authentication controls—password hashing, "remember me" cookies, multi-factor authentication (MFA), rate limiters, and password reset flows—fail when implemented with flawed business logic.

Rather than focusing purely on brute-force password guessing, **Auth Frontier** breaks down logic-based exploitation techniques and pairs each vulnerability class with concrete engineering remediations.

## Repository Structure

```text
auth-frontier/
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
```

## Core Vulnerabilities & Exploits

| # | Vulnerability Class | Primary Attack Vector | Key Defense | Guide |
| :--- | :--- | :--- | :--- | :--- |
| 01 | Weak Password Storage & Cookie Handling | Base64-decoded `stay-logged-in` cookie revealing `username:md5` | Slow salted hashing (`Argon2`/`bcrypt`) + opaque UUID tokens | [Read Guide](docs/01-weak-password-storage.md) |
| 02 | Password Reset IDOR & Logic Flaws | Ghost Token test (stripping token & swapping `username`) | Atomic token verification + strict Token-to-User binding | [Read Guide](docs/02-password-reset-idor.md) |
| 03 | Password Reset Poisoning | Injecting `X-Forwarded-Host` to hijack reset links | Static base URLs + strict `Host` header allowlisting | [Read Guide](docs/03-password-reset-poisoning.md) |
| 04 | Username Enumeration & Timing Attacks | Error string diffs & response latency spikes during hashing | Generic error copy + constant-time dummy hash check | [Read Guide](docs/04-username-enumeration.md) |
| 05 | Brute-Force & Rate Limiting Bypasses | `X-Forwarded-For` spoofing & Lather-Rinse-Repeat resets | Per-account lockout + exponential backoff (`1s, 2s, 4s, 8s...`) | [Read Guide](docs/05-brute-force-rate-limiting.md) |
| 06 | Multi-Factor Authentication Bypasses | Forced browsing, `{"success":true}` tampering, OAuth swap | Server-side `is_mfa_authenticated` checks + TOTP apps | [Read Guide](docs/06-mfa-bypasses.md) |

## Key Takeaway

> Moving from simple password guessing to **logic-based exploitation** shows that attackers do not need to crack a password if they can trick the server into ignoring the verification check entirely.

## Quick Start

Clone this repository locally for reference during security assessments or code reviews:

```bash
git clone https://github.com/your-username/auth-frontier.git
cd auth-frontier
```

For pre-release security reviews, follow the verification items in [CHECKLIST.md](CHECKLIST.md).

## License

Released under the MIT License.
