# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.4.x   | ✅ Supported       |
| 1.3.x   | ✅ Supported       |
| < 1.3   | ❌ Not supported   |

## Reporting a Vulnerability

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please report them via dm to @osknyo_dev (or create a private advisory on GitHub).

### What to Include

- Type of vulnerability
- Full paths of affected source files
- Step-by-step instructions to reproduce
- Proof-of-concept or exploit code (if possible)
- Impact assessment

### Response Timeline

- **24 hours**: Initial acknowledgment
- **72 hours**: Preliminary assessment
- **7 days**: Fix development (for confirmed vulnerabilities)
- **14 days**: Public disclosure (coordinated)

## Security Best Practices

When self-hosting PayPortal:

1. **API Keys**: Use strong, unique API keys
2. **HTTPS**: Always use TLS in production
3. **RPC Nodes**: Use your own nodes or trusted providers
4. **Webhooks**: Verify webhook signatures
5. **Updates**: Keep PayPortal updated to the latest version
6. **Firewall**: Restrict access to admin endpoints

## Scope

Security issues we care about:
- Authentication/authorization bypasses
- Payment verification bypasses
- Injection vulnerabilities
- Data exposure

Out of scope:
- Blockchain consensus attacks
- Third-party RPC provider issues
- Self-hosted misconfiguration

## Recognition

We appreciate security researchers who help keep PayPortal secure. Reporters of valid vulnerabilities will be:
- Credited in release notes (if desired)
- Listed in our security hall of fame

Thank you for helping keep PayPortal and its users safe! 🛡️

