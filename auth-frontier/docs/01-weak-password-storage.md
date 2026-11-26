# 01. Weak Password Storage & Cookie Handling

When authentication is implemented hastily, applications frequently leak credentials or unsalted password hashes directly inside client-side cookies.

---

## Root Cause

Developers sometimes build persistent login features (`stay-logged-in` or `remember-me`) by encoding a deterministic `username:hash` string into a cookie rather than issuing an opaque, randomly generated session identifier stored server-side.

## How to Find It (Step-by-Step)

1. **Identify Cookies**
   Log in with "Stay logged in" enabled and inspect your browser's DevTools (**Storage / Application** tab) or Burp Suite **Proxy > HTTP history**. Look for cookies named `stay-logged-in` or `remember-me`.

2. **Decode the Cookie Value**
   Most persistent cookies are Base64 encoded. Send the raw cookie string to **Burp Decoder** and decode as Base64.

3. **Pattern Match**
   Inspect the decoded output for structured pairs such as:
   ```text
   wiener:51dc30ddc473d43a6011e9ebba6ca770
   ```
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
  Never store credentials or password hashes in cookies. Issue a cryptographically random **UUID / CSPRNG Session ID** that maps to a user session record in a secure server-side store, with `HttpOnly`, `Secure`, and `SameSite` flags enabled.
