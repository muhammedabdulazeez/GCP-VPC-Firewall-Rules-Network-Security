# 05. Brute-Force & Rate Limiting Bypasses

Even when rate limiting or IP blocking is enabled, flawed counter logic often lets attackers run high-speed password guessing uninterrupted.

---

## Root Cause

Rate limiters frequently rely on client-spoofable IP headers, reset strike counters upon any valid login from the same IP, or fail to apply throttling across secondary credential endpoints such as password-change forms.

## How to Find It (Step-by-Step)

1. **Baseline Intruder Test**
   Use **Burp Intruder** to send 100 rapid login attempts and observe whether the server triggers a `403 Forbidden`, `429 Too Many Requests`, or a CAPTCHA.

2. **IP Rotation via Forwarding Headers**
   Inject spoofed client IP headers and increment them per request:
   ```http
   X-Forwarded-For: 1.1.1.1
   X-Forwarded-For: 1.1.1.2
   ```
   Check if rotating this header resets the server's attempt counter.

3. **The "Lather, Rinse, Repeat" Test**
   - Send 3 incorrect password guesses for a victim (`carlos`).
   - Send **1 valid login** for your own test account (`wiener`).
   - Repeat the cycle. Check whether logging in successfully as yourself clears the strike counter tracked against your IP address.

4. **Secondary Endpoint Check (Password Change Brute-Force)**
   Test non-login endpoints that verify `current-password` without strict rate limits, such as `POST /my-account/change-password`:
   ```http
   POST /my-account/change-password HTTP/2
   Host: target-lab.web-security-academy.net
   Cookie: session=kbRfhtbsOLfFDcpqw4lF5eOHa7auELBO
   Content-Type: application/x-www-form-urlencoded

   username=wiener&current-password=peter&new-password-1=pass1&new-password-2=pass1
   ```

---

## Defensive Engineering

- **Account-Level Lockout**
  Lock or challenge the target account after `X` consecutive failed attempts (paired with a secure, rate-limited email unlock workflow).
- **Exponential Backoff**
  Increase delay intervals progressively after each failed attempt (`1s`, `2s`, `4s`, `8s`...) across all credential-checking endpoints (login, password change, MFA).
- **Independent Strike Tracking**
  Never clear failed-attempt counters for Account B when a user successfully authenticates to Account A, and never trust unverified `X-Forwarded-For` headers for security rate limiting.
