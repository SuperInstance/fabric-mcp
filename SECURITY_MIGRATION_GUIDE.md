# Security Migration Guide

**Platform:** Spreadsheet Moment
**Date:** 2026-03-15
**Status:** Ready for Migration

---

## Overview

This guide provides step-by-step instructions for migrating from the old (insecure) security implementation to the new (secure) implementation with fixed cryptographic primitives, proper JWT handling, CORS validation, CSRF protection, and rate limiting.

---

## Pre-Migration Checklist

### 1. Backup Current System

```bash
# Backup database
kubectl exec -it postgres-pod -- pg_dump spreadsheet_db > backup_$(date +%Y%m%d).sql

# Backup configuration
cp .env .env.backup
cp package.json package.json.backup

# Git commit current state
git add .
git commit -m "Backup before security migration"
git tag pre-security-migration
```

### 2. Verify Prerequisites

- [ ] Node.js 18+ installed
- [ ] npm or yarn available
- [ ] Redis available (for distributed rate limiting)
- [ ] PostgreSQL database accessible
- [ ] SSH access to servers
- [ ] Backup completed
- [ ] Test environment ready

### 3. Prepare Environment Variables

Create a `.env.security` file with secure values:

```bash
# Generate secure random values
export MASTER_KEY_ENCRYPTION_KEY=$(openssl rand -base64 32)
export JWT_SECRET=$(openssl rand -base64 64)
export CSRF_SECRET=$(openssl rand -base64 32)
export SESSION_SECRET=$(openssl rand -base64 32)

# Or use a password manager
```

Generate RSA keys for JWT:

```bash
# Create directory for keys
mkdir -p secrets/keys

# Generate private key (2048-bit RSA)
openssl genrsa -out secrets/keys/jwt-private.pem 2048

# Generate public key
openssl rsa -in secrets/keys/jwt-private.pem -pubout -out secrets/keys/jwt-public.pem

# Set permissions
chmod 600 secrets/keys/jwt-private.pem
chmod 644 secrets/keys/jwt-public.pem

# Export for environment
export JWT_PRIVATE_KEY=$(cat secrets/keys/jwt-private.pem)
export JWT_PUBLIC_KEY=$(cat secrets/keys/jwt-public.pem)
```

---

## Migration Steps

### Phase 1: Install Dependencies (Day 1 - Morning)

```bash
# Install new security libraries
npm install @noble/ed25519 argon2 jsonwebtoken
npm install --save-dev @types/jsonwebtoken

# Install additional security middleware
npm install helmet cors csurf express-rate-limit

# Verify installation
npm list @noble/ed25519 argon2 jsonwebtoken
```

**Expected Output:**
```
@noble/ed25519@2.1.0
argon2@0.40.1
jsonwebtoken@9.0.3
```

### Phase 2: Update Codebase (Day 1 - Afternoon)

#### Step 1: Replace old security files

```bash
# Navigate to security directory
cd src/core/security

# Backup old files
mv crypto.ts crypto-old.ts
mv hardening.ts hardening-old.ts

# Copy new files
cp crypto-fixed.ts crypto.ts
cp hardening-fixed.ts hardening.ts
cp rate-limiter-fixed.ts rate-limiter.ts

# Verify
ls -la *.ts
```

#### Step 2: Update imports in application code

Find and replace old imports:

```bash
# Find files using old imports
grep -r "from.*crypto-old" src/
grep -r "from.*hardening-old" src/

# Update imports (manual or use sed)
sed -i "s/from.*crypto-old/from '.\/crypto'/g" src/**/*.ts
sed -i "s/from.*hardening-old/from '.\/hardening'/g" src/**/*.ts
```

#### Step 3: Update environment configuration

Edit `.env` file:

```bash
# Add new security variables
cat >> .env << 'EOF'

# Security Configuration
MASTER_KEY_ENCRYPTION_KEY=<your-generated-key>
JWT_SECRET=<your-generated-secret>
JWT_PRIVATE_KEY="$(cat secrets/keys/jwt-private.pem)"
JWT_PUBLIC_KEY="$(cat secrets/keys/jwt-public.pem)"
JWT_ALGORITHM=RS256
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=24h

# CORS Configuration
ALLOWED_ORIGINS=https://spreadsheetmoment.com,https://app.spreadsheetmoment.com

# CSRF Configuration
CSRF_SECRET=<your-generated-secret>
CSRF_TOKEN_EXPIRY=3600000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# GraphQL Rate Limiting
GRAPHQL_MAX_COMPLEXITY=1000
GRAPHQL_MAX_DEPTH=10
GRAPHQL_PER_MINUTE=60
GRAPHQL_PER_HOUR=1000
EOF
```

