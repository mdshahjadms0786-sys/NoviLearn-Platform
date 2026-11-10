# Security Policy

NoviLearn takes the security and privacy of student data, developer keys, and learning infrastructure seriously. We appreciate the responsible disclosure of vulnerabilities by security researchers and the open-source community.

---

## Supported Versions

Only the latest active development version and tagged release branches receive security updates.

| Version | Supported          |
| ------- | ------------------ |
| 0.2.x   | :white_check_mark: |
| 0.1.x   | :x:                |
| < 0.1   | :x:                |

---

## Reporting a Vulnerability

If you discover a security vulnerability within NoviLearn, please **DO NOT** create a public GitHub issue, pull request, or discussion. Public disclosure puts existing deployments and users at risk.

### Responsible Disclosure Process:

1. **Email Details**: Send a description of the issue to **security@novilearn.org** (or initiate a private GitHub Security Advisory in the repository).
2. **Provide Details**:
   - Description of the vulnerability and its potential impact.
   - Step-by-step reproduction instructions or a minimal Proof of Concept (PoC).
   - Affected components (`apps/api`, `apps/web`, authentication middleware, AI provider keys).
   - Any proposed mitigations or fixes.
3. **Acknowledgment & Timeline**:
   - We will acknowledge receipt of your report within 48 hours.
   - We will provide regular status updates during investigation and patching.
   - We will release a security advisory and patched version within a reasonable coordinated disclosure window.

---

## Security Best Practices for Self-Hosters

When self-hosting NoviLearn in production:

- **Never expose raw database ports**: Keep PostgreSQL accessible only to the internal container network.
- **Rotate AI Provider Keys**: Store `GEMINI_API_KEY`, `OPENAI_API_KEY`, or `ANTHROPIC_API_KEY` strictly in private environment files or secret managers. Never commit them to Git.
- **Enable HTTPS**: Always front the Next.js frontend and Express API with a reverse proxy (e.g. Nginx, Caddy, Cloudflare) with valid TLS certificates.
- **Configure CORS & Rate Limits**: Set strict allowed origins in `CORS_ORIGIN` and tune the Express rate limiter in `apps/api/src/middleware/rate-limit.js`.
