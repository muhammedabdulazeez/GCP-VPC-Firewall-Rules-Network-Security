# 02. Password Reset IDOR & Logic Flaws

Password reset endpoints are often the weakest link in an authentication architecture because they authorize a password change without requiring knowledge of the current password.

---

## Root Cause

Broken state validation between the email link generation step and the final password-change submission allows an attacker to either omit the verification token altogether or supply their own valid token while targeting a different user's `username`.

## How to Find It (Step-by-Step)

1. **Trigger a Reset**
   Initiate a normal password reset for your own test account (`wiener`).

2. **Inspect the URL & Parameters**
   Examine the reset link and submission payload for parameters such as:
   ```text
   temp-forgot-password-token=...
   username=wiener
   ```

3. **Run the "Ghost Token" Test**
   Capture the final `POST` password-submission request in **Burp Proxy / Repeater**:
   - Delete the `temp-forgot-password-token` parameter value (or supply your own valid token).
   - Change the `username` parameter to a victim account (e.g., `carlos`).

4. **Evaluate the Result**
   If the server updates `carlos`'s password despite the missing or mismatched token, the reset validation logic is broken (Insecure Direct Object Reference / Logic Bypass).

---

## Defensive Engineering

- **Atomic Token Validation**
  The final `POST` request that commits a new password **must** require a valid, non-empty, unexpired reset token and reject any request missing one.
- **Strict Token-to-User Binding**
  Enforce a one-to-one mapping server-side so that `Token A` belongs strictly to `User A`. Derive the target user account from the token record on the server rather than trusting a client-supplied `username` or `user_id` field.
- **Single-Use Invalidation**
  Immediately invalidate the reset token upon first successful use and terminate active sessions.
