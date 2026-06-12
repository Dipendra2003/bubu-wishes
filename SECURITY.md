# Security Policy

## Supported Versions

We release patches for security vulnerabilities for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of Birthday Bubu Wishes seriously. If you believe you have found a security vulnerability, please report it to us responsibly.

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to: security@yourdomain.com

You should receive a response within 48 hours. If for some reason you do not, please follow up via email to ensure we received your original message.

Please include the following information in your report:

- Type of issue (e.g., buffer overflow, SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the manifestation of the issue
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

## Security Best Practices

### For Users

1. **Environment Variables**: Never commit `.env` files to version control
2. **JWT Secret**: Use a strong, randomly generated JWT_SECRET in production
3. **Database**: Use SSL/TLS for database connections
4. **SMTP**: Use app-specific passwords, not your main email password
5. **API Keys**: Keep your Gemini API key and Cloudinary credentials secret
6. **Updates**: Keep dependencies up to date with `npm audit` and `npm update`

### For Developers

1. **Input Validation**: Always validate and sanitize user input
2. **SQL Injection**: Use parameterized queries (Drizzle ORM handles this)
3. **XSS Prevention**: React escapes by default, but be careful with `dangerouslySetInnerHTML`
4. **CSRF Protection**: Implement CSRF tokens for state-changing operations
5. **Rate Limiting**: Rate limiting is implemented on auth routes
6. **Password Security**: Passwords are hashed with bcrypt
7. **JWT Security**: Tokens have expiration times
8. **HTTPS**: Always use HTTPS in production
9. **Content Security Policy**: Configure CSP headers appropriately
10. **Dependency Audits**: Run `npm audit` regularly

## Security Features

### Current Implementation

- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ Email verification (OTP)
- ✅ Rate limiting on auth endpoints
- ✅ Helmet.js security headers
- ✅ Input validation and sanitization
- ✅ SQL injection protection (Drizzle ORM)
- ✅ Secure file uploads (Cloudinary)
- ✅ Environment variable protection

### Known Limitations

- CSRF tokens not yet implemented
- Session management could be enhanced
- No 2FA support yet
- File upload size limits could be more granular

## Vulnerability Disclosure Policy

We follow the principle of responsible disclosure:

1. **Report**: Submit vulnerability details privately
2. **Acknowledge**: We confirm receipt within 48 hours
3. **Investigate**: We investigate and develop a fix
4. **Fix**: We release a patch
5. **Disclose**: After the fix is released, we may publicly disclose the vulnerability

## Contact

For security-related questions or concerns:
- Email: security@yourdomain.com
- For non-security issues, use GitHub issues

Thank you for helping keep Birthday Bubu Wishes and our users safe! 🔒
