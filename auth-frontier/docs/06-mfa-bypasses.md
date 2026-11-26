# 06. Multi-Factor Authentication (MFA) Bypasses

Multi-Factor Authentication only protects an application if the server enforces MFA completion state across every protected route and API endpoint.

---

## Root Cause

Developers often treat the 2FA verification screen as a standalone UI step rather than a mandatory session-state gate. Once a user passes the first factor (password), partial session cookies may already be accepted by internal routes.

## How to Find It (Step-by-Step)

1. **The "Forced Browsing" Test**
   Log in with a valid username and password. When the 2FA prompt appears, **do not submit a code**. Instead, manually navigate directly to protected paths in the address bar or Burp Repeater:
   ```text
   /my-account
   /admin
   ```
   If the page loads with authenticated data, MFA enforcement is missing on the target route.

2. **Response Manipulation**
   Submit an incorrect 2FA code while intercepting the HTTP response in Burp Proxy. Inspect JSON responses for client-trusted flags and tamper them:
   ```json
   {"success":false}  -->  {"success":true}
   ```

3. **OAuth Callback Misconfiguration**
   If the application supports third-party SSO ("Sign in with Google"), intercept the OAuth callback request and check whether modifying the `email` parameter to a victim's email address logs you in as that victim.

---

## Defensive Engineering

- **Per-Request MFA State Enforcement**
  Middleware on **every** protected route and API endpoint must verify `session.is_mfa_authenticated === true`—never rely solely on the login flow redirecting through `/login2`.
- **Server-Side Verification Only**
  Never let client-side JavaScript or tamperable JSON response booleans decide whether MFA succeeded. Upgrade the server session only after validating the OTP code server-side.
- **Prefer TOTP & Hardware Keys Over SMS**
  Favor **TOTP Authenticator apps** (or WebAuthn/FIDO2 passkeys) instead of SMS OTPs to eliminate SIM-swapping and SS7 interception risks.
- **Validate Signed OAuth Tokens**
  Verify OAuth `id_token` signatures and fetch user identity from trusted provider endpoints server-side rather than trusting client-supplied profile parameters.
