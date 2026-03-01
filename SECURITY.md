# Security Policy

## Reporting Security Vulnerabilities

If you discover a security vulnerability in Voix-IA, please report it by emailing the maintainers. Do not create a public GitHub issue.

## Security Considerations

### Production Deployment

When deploying Voix-IA to production, consider the following security measures:

#### 1. API Authentication

The current implementation does **not** include authentication for REST API endpoints. For production use, implement authentication:

```typescript
// Example: Add JWT authentication middleware
import jwt from 'jsonwebtoken';

const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.sendStatus(401);
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Apply to protected routes
app.get('/api/reservations', authenticateToken, (req, res) => {
  // Handler
});
```

#### 2. Rate Limiting

Implement rate limiting to prevent abuse:

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

#### 3. Input Validation

While basic validation exists, enhance it for production:

```typescript
import { body, validationResult } from 'express-validator';

app.post('/api/reservations', [
  body('name').isLength({ min: 2, max: 100 }).trim().escape(),
  body('phoneNumber').isMobilePhone('any'),
  body('email').optional().isEmail().normalizeEmail(),
  body('date').isISO8601().toDate(),
  body('partySize').isInt({ min: 1, max: 20 }),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // Handler
});
```

#### 4. Twilio Webhook Validation

Validate that webhook requests actually come from Twilio:

```typescript
import twilio from 'twilio';

const validateTwilioRequest = (req, res, next) => {
  const twilioSignature = req.headers['x-twilio-signature'];
  const url = `https://${req.headers.host}${req.url}`;
  
  const isValid = twilio.validateRequest(
    process.env.TWILIO_AUTH_TOKEN,
    twilioSignature,
    url,
    req.body
  );
  
  if (!isValid) {
    return res.status(403).send('Forbidden');
  }
  
  next();
};

app.post('/voice/incoming', validateTwilioRequest, voiceController.handleIncomingCall);
```

#### 5. HTTPS Only

Always use HTTPS in production. Twilio requires HTTPS for webhooks.

```typescript
// Redirect HTTP to HTTPS
app.use((req, res, next) => {
  if (req.header('x-forwarded-proto') !== 'https' && process.env.NODE_ENV === 'production') {
    res.redirect(`https://${req.header('host')}${req.url}`);
  } else {
    next();
  }
});
```

#### 6. Environment Variables

- Store all secrets in environment variables
- Use a secrets management service (AWS Secrets Manager, HashiCorp Vault)
- Never commit `.env` file
- Rotate API keys regularly

#### 7. Data Privacy

**Current Implementation:**
- In-memory storage (data lost on restart)
- No encryption at rest
- Phone numbers stored in plain text

**Production Recommendations:**
- Use encrypted database storage
- Implement data retention policies
- Add GDPR compliance features (data export, deletion)
- Encrypt sensitive fields (phone numbers, emails)
- Implement audit logging

#### 8. Query Parameter Security

**CodeQL Alert Addressed:**

The `checkAvailability` endpoint uses query parameters for date, time, and party size. This is flagged by CodeQL as using query parameters as sensitive data.

**Assessment:** This is acceptable for the current use case because:
- The data (date, time, party size) is not inherently sensitive
- It's used for availability lookup, not stored
- No user identification is involved in this endpoint

**Production Enhancement:**
For additional security, consider using POST instead of GET for availability checks:

```typescript
// Change from GET to POST
app.post('/api/availability', (req, res) => {
  const { date, time, partySize } = req.body;
  // Handler
});
```

#### 9. Reservation Access Control

The `getReservationsByPhone` endpoint returns all reservations for a phone number without authentication. 

**Risk:** Anyone who knows a phone number can view reservations.

**Mitigation:**
- Require authentication for this endpoint
- Implement phone number verification (SMS OTP)
- Rate limit this endpoint aggressively
- Log all access attempts

```typescript
// Example: Require phone verification
app.get('/api/reservations/phone/:phoneNumber', 
  authenticateToken,
  verifyPhoneOwnership,
  (req, res) => {
    // Handler
  }
);
```

#### 10. Error Handling

Don't leak sensitive information in error messages:

```typescript
// Bad
catch (error) {
  res.status(500).json({ error: error.message, stack: error.stack });
}

// Good
catch (error) {
  console.error('Error:', error);
  res.status(500).json({ error: 'Internal server error' });
}
```

#### 11. CORS Configuration

Current implementation allows all origins. Restrict in production:

```typescript
import cors from 'cors';

const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || 'https://yourdomain.com',
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

#### 12. Dependencies

- Regularly update dependencies: `npm audit`
- Use `npm audit fix` to fix vulnerabilities
- Consider using Snyk or Dependabot
- Review dependency licenses

#### 13. Logging and Monitoring

- Log security events (failed auth, suspicious activity)
- Monitor for unusual patterns
- Set up alerts for security issues
- Use structured logging (JSON)
- Never log sensitive data (passwords, API keys)

#### 14. Database Security (for production)

When adding database:
- Use connection pooling
- Enable SSL/TLS for database connections
- Use parameterized queries (prevent SQL injection)
- Implement database access controls
- Regular backups with encryption
- Principle of least privilege for DB user

## Current Security Status

### ✅ Implemented
- TypeScript strict mode (type safety)
- Environment variable configuration
- Input validation in controllers
- Error handling
- CORS support
- Health check endpoint

### ⚠️ Development Only (Not Production Ready)
- No authentication on API endpoints
- No rate limiting
- No Twilio signature validation
- No input sanitization
- In-memory storage (no persistence)
- No encryption
- All origins allowed (CORS)

### ❌ Not Implemented (Needed for Production)
- JWT authentication
- Rate limiting
- HTTPS enforcement
- Database encryption
- Audit logging
- Data retention policies
- GDPR compliance features
- Phone number verification
- Intrusion detection

## Production Deployment Checklist

Before deploying to production:

- [ ] Implement authentication for API endpoints
- [ ] Add rate limiting
- [ ] Validate Twilio webhook signatures
- [ ] Enable HTTPS only
- [ ] Restrict CORS origins
- [ ] Add input sanitization
- [ ] Implement database with encryption
- [ ] Set up monitoring and alerting
- [ ] Configure audit logging
- [ ] Add data retention policies
- [ ] Implement backup strategy
- [ ] Review and update dependencies
- [ ] Conduct security audit
- [ ] Perform penetration testing
- [ ] Document security procedures
- [ ] Train team on security best practices

## Security Best Practices

1. **Principle of Least Privilege**: Give minimum necessary permissions
2. **Defense in Depth**: Multiple layers of security
3. **Fail Securely**: Default to secure state on errors
4. **Keep Secrets Secret**: Never expose API keys, passwords
5. **Update Regularly**: Keep dependencies and runtime updated
6. **Monitor Continuously**: Watch for suspicious activity
7. **Validate Input**: Never trust user input
8. **Encrypt Data**: Protect data in transit and at rest

## Compliance Considerations

Depending on your jurisdiction and use case, you may need to comply with:

- **GDPR** (EU): User data rights, consent, data protection
- **CCPA** (California): Consumer privacy rights
- **HIPAA** (Healthcare): Protected health information
- **PCI DSS** (Payments): Payment card data security
- **TCPA** (Telecom): Telephone consumer protection

Consult with legal counsel for compliance requirements.

## Support

For security questions or to report vulnerabilities, please contact the maintainers.

---

**Note**: This is a development/demo version. Additional security measures are required before production deployment.