### Phase 3: Database Migration (Day 2)

#### Step 1: Create migration script

Create `migrations/002_security_upgrade.sql`:

```sql
-- Migrate passwords to Argon2id
-- This is a placeholder - actual implementation depends on your schema

-- Add new columns for tracking
ALTER TABLE users ADD COLUMN password_hash_type VARCHAR(20) DEFAULT 'argon2id';
ALTER TABLE users ADD COLUMN password_hash_updated_at TIMESTAMP;

-- Create index for faster lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);

-- Add audit log table
CREATE TABLE security_audit_log (
  id SERIAL PRIMARY KEY,
  event_type VARCHAR(100) NOT NULL,
  user_id INTEGER,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_log_event_type ON security_audit_log(event_type);
CREATE INDEX idx_audit_log_user_id ON security_audit_log(user_id);
CREATE INDEX idx_audit_log_created_at ON security_audit_log(created_at);
```

#### Step 2: Run migration

```bash
# Apply database migration
psql -h localhost -U postgres -d spreadsheet_db -f migrations/002_security_upgrade.sql

# Or using migration tool
npm run migrate:up
```

#### Step 3: Migrate existing passwords

Create `scripts/migrate-passwords.js`:

```javascript
const { hashPassword } = require('../dist/core/security/crypto');
const { db } = require('../dist/database');

async function migratePasswords() {
  const users = await db.users.findMany({
    where: { password_hash_type: { not: 'argon2id' } }
  });

  console.log(`Migrating ${users.length} users...`);

  for (const user of users) {
    // For each user, you'll need to:
    // 1. Verify their current password hash
    // 2. If verification succeeds, re-hash with Argon2id
    // 3. Update the database

    // Note: You can't re-hash without the original password
    // Users will need to reset their passwords or log in
    // to trigger re-hashing

    await db.users.update({
      where: { id: user.id },
      data: {
        password_needs_reset: true,
        password_hash_type: 'argon2id'
      }
    });

    console.log(`Marked user ${user.email} for password reset`);
  }

  console.log('Migration complete');
}

migratePasswords()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
```

Run the migration:

```bash
node scripts/migrate-passwords.js
```

### Phase 4: Update Application Code (Day 3)

#### Step 1: Update authentication middleware

Edit `src/api/server.ts`:

```typescript
// OLD (insecure):
import { AuthManager } from '../core/security/crypto-old';

// NEW (secure):
import { createSecurityManager, JWTService } from '../core/security/crypto';
import { initSecurity } from '../core/security/hardening';

// Initialize security
const jwtConfig = {
  secret: process.env.JWT_SECRET,
  privateKey: process.env.JWT_PRIVATE_KEY,
  publicKey: process.env.JWT_PUBLIC_KEY,
  algorithm: 'RS256',
  expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  issuer: 'spreadsheetmoment',
  audience: 'spreadsheetmoment-api'
};

const securityManager = await createSecurityManager(jwtConfig);
const security = initSecurity();
```

#### Step 2: Apply security middleware

Edit `src/api/server.ts` middleware section:

```typescript
// Apply security middleware (order matters!)
app.use(helmet()); // Security headers
app.use(security.headers.getMiddleware());
app.use(security.cors.getMiddleware()); // Strict CORS
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CSRF protection (for state-changing operations)
app.use(security.csrf.getMiddleware());

// Rate limiting
import { rateLimiterMiddleware } from '../core/security/rate-limiter';
app.use('/api', rateLimiterMiddleware({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
  maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
}));

// GraphQL rate limiting
app.use('/graphql', security.graphqlRateLimiter.getMiddleware());
```

#### Step 3: Update authentication endpoints

Edit `src/api/auth/router.ts`:

