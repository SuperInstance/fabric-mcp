# Security Quick Reference Guide

**Platform:** Spreadsheet Moment
**Last Updated:** 2026-03-15
**Status:** All Critical & High Issues Fixed ✓

---

## 🚨 Quick Links

- [Complete Security Fixes Summary](SECURITY_FIXES_SUMMARY.md)
- [Migration Guide](SECURITY_MIGRATION_GUIDE.md)
- [Final Audit Report](SECURITY_AUDIT_FIXES_FINAL.md)
- [Security Test Suite](src/core/security/__tests__/security-fixed.test.ts)

---

## 📋 Security Fixes Overview

### Fixed Vulnerabilities

| # | Issue | Severity | Status | File |
|---|-------|----------|--------|------|
| 1 | Mock cryptographic implementations | CRITICAL | ✓ Fixed | `src/core/security/crypto-fixed.ts` |
| 2 | Weak JWT implementation | CRITICAL | ✓ Fixed | `src/core/security/crypto-fixed.ts` |
| 3 | Permissive CORS configuration | HIGH | ✓ Fixed | `src/core/security/hardening-fixed.ts` |
| 4 | Missing CSRF protection | HIGH | ✓ Fixed | `src/core/security/hardening-fixed.ts` |
| 5 | Weak key management | HIGH | ✓ Fixed | `src/core/security/crypto-fixed.ts` |
| 6 | Missing GraphQL rate limiting | HIGH | ✓ Fixed | `src/core/security/hardening-fixed.ts` |
| 7 | Inconsistent input validation | MEDIUM | ✓ Fixed | `src/core/security/hardening-fixed.ts` |

---

## 🔑 Key Security Features

### 1. Cryptographic Implementations

**Ed25519 Signatures:**
```typescript
import { SignatureService, KeyManager } from './crypto';

const keyManager = new KeyManager();
const signatureService = new SignatureService(keyManager);

// Sign data
const signed = await signatureService.sign({ message: 'test data' });

// Verify signature
const isValid = await signatureService.verifySignedData(signed);
```

**JWT with RS256:**
```typescript
import { JWTService } from './crypto';

const jwtService = new JWTService({
  privateKey: process.env.JWT_PRIVATE_KEY,
  publicKey: process.env.JWT_PUBLIC_KEY,
  algorithm: 'RS256',
  expiresIn: '1h',
  issuer: 'spreadsheetmoment',
  audience: 'spreadsheetmoment-api'
});

// Generate token
const token = await jwtService.generateToken({ userId: '123' });

// Verify token
const decoded = await jwtService.verifyToken(token);
```

**Password Hashing (Argon2id):**
```typescript
import { hashPassword, verifyPassword } from './crypto';

// Hash password
const hash = await hashPassword('SecurePassword123!');

// Verify password
const isValid = await verifyPassword('SecurePassword123!', hash);
```

### 2. CORS Configuration

**Strict Origin Validation:**
```typescript
import { CORSMiddleware } from './hardening';

const cors = new CORSMiddleware({
  enabled: true,
  origins: [
    'https://spreadsheetmoment.com',
    'https://app.spreadsheetmoment.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token']
});

app.use(cors.getMiddleware());
```

### 3. CSRF Protection

**CSRF Token Generation:**
```typescript
import { CSRFProtection } from './hardening';

const csrf = new CSRFProtection({
  enabled: true,
  tokenLength: 32,
  tokenExpiry: 3600000,
  sameSite: 'strict',
  secure: true,
  httpOnly: true
});

// Generate token
const token = csrf.generateToken(sessionId);

// Verify token (automatic in middleware)
app.use(csrf.getMiddleware());
```

### 4. GraphQL Rate Limiting

**Query Complexity Analysis:**
```typescript
import { GraphQLRateLimiter } from './hardening';

const rateLimiter = new GraphQLRateLimiter({
  enabled: true,
  maxQueryComplexity: 1000,
  maxDepth: 10,
  perMinute: 60,
  perHour: 1000
});

// Analyze query
const result = rateLimiter.analyzeQuery(query);

if (!result.allowed) {
  return res.status(429).json({
    error: 'Query rejected',
    message: result.reason
  });
}
```

### 5. Input Validation

