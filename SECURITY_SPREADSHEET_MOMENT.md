# Security Policy

## Supported Versions

Currently supported versions with security updates:

| Version | Supported          |
|---------|---------------------|
| 1.0.x   | :white_check_mark: Yes |
| < 1.0   | :x: No                |

## Reporting a Vulnerability

### How to Report

**DO NOT** open a public issue for security vulnerabilities.

Instead, send an email to: **security@superinstance.ai**

### What to Include

Please include as much information as possible:

1. **Description**: Clear description of the vulnerability
2. **Impact**: Potential impact on users
3. **Reproduction**: Steps to reproduce the issue
4. **Proof of Concept**: If available (encrypted)
5. **Affected Versions**: Which versions are affected
6. **Suggested Fix**: If you have a proposed solution

### Response Timeline

- **Initial Response**: Within 48 hours
- **Detailed Response**: Within 7 days
- **Resolution**: As soon as practical (based on severity)
- **Public Disclosure**: After fix is released

### Vulnerability Severity

We use CVSS (Common Vulnerability Scoring System) to assess severity:

- **Critical (9.0-10.0)**: Immediate fix, release within 48 hours
- **High (7.0-8.9)**: Fix in next release (within 7 days)
- **Medium (4.0-6.9)**: Fix in next scheduled release
- **Low (0.1-3.9)**: Fix when convenient

## Security Best Practices

### For Users

1. **Keep Updated**: Always use the latest version
2. **Review Permissions**: Only grant necessary permissions
3. **Secure Network**: Use on trusted networks only
4. **Backups**: Regularly backup important spreadsheets
5. **Strong Passwords**: Use strong, unique passwords

### For Developers

1. **Input Validation**: Validate all user inputs
2. **Sanitization**: Sanitize data before processing
3. **Dependencies**: Keep dependencies updated
4. **Secrets Management**: Never hardcode secrets
5. **Security Reviews**: Review code for security issues

## Security Features

### Built-in Protections

- **CSP Headers**: Content Security Policy
- **Input Sanitization**: All inputs are sanitized
- **XSS Protection**: Cross-site scripting protection
- **CSRF Tokens**: Cross-site request forgery protection
- **Encryption**: Data encrypted at rest and in transit
- **Authentication**: OAuth 2.0 for third-party integrations

### Data Protection

- **Data at Rest**: Encrypted using AES-256
- **Data in Transit**: TLS 1.3 for all connections
- **Access Control**: Role-based access control
- **Audit Logging**: All access logged
- **Data Retention**: Configurable retention policies

## Dependency Security

### Scanning

- **Automated Scans**: Nightly vulnerability scans
- **PR Checks**: All PRs checked for vulnerabilities
- **Dependabot**: Automated dependency updates
- **Manual Review**: Security review of new dependencies

### Reporting

Security advisories for dependencies will be:
1. Assessed for impact
2. Communicated to users
3. Fixed in patch releases
4. Documented in changelog

## Disclosure Policy

### Coordinated Disclosure

We follow responsible disclosure:

1. **Report**: Report vulnerability to security@superinstance.ai
2. **Acknowledge**: We acknowledge receipt within 48 hours
3. **Investigate**: We investigate and assess severity
4. **Fix**: We develop and test a fix
5. **Release**: We release a fix
6. **Disclose**: We publicly disclose after fix is available

### Credit

We credit security researchers who report vulnerabilities (with permission).

## Security Audits

### Past Audits

| Date       | Auditor          | Scope          | Findings |
|------------|------------------|----------------|----------|
| 2026-03-01 | SuperInstance Internal | Full codebase | 0 critical, 1 high, 3 medium |

### Future Audits

We plan annual security audits. Results will be published here.

## Security Contacts

- **Security Team**: security@superinstance.ai
- **GitHub Security**: [@SuperInstance](https://github.com/SuperInstance)
- **PGP Key**: Available on [Keybase](https://keybase.io/superinstance)

## Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CWE Top 25](https://cwe.mitre.org/top25/)
- [CVSS Calculator](https://www.first.org/cvss/calculator/3.1)

## Security Changelog

### Version 1.0.1 (2026-03-15)
- Fixed XSS vulnerability in NLP query handling (HIGH)
- Updated dependencies for security patches
- Added input sanitization for user-provided formulas

### Version 1.0.0 (2026-03-14)
- Initial release with security best practices

---

**Last Updated**: 2026-03-14
**Next Review**: 2026-06-14
