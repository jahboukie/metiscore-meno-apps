# Security Documentation

## Overview

MenoWellness implements comprehensive security measures to protect Personal Health Information (PHI) and ensure compliance with healthcare privacy regulations including HIPAA, GDPR, PIPEDA, and PHIPA.

## End-to-End Encryption

### Implementation Details

- **Algorithm**: AES-256-GCM for authenticated encryption
- **Key Generation**: Cryptographically secure random keys using Web Crypto API
- **Key Storage**: Local IndexedDB storage, keys never transmitted to servers
- **Scope**: Journal entries, sensitive personal data

### Encryption Process

1. **Key Generation**: Each user gets a unique 256-bit encryption key
2. **Client-Side Encryption**: Data encrypted before transmission to Firebase
3. **Secure Storage**: Encrypted data stored in Firestore with plaintext placeholders
4. **Decryption**: Data decrypted client-side for display

```typescript
// Example encryption flow
const key = await SecurityUtils.getUserEncryptionKey(userId);
const encryptedData = await SecurityUtils.encryptData(journalText, key);
// Store encryptedData.encryptedValue in database
```

## Key Management System

### Features

- **Key Rotation**: Generate new encryption keys while maintaining access to old data
- **Key Backup**: Password-protected encrypted backups of encryption keys
- **Key Restoration**: Restore keys from encrypted backups
- **History Tracking**: Audit trail of all key operations

### Key Storage Architecture

```
IndexedDB: MenoEncryptionStore
├── keys/            # Current user encryption keys
├── keyRotations/    # Key rotation history
└── keyBackups/      # Backup metadata
```

### Security Measures

- **Local Storage Only**: Keys never leave the user's device
- **PBKDF2 Protection**: Backup encryption uses 100,000 iterations
- **Salt Generation**: Unique salts for each backup
- **Key Versioning**: Track key versions for data migration

## Data Rights & Compliance

### GDPR Article 15 - Right of Access

- **Complete Data Export**: JSON format with all user data
- **Encryption Status**: Separate encrypted and decrypted data
- **Metadata Inclusion**: Timestamps, consent history, audit logs

### GDPR Article 17 - Right to Erasure

- **Secure Deletion**: Multi-step deletion process
- **Data Verification**: 30-day verification period
- **Complete Removal**: All collections, indexes, and backups
- **Audit Trail**: Deletion process fully logged

### Data Processing Consent

- **Granular Controls**: Individual consent for each data processing type
- **Jurisdiction Detection**: Automatic compliance framework selection
- **Consent Versioning**: Track consent changes over time
- **Withdrawal Rights**: Easy consent withdrawal

## Audit Logging

### Logged Events

- User authentication and authorization
- Data access and modifications
- Encryption key operations
- Consent changes
- Data export/deletion requests
- Partner connections and disconnections

### Log Structure

```typescript
interface AuditLog {
  userId: string;
  action: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  resourceId?: string;
  resourceType?: string;
  details?: Record<string, any>;
}
```

### Retention Policy

- **Personal Data**: 7 years (2555 days) across all jurisdictions
- **Audit Logs**: Permanent retention for compliance
- **Anonymized Data**: No retention limits

## Data Minimization

### PII Sanitization

Automatic removal of:
- Email addresses
- Phone numbers
- Social Security Numbers
- Physical addresses

### Field-Level Controls

- **Allowlisted Fields**: Only necessary data fields collected
- **Purpose Limitation**: Data used only for stated purposes
- **Storage Minimization**: Encrypted data stored with minimal metadata

## Security by Design

### Client-Side Security

- **Input Validation**: All user inputs validated and sanitized
- **XSS Prevention**: React's built-in protections + manual sanitization
- **CSRF Protection**: Firebase Authentication tokens
- **Secure Headers**: Implemented via Next.js security headers

### Server-Side Security