**Request Validation:**
```typescript
import { InputValidator } from './hardening';

const validator = new InputValidator(config);

// Validate request body
const bodyResult = validator.validateRequestBody(req, schema);

// Validate query parameters
const queryResult = validator.validateQueryParams(req, ['id', 'name']);

// Validate path parameters
const pathResult = validator.validatePathParams(req, {
  userId: /^\d+$/,
  postId: /^[a-z]+$/
});

// Sanitize output
const sanitized = validator.sanitizeOutput(data);
```

### 6. Security Headers

**Security Headers Middleware:**
```typescript
import { SecurityHeaders } from './hardening';

const headers = new SecurityHeaders(config);

// Apply to all routes
app.use(headers.getMiddleware());

// Headers included:
// - Strict-Transport-Security
// - X-Content-Type-Options: nosniff
// - X-Frame-Options: DENY
// - Content-Security-Policy
// - X-XSS-Protection
// - Referrer-Policy
```

### 7. Rate Limiting

**Sliding Window Rate Limiter:**
```typescript
import { rateLimiterMiddleware } from './rate-limiter';

// Apply rate limiting to API
app.use('/api', rateLimiterMiddleware({
  windowMs: 60000,        // 1 minute
  maxRequests: 100         // 100 requests per minute
}));

// Custom rate limits
app.use('/api/auth', rateLimiterMiddleware({
  windowMs: 900000,       // 15 minutes
  maxRequests: 5           // 5 attempts per 15 minutes
}));
```

---

## 🚀 Quick Setup

### 1. Install Dependencies

```bash
npm install @noble/ed25519 argon2 jsonwebtoken helmet cors csurf express-rate-limit
npm install --save-dev @types/jsonwebtoken
```

### 2. Set Environment Variables

```bash
# Generate keys
export MASTER_KEY_ENCRYPTION_KEY=$(openssl rand -base64 32)
export JWT_SECRET=$(openssl rand -base64 64)
export CSRF_SECRET=$(openssl rand -base64 32)

# Generate RSA keys
openssl genrsa -out jwt-private.pem 2048
openssl rsa -in jwt-private.pem -pubout -out jwt-public.pem
export JWT_PRIVATE_KEY=$(cat jwt-private.pem)
export JWT_PUBLIC_KEY=$(cat jwt-public.pem)

# Allowed origins
export ALLOWED_ORIGINS=https://spreadsheetmoment.com,https://app.spreadsheetmoment.com
```

### 3. Initialize Security

```typescript
import { createSecurityManager } from './core/security/crypto';
import { initSecurity } from './core/security/hardening';

// Initialize security
const jwtConfig = {
  secret: process.env.JWT_SECRET,
  privateKey: process.env.JWT_PRIVATE_KEY,
  publicKey: process.env.JWT_PUBLIC_KEY,
  algorithm: 'RS256',
  expiresIn: '1h',
  issuer: 'spreadsheetmoment',
  audience: 'spreadsheetmoment-api'
};

const securityManager = await createSecurityManager(jwtConfig);
const security = initSecurity();
```

### 4. Apply Middleware

```typescript
import express from 'express';

const app = express();

// Security middleware (order matters!)
app.use(security.headers.getMiddleware());     // 1. Security headers
app.use(security.cors.getMiddleware());       // 2. CORS validation
app.use(express.json());                      // 3. Body parsing
app.use(security.csrf.getMiddleware());       // 4. CSRF protection

// Rate limiting
app.use('/api', rateLimiterMiddleware({       // 5. Rate limiting
  windowMs: 60000,
  maxRequests: 100
}));

// GraphQL rate limiting
app.use('/graphql', security.graphqlRateLimiter.getMiddleware());
```

---

## 🧪 Testing

### Run Security Tests

```bash
# All security tests
npm test -- src/core/security/__tests__/security-fixed.test.ts

# With coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Manual Testing

**Test CORS:**
```bash
# Should fail (unauthorized origin)
curl -H "Origin: https://evil.com" https://your-api.com/api/data

