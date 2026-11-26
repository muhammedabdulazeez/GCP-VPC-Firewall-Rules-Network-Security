# Contributing to auth-frontier

Contributions that expand defensive patterns, add sanitized lab notes, or improve testing methodologies are welcome.

## Guidelines

1. **Sanitize Lab Captures**: Never commit live production credentials, real user PII, or active session tokens. Replace real domains with `example.net` or lab placeholders.
2. **Pair Attacks with Fixes**: Every exploitation walkthrough must include a concrete engineering remediation section.
3. **Keep Markdown Clean**: Follow standard GitHub-Flavored Markdown formatting with clear headings, fenced code blocks with language tags (`http`, `json`, `text`, `bash`), and relative links.

## Submitting Changes

```bash
git checkout -b docs/improve-mfa-notes
git add .
git commit -m "docs: clarify OAuth callback verification"
git push origin docs/improve-mfa-notes
```