- **Firebase Security Rules**: Strict data access controls
- **Function Authentication**: All Cloud Functions require valid auth
- **Rate Limiting**: Implemented for sensitive operations
- **IP Allowlisting**: Available for enterprise deployments

## Infrastructure Security

### Firebase Security

- **IAM Roles**: Principle of least privilege
- **VPC Security**: Private network connections
- **Encryption at Rest**: All data encrypted in Firestore
- **Encryption in Transit**: HTTPS/TLS 1.3 for all connections

### Backup & Recovery

- **Automated Backups**: Daily Firestore backups
- **Point-in-Time Recovery**: 30-day recovery window
- **Cross-Region Replication**: Multi-region deployment
- **Disaster Recovery**: RTO: 4 hours, RPO: 1 hour

## Compliance Frameworks

### HIPAA Compliance

- **Administrative Safeguards**: Access controls, workforce training
- **Physical Safeguards**: Cloud infrastructure security
- **Technical Safeguards**: Encryption, audit logs, access controls

### GDPR Compliance

- **Lawful Basis**: Consent and legitimate interests
- **Data Protection Impact Assessment**: Completed
- **Privacy by Design**: Built into system architecture
- **Data Protection Officer**: Contact available

### PIPEDA Compliance

- **Privacy Principles**: All 10 principles implemented
- **Breach Notification**: 72-hour notification process
- **Cross-Border Transfers**: Adequacy decisions respected

## Incident Response

### Security Incident Process

1. **Detection**: Automated monitoring and manual reporting
2. **Assessment**: Severity classification within 1 hour
3. **Containment**: Immediate threat mitigation
4. **Investigation**: Root cause analysis
5. **Recovery**: System restoration and validation
6. **Lessons Learned**: Process improvement

### Breach Notification

- **Internal Notification**: 1 hour
- **Regulatory Notification**: 72 hours (GDPR), 60 days (PIPEDA)
- **User Notification**: 72 hours for high-risk breaches
- **Documentation**: Complete incident documentation

## Security Testing

### Automated Testing

- **SAST**: Static analysis security testing
- **DAST**: Dynamic application security testing
- **Dependency Scanning**: Known vulnerability detection
- **Container Scanning**: Docker image security analysis

### Manual Testing

- **Penetration Testing**: Annual third-party assessment
- **Code Review**: Security-focused code reviews
- **Threat Modeling**: Regular threat assessment updates

## Monitoring & Alerting

### Real-Time Monitoring

- **Authentication Anomalies**: Unusual login patterns
- **Data Access Patterns**: Abnormal data requests
- **Encryption Failures**: Key management issues
- **Performance Metrics**: Response time degradation

### Alert Thresholds

- **Failed Logins**: 5 attempts in 15 minutes
- **Data Export Volume**: >100MB per user per day
- **API Rate Limits**: >1000 requests per minute
- **Encryption Errors**: Any decryption failures

## Developer Security Guidelines

### Secure Coding Practices

- **Input Validation**: Validate all external inputs
- **Output Encoding**: Encode all dynamic outputs
- **Error Handling**: No sensitive information in error messages
- **Logging**: Log security events, not sensitive data

### Code Review Checklist

- [ ] No hardcoded secrets or credentials
- [ ] Proper input validation implemented
- [ ] Authentication and authorization verified
- [ ] Encryption used for sensitive data
- [ ] Audit logging implemented
- [ ] Error handling doesn't leak information

## Contact Information

### Security Team

- **Security Officer**: security@menowellness.com
- **Incident Response**: incidents@menowellness.com
- **Compliance**: compliance@menowellness.com

### Reporting Security Issues

Please report security vulnerabilities to: security@menowellness.com

**PGP Key**: [Public key for encrypted communications]

### Response Times

- **Critical**: 1 hour
- **High**: 4 hours  
- **Medium**: 24 hours
- **Low**: 72 hours

---

*Last Updated: 2025-01-07*  
*Version: 1.0*  
*Next Review: 2025-04-07*