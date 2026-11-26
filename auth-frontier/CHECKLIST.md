# Authentication Security Audit Checklist

Use this verification checklist during pull-request reviews, architecture audits, and penetration tests.

## 01. Weak Password Storage & Cookie Handling

- [ ] Passwords are hashed with **Argon2id**, **bcrypt**, or **scrypt** (never MD5/SHA-1/unsalted SHA-256).
- [ ] Every user password uses a unique, cryptographically random salt.
- [ ] Persistent cookies (`stay-logged-in`, `remember-me`) contain opaque random UUID/CSPRNG tokens—never `username:hash`.
- [ ] Session cookies enforce `HttpOnly`, `Secure`, and `SameSite` attributes.

## 02. Password Reset IDOR & Logic Flaws

- [ ] Password reset submission (`POST`) rejects missing, empty, or malformed reset tokens atomically.
- [ ] Reset tokens are strictly bound to the issuing user account (`Token A` cannot reset `User B`).
- [ ] Target user identity is resolved server-side from the token, ignoring client-supplied `username` fields.

## 03. Password Reset Poisoning

- [ ] `Host` headers are validated against a strict domain allowlist.
- [ ] Password reset URLs are built from a statically configured base URL (`APP_BASE_URL`), never `X-Forwarded-Host`.

## 04. Username Enumeration & Timing Attacks

- [ ] Login and password-reset endpoints return uniform generic copy (`"Invalid username or password."`).
- [ ] Nonexistent usernames trigger a dummy password hash calculation to keep response times constant.

## 05. Brute-Force & Rate Limiting Bypasses

- [ ] Rate limiting keys on account/identity rather than client-spoofable `X-Forwarded-For` headers.
- [ ] Successful login to one account never clears failed-attempt counters for other accounts.
- [ ] Account lockout and exponential backoff (`1s, 2s, 4s, 8s...`) protect login and password-change endpoints.

## 06. Multi-Factor Authentication (MFA)

- [ ] Every protected page and API route verifies `is_mfa_authenticated === true` server-side.
- [ ] 2FA verification cannot be bypassed by forced browsing or modifying `{"success":false}` responses.
- [ ] TOTP authenticator apps or passkeys are favored over SMS OTPs.
- [ ] OAuth SSO callbacks validate signed tokens server-side rather than trusting client `email` parameters.