# Should succeed (authorized origin)
curl -H "Origin: https://spreadsheetmoment.com" https://your-api.com/api/data
```

**Test CSRF:**
```bash
# Get CSRF token
TOKEN=$(curl -c cookies.txt https://your-api.com/api/csrf-token | jq -r '.token')

# POST without token (should fail)
curl -X POST https://your-api.com/api/data

# POST with token (should succeed)
curl -X POST -H "X-CSRF-Token: $TOKEN" https://your-api.com/api/data
```

**Test Rate Limiting:**
```bash
# Make 100 requests (should succeed)
for i in {1..100}; do curl https://your-api.com/api/data; done

# 101st request (should be rate limited)
curl https://your-api.com/api/data
```

---

## 📊 Security Checklist

### Development

- [ ] Using Ed25519 for signatures (not mock implementations)
- [ ] Using RS256 for JWT (not HS256)
- [ ] Using Argon2id for passwords (not bcrypt/PBKDF2)
- [ ] CORS origins are specific (no wildcards)
- [ ] CSRF protection enabled
- [ ] Rate limiting configured
- [ ] Input validation on all endpoints
- [ ] Output sanitization enabled
- [ ] Security headers configured
- [ ] Secrets not in code

### Deployment

- [ ] Environment variables configured
- [ ] RSA keys generated and secured
- [ ] Database passwords hashed with Argon2id
- [ ] CORS origins match production domains
- [ ] Rate limits appropriate for traffic
- [ ] Monitoring and alerting configured
- [ ] Rollback plan tested
- [ ] Security tests passing
- [ ] Penetration testing completed
- [ ] Documentation updated

---

## 🔐 Security Best Practices

### DO ✓

1. **Use strong encryption algorithms**
   - Ed25519 for signatures
   - RS256/RS512 for JWT
   - Argon2id for passwords
   - AES-256-GCM for data

2. **Validate all input**
   - Schema validation
   - SQL injection prevention
   - XSS prevention
   - Path traversal checks

3. **Implement defense in depth**
   - Multiple security layers
   - Fail securely (closed)
   - Monitor and log
   - Alert on anomalies

4. **Follow principle of least privilege**
   - Minimal required permissions
   - Role-based access control
   - Time-limited credentials
   - Audit trail

### DON'T ✗

1. **Never use mock crypto**
   - No `randomBytes()` for signatures
   - No hardcoded keys
   - No weak algorithms (MD5, SHA1)
   - No proprietary crypto

2. **Never trust user input**
   - Always validate
   - Always sanitize
   - Use parameterized queries
   - Never concatenate SQL

3. **Never disable security**
   - No CORS wildcards
   - No CSRF bypass
   - No rate limit exemptions
   - No security header removal

4. **Never leak information**
   - No verbose error messages
   - No stack traces in production
   - No debug endpoints exposed
   - No sensitive data in logs

---

## 🆘 Troubleshooting

### Common Issues

**Issue:** JWT verification fails
```
Solution:
1. Check JWT_PRIVATE_KEY and JWT_PUBLIC_KEY match
2. Verify keys were generated together
3. Check token hasn't expired
```

**Issue:** CORS blocks legitimate requests
```
Solution:
1. Check ALLOWED_ORIGINS includes exact origin
2. Verify protocol (http vs https)
3. Check for subdomain mismatch
```

**Issue:** CSRF token validation fails
```
Solution:
1. Ensure token in X-CSRF-Token header
2. Check token hasn't expired
3. Verify session ID matches token
```

**Issue:** Rate limiting too aggressive
```
Solution:
1. Adjust RATE_LIMIT_MAX_REQUESTS
2. Implement exemptions for trusted users
3. Use Redis for distributed rate limiting
```

**Issue:** Performance degraded
```
Solution:
1. Argon2id hashing takes ~100ms (normal)
2. Use caching for frequent operations
3. Implement connection pooling
4. Consider hardware upgrade
```

---

## 📞 Support

### Contact Information

- **Security Team:** security@spreadsheetmoment.com
- **DevOps Team:** devops@spreadsheetmoment.com
- **Emergency:** +1-555-SECURITY
- **GitHub Issues:** https://github.com/spreadsheet-moment/polln/issues

### Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP API Security](https://owasp.org/www-project-api-security/)
- [CIS Controls](https://www.cisecurity.org/controls/)
- [NIST Framework](https://www.nist.gov/cyberframework)

---

**Version:** 1.0.0
**Last Updated:** March 15, 2026
**Maintained By:** Security Team