```typescript
import { JWTService } from '../../core/security/crypto';

const jwtService = new JWTService(jwtConfig);

// Login endpoint
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Validate user credentials
  const user = await db.users.findOne({ where: { email } });
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Verify password using Argon2id
  const { verifyPassword } = await import('../../core/security/crypto');
  const isValid = await verifyPassword(password, user.passwordHash);

  if (!isValid) {
    // Record failed attempt
    await recordFailedLogin(user.id, req.ip);
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Generate JWT token
  const token = await jwtService.generateToken({
    sub: user.id,
    email: user.email,
    roles: user.roles
  });

  // Generate CSRF token
  const csrfToken = security.csrf.generateToken(user.id);

  res.json({
    token,
    csrfToken,
    expiresIn: 3600
  });
});
```

### Phase 5: Testing (Day 4)

#### Step 1: Run unit tests

```bash
# Run security tests
npm test -- src/core/security/__tests__/security-fixed.test.ts

# Run all tests
npm test

# Generate coverage report
npm run test:coverage
```

**Expected Output:**
```
Test Suites: 8 passed, 8 total
Tests:       67 passed, 67 total
Coverage:    95.3% statements, 92.9% branches
```

#### Step 2: Manual testing

Test CORS:

```bash
# Should fail (unauthorized origin)
curl -H "Origin: https://evil.com" \
     -H "Content-Type: application/json" \
     https://your-api.com/api/data

# Expected: 403 Forbidden

# Should succeed (authorized origin)
curl -H "Origin: https://spreadsheetmoment.com" \
     -H "Content-Type: application/json" \
     https://your-api.com/api/data

# Expected: 200 OK
```

Test CSRF:

```bash
# Get CSRF token
TOKEN=$(curl -c cookies.txt https://your-api.com/api/csrf-token | jq -r '.token')

# Try POST without token (should fail)
curl -X POST https://your-api.com/api/data

# Expected: 403 Forbidden

# Try POST with token (should succeed)
curl -X POST \
     -H "X-CSRF-Token: $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"data":"test"}' \
     https://your-api.com/api/data

# Expected: 200 OK
```

Test Rate Limiting:

```bash
# Make 100 requests (should succeed)
for i in {1..100}; do
  curl https://your-api.com/api/data
done

# 101st request (should be rate limited)
curl https://your-api.com/api/data

# Expected: 429 Too Many Requests
```

Test GraphQL Rate Limiting:

```bash
# Simple query (should succeed)
curl -X POST \
     -H "Content-Type: application/json" \
     -d '{"query":"{ user { name } }"}' \
     https://your-api.com/graphql

# Expected: 200 OK

# Complex query (should fail)
curl -X POST \
     -H "Content-Type: application/json" \
     -d '{"query":"{'$(printf 'a{b{c{d{e{f{g{h{i{j}}}}}}}}}}}')' { name } }"}' \
     https://your-api.com/graphql

# Expected: 429 Too Many Requests
```

#### Step 3: Load testing

```bash
# Install k6
brew install k6  # macOS
# or
apt-get install k6  # Ubuntu

# Run load test
k6 run tests/load/security-load-test.js
```

### Phase 6: Deployment (Day 5)

#### Step 1: Deploy to staging

```bash
# Build application
npm run build

# Run tests
npm test

# Deploy to staging
kubectl apply -f deployment/staging/
kubectl rollout status deployment/spreadsheet-moment-staging

# Verify deployment
kubectl get pods -n staging
```

#### Step 2: Monitor staging

```bash
# Check logs
kubectl logs -f deployment/spreadsheet-moment-staging -n staging

# Check metrics
kubectl port-forward svc/prometheus 9090:9090
open http://localhost:9090

# Run smoke tests
npm run test:smoke -- --env=staging
```

#### Step 3: Deploy to production

```bash
# Tag release
git tag -a v1.1.0-security -m "Security upgrade"
git push origin v1.1.0-security

# Deploy to production
kubectl apply -f deployment/production/
kubectl rollout status deployment/spreadsheet-moment-production

# Monitor deployment
kubectl get pods -n production
kubectl logs -f deployment/spreadsheet-moment-production -n production
```

#### Step 4: Verify production

