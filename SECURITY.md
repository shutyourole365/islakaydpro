# Security Policy

## Supported Versions

We release security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue, please follow these steps:

### 1. Do Not Disclose Publicly

Please do not open a public GitHub issue for security vulnerabilities.

### 2. Contact Us Privately

Send an email to: **security@islakayd.com** with:

- A description of the vulnerability
- Steps to reproduce the issue
- Potential impact
- Any suggested fixes (if applicable)

### 3. Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**: Depends on severity
  - Critical: 1-7 days
  - High: 7-30 days
  - Medium: 30-90 days
  - Low: Best effort basis

### 4. Disclosure Policy

- We will acknowledge receipt of your vulnerability report
- We will confirm the vulnerability and determine its impact
- We will release a fix as per the timeline above
- We will publicly disclose the vulnerability after the fix is released
- We will credit you in the security advisory (unless you prefer to remain anonymous)

## Security Best Practices

### For Users

- Keep your account credentials secure
- Enable two-factor authentication
- Use strong, unique passwords
- Be cautious of phishing attempts
- Keep your browser up to date

### For Developers

- Never commit sensitive data (API keys, passwords, etc.)
- Use environment variables for configuration
- Follow secure coding practices
- Regularly update dependencies
- Run security audits: `npm audit`
- Enable Dependabot security updates

## Security Features

Our platform implements:

- **Authentication**: Supabase Auth with JWT tokens
- **Authorization**: Row-Level Security (RLS) policies
- **Data Protection**: Input sanitization and validation
- **Encryption**: HTTPS/TLS for all connections
- **Session Management**: Secure session handling with device tracking
- **Audit Logging**: Complete activity tracking
- **Rate Limiting**: Protection against brute force attacks
- **XSS Protection**: Content Security Policy headers
- **CSRF Protection**: Token-based CSRF prevention

## Known Security Considerations

- Demo mode uses sample data and should not be used in production
- Ensure Supabase RLS policies are properly configured
- Configure proper CORS settings for production
- Use environment variables for all sensitive configuration

## Third-Party Dependencies

We regularly monitor and update our dependencies:

```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# For breaking changes
npm audit fix --force
```

## Compliance

We strive to comply with:

- GDPR (General Data Protection Regulation)
- CCPA (California Consumer Privacy Act)
- SOC 2 Type II (in progress)
- PCI DSS for payment processing (via Stripe)

## Questions?

For general security questions: security@islakayd.com

Thank you for helping keep Islakayd secure! 🔒