```bash
# Health check
curl https://your-api.com/health

# Security headers check
curl -I https://your-api.com/api/data

# Expected headers:
# Strict-Transport-Security: max-age=31536000
# X-Content-Type-Options: nosniff
# X-Frame-Options: DENY
# Content-Security-Policy: default-src 'self'
```

---

## Post-Migration Tasks

### 1. Monitor Key Metrics

```bash
# Watch error logs
kubectl logs -f deployment/spreadsheet-moment-production | grep ERROR

# Monitor rate limits
kubectl logs -f deployment/spreadsheet-moment-production | grep "rate limit"

# Check authentication
kubectl logs -f deployment/spreadsheet-moment-production | grep "auth"
```

### 2. Update Documentation

- Update API documentation with new security headers
- Update CORS documentation
- Add CSRF token documentation
- Update rate limiting documentation

### 3. Notify Users

Send email to users about password reset requirement:

```
Subject: Security Update - Password Reset Required

Dear User,

As part of our ongoing commitment to security, we have upgraded
our authentication system. You will need to reset your password
the next time you log in.

This upgrade includes:
- Stronger password encryption (Argon2id)
- Enhanced protection against CSRF attacks
- Improved rate limiting

Please reset your password at:
https://spreadsheetmoment.com/reset-password

Thank you for your understanding.

Best regards,
The Security Team
```

### 4. Clean Up

```bash
# Remove old files after 30 days
rm src/core/security/crypto-old.ts
rm src/core/security/hardening-old.ts

# Remove backup tags (optional)
git tag -d pre-security-migration

# Update dependencies
npm audit fix
npm update
```

---

## Rollback Procedure

If critical issues arise:

### Immediate Rollback (Minutes)

```bash
# Revert to previous version
kubectl rollout undo deployment/spreadsheet-moment-production

# Verify rollback
kubectl get pods -n production
curl https://your-api.com/health
```

### Full Rollback (Hours)

```bash
# Restore backup files
cp src/core/security/crypto-old.ts src/core/security/crypto.ts
cp src/core/security/hardening-old.ts src/core/security/hardening.ts

# Rebuild
npm run build

# Redeploy
kubectl apply -f deployment/production/
kubectl rollout restart deployment/spreadsheet-moment-production
```

### Database Rollback

```bash
# Restore database backup
psql -h localhost -U postgres -d spreadsheet_db < backup_YYYYMMDD.sql

# Or rollback migration
npm run migrate:down
```

---

## Troubleshooting

### Issue: JWT verification fails

**Symptoms:** 401 errors on authenticated endpoints

**Solutions:**
1. Check JWT_PRIVATE_KEY and JWT_PUBLIC_KEY environment variables
2. Verify keys match (were generated together)
3. Check token expiration: `echo "eyJ..." | jq .exp`

### Issue: CORS blocks legitimate requests

**Symptoms:** 403 errors from authorized origins

**Solutions:**
1. Check ALLOWED_ORIGINS environment variable
2. Verify exact origin match (including protocol)
3. Check browser console for CORS errors

### Issue: CSRF token validation fails

**Symptoms:** 403 errors on POST requests

**Solutions:**
1. Ensure CSRF token is included in request headers
2. Check token expiration (default 1 hour)
3. Verify session ID matches token

### Issue: Rate limiting too aggressive

**Symptoms:** Legitimate users being rate limited

**Solutions:**
1. Adjust RATE_LIMIT_MAX_REQUESTS
2. Implement rate limit exemptions for trusted users
3. Use Redis for distributed rate limiting

### Issue: Performance degradation

**Symptoms:** Slower response times after migration

**Solutions:**
1. Monitor Argon2 password hashing time (should be ~100ms)
2. Use caching for frequently accessed data
3. Implement connection pooling for database
4. Consider hardware upgrade if needed

---

## Support

If you encounter issues during migration:

1. Check logs: `kubectl logs -f deployment/spreadsheet-moment-production`
2. Review this guide
3. Check GitHub issues
4. Contact security team: security@spreadsheetmoment.com

---

**Migration Status:** Ready
**Estimated Time:** 5 days
**Risk Level:** Medium (mitigated by rollback plan)
**Downtime Expected:** <5 minutes per deployment

---

**Document Version:** 1.0.0
**Last Updated:** 2026-03-15
**Next Review:** 2026-06-15
