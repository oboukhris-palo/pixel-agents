---
templateId: "compliance-checklist"
templateVersion: "1.0"
documentType: "operational"
title: "{US-REF}: Compliance & Security Checklist"
description: "Pre-deployment compliance, security, and regulatory validation checklist"
author: "{Security/Compliance Lead}"
date_created: "{YYYY-MM-DD}"
date_updated: "{YYYY-MM-DD}"
version: "1.0"
status: "draft"

user_story_ref: ""
related_documents:
  - type: "implementation_plan"
    reference: "docs/05-implementation/epics/EPIC-001/user-stories/US-001/implementation-plan.md"
  - type: "tech_spec"
    reference: "docs/02-architecture/tech-spec.md"

compliance_frameworks: []
security_level: "confidential"
tags: ["compliance", "security", "deployment", "validation"]
---

# Compliance & Security Checklist: {US-REF}

## Document Info
- **User Story**: {US-REF}
- **Feature**: {Feature Name}
- **Owner**: {Security/Compliance Lead}
- **Last Updated**: {YYYY-MM-DD}
- **Status**: Draft

---

## Overview

This checklist ensures {Feature Name} ({US-REF}) meets security, compliance, and regulatory requirements before production deployment.

**Applicable Frameworks**:
- [] GDPR (EU data privacy)
- [] CCPA (California privacy)
- [] PCI-DSS (Payment Card Industry)
- [] SOC2 Type II (Service Organization Control)
- [] ISO 27001 (Information Security Management)
- [] [Custom regulatory framework]

---

## Pre-Deployment Security Checklist

### Code Review & Quality

- [ ] All code reviewed by security engineer
- [ ] No hardcoded secrets (API keys, passwords, tokens)
- [ ] No debugging endpoints or backdoors left in code
- [ ] Dependency scan completed (npm audit, dotnet restore --no-cache)
- [ ] No known CVEs in dependencies
- [ ] Static analysis passed (SonarQube, Fortify, or equivalent)
- [ ] Code complexity acceptable (cyclomatic complexity <10)
- [ ] Error messages don't leak sensitive information
- [ ] Input validation on all user-facing endpoints
- [ ] Output encoding prevents injection attacks

### Testing & Validation

- [ ] Unit tests cover all new code paths (>80% coverage)
- [ ] Security-focused tests included (SQL injection, XSS, CSRF)
- [ ] Penetration testing completed (if data-sensitive feature)
- [ ] API endpoints tested for authorization bypass
- [ ] Rate limiting tested and configured
- [ ] Timeout values tested and reasonable
- [ ] Edge cases tested (empty input, non-ASCII characters, null values)
- [ ] Load testing shows acceptable performance under peak load
- [ ] Stress testing shows graceful degradation

### Access Control & Authentication

- [ ] Authentication required for sensitive endpoints
- [ ] Authorization checks enforce role-based access (RBAC)
- [ ] No privilege escalation vulnerabilities identified
- [ ] Session management properly implemented
- [ ] Token expiration configured appropriately
- [ ] Multi-factor authentication available (if applicable)
- [ ] API keys rotated before deployment
- [ ] Service-to-service authentication uses secure mechanism
- [ ] Audit logs capture all user actions on sensitive operations

### Data Protection

- [ ] Sensitive data encrypted in transit (TLS 1.3+)
- [ ] Sensitive data encrypted at rest (AES-256 or equivalent)
- [ ] Database passwords not stored in code/configs
- [ ] API keys stored in secure vault (not environment variables)
- [ ] PII data handling reviewed and approved
- [ ] Data retention policy defined and enforced
- [ ] Data deletion/archival process implemented
- [ ] Backup encryption verified
- [ ] Backup recovery tested

### Infrastructure & Deployment

- [ ] Infrastructure uses security best practices (VPC, security groups)
- [ ] Logging enabled for all authentication attempts
- [ ] Logging enabled for all sensitive data access
- [ ] Log retention meets compliance requirements
- [ ] DDoS protection enabled (WAF, rate limiting)
- [ ] SSL/TLS certificates valid and updated
- [ ] Infrastructure security scan passed (Trivy, Aqua, or equivalent)
- [ ] Container image scanned for vulnerabilities
- [ ] Network policies restrict traffic appropriately
- [ ] Secrets management validated (no plain text)

### Documentation & Compliance

- [ ] Security architecture documented
- [ ] Threat model completed for feature
- [ ] Incident response procedures defined
- [ ] Data classification documented
- [ ] Privacy impact assessment (PIA) completed
- [ ] Third-party service agreements reviewed (if used)
- [ ] Compliance requirements mapped to implementation
- [ ] Audit trail enables compliance reporting

---

## GDPR Compliance Checklist (If Applicable)

### Data Processing

- [ ] Privacy notice provided to users (clear, accessible language)
- [ ] Consent mechanism implemented (if required)
- [ ] Consent captured before any data collection
- [ ] Right to access implemented (export user data)
- [ ] Right to erasure implemented (delete user data upon request)
- [ ] Right to rectification implemented (allow users to correct data)
- [ ] Data portability supported (export in machine-readable format)
- [ ] Right to object implemented (opt-out mechanisms)

### Data Protection

- [ ] Data Protection Impact Assessment (DPIA) completed
- [ ] Data Processing Agreement (DPA) in place with processors
- [ ] Data retention schedule documented
- [ ] Automated decision-making disclosed (if applicable)
- [ ] Legitimate interest assessment documented
- [ ] Cross-border data transfer legal basis identified
- [ ] Sub-processors listed and approved

### Accountability

- [ ] Data Protection Officer (DPO) involvement documented
- [ ] Privacy by design principles applied
- [ ] Default privacy settings are privacy-protective
- [ ] Data breach notification procedure in place
- [ ] Ability to notify affected users within 72 hours
- [ ] Privacy policy updated and approved

---

## PCI-DSS Compliance Checklist (If Handling Payment Cards)

### Network Security

- [ ] Firewall configured to restrict access to cardholder data environment (CDE)
- [ ] Default passwords changed
- [ ] Configuration hardening completed
- [ ] No direct public access to cardholder data

### Access Control

- [ ] Cardholder data access restricted by business need
- [ ] MFA required for administrative access
- [ ] Account lockout after failed attempts
- [ ] Session timeouts configured (15 minutes ideal)
- [ ] Role-based access control implemented
- [ ] Periodic access reviews conducted

### Card Data Handling

- [ ] Card data never stored on internal networks (if avoidable)
- [ ] Card data encrypted when stored
- [ ] Card data never logged or tracked
- [ ] Only last 4 digits of card displayed (never full PAN)
- [ ] CVC/CVV never stored
- [ ] Expiration date separately stored if needed
- [ ] Tokenization or proxy service used (recommended)
- [ ] Payment gateway PCI-compliant (Level 1 certified)

### Monitoring & Testing

- [ ] Security tests performed regularly (quarterly minimum)
- [ ] Vulnerability scans completed quarterly
- [ ] Penetration testing completed annually
- [ ] Firewall rules reviewed monthly
- [ ] Intrusion detection system (IDS) monitoring enabled
- [ ] Security logs monitored for suspicious activity
- [ ] Incident response procedures in place

### Compliance Status

- [ ] PCI-DSS assessment completed
- [ ] Compliance certification obtained
- [ ] Attestation of Compliance (AOC) signed
- [ ] SAQ (Self-Assessment Questionnaire) completed
- [ ] Annual compliance maintained

---

## SOC2 Type II Checklist (Service Organization)

### Security

- [ ] Access controls restrict system access to authorized personnel
- [ ] Logging audits user access and changes
- [ ] Encryption protects data in transit and at rest
- [ ] Antivirus/malware protection enabled
- [ ] Security patching process implemented
- [ ] Vulnerability management process established

### Availability

- [ ] System designed for high availability (RTO, RPO defined)
- [ ] Redundancy in place (multi-region, failover)
- [ ] Backup and recovery tested regularly
- [ ] Monitoring alerts on availability issues
- [ ] Incident response plan defined
- [ ] Capacity planning ensures adequate resources

### Processing Integrity

- [ ] Input validation on all data
- [ ] Data completeness and accuracy validated
- [ ] Authorization controls on data modifications
- [ ] Audit trails log all changes
- [ ] Error handling prevents data loss/corruption
- [ ] System change management process in place

### Confidentiality

- [ ] Data encryption protects confidentiality
- [ ] Access controls limit who can view sensitive data
- [ ] NDAs and confidentiality agreements in place
- [ ] Data classification documented
- [ ] Retention and destruction policies enforced

### Privacy (if applicable)

- [ ] Personal information handling documented
- [ ] Appropriate permissions obtained for data collection
- [ ] Data minimization principles applied
- [ ] Transparency on data uses provided
- [ ] Individual rights support mechanisms in place

---

## Data Classification Checklist

### Identify Data Classification

- [ ] Public (no confidentiality concern)
- [ ] Internal (limited distribution, not sensitive)
- [ ] Confidential (restricted access, business sensitive)
- [ ] Restricted (highly sensitive, regulatory/legal requirement)

### For Each Data Class

- [ ] **Encryption**: Specify encryption requirement (transit/rest)
- [ ] **Access**: Define who can access (by role/group)
- [ ] **Retention**: Define how long to keep (retention schedule)
- [ ] **Disposal**: Define secure disposal method
- [ ] **Handling**: Define handling procedures (email, storage, sharing)
- [ ] **Audit**: Define audit/logging requirements
- [ ] **Examples**: Provide 3-5 examples of data in this class

---

## Third-Party & Vendor Assessment

- [ ] All third-party services documented
- [ ] Vendor security certifications reviewed
- [ ] Data Processing Agreements (DPA) in place
- [ ] Service Level Agreements (SLA) in place
- [ ] Vendor security assessments completed
- [ ] Vendor access controls reviewed
- [ ] Incident response procedures include vendors
- [ ] Vendor exit strategy documented (data retrieval, deletion)

| Vendor | Service | SLA Signed | DPA Signed | Certification | Risk Level |
|--------|---------|-----------|-----------|---------------|-----------|
| {Vendor Name} | {Service} | ☐ | ☐ | {e.g., SOC2} | {Low/Med/High} |

---

## Deployment Sign-Off

### Security Review

- [ ] Security lead reviewed implementation: **{Name}** | Date: ___
- [ ] No critical findings: ☐ Yes ☐ No
- [ ] All findings addressed: ☐ Yes ☐ No ☐ N/A
- [ ] Security lead approval: ☐ Approved ☐ Deferred ☐ Rejected

### Compliance Review

- [ ] Compliance team reviewed implementation: **{Name}** | Date: ___
- [ ] All applicable frameworks assessed: ☐ Yes ☐ No
- [ ] No critical compliance gaps: ☐ Yes ☐ No
- [ ] Compliance sign-off: ☐ Approved ☐ Deferred ☐ Rejected

### Data Privacy Review

- [ ] Privacy review completed: **{Name}** | Date: ___
- [ ] Privacy by design principles applied: ☐ Yes ☐ No
- [ ] User consent mechanisms validated: ☐ Yes ☐ N/A
- [ ] Privacy approval: ☐ Approved ☐ Deferred ☐ Rejected

### Engineering Review

- [ ] Code security review completed: **{Lead}** | Date: ___
- [ ] All security tests passed: ☐ Yes ☐ No
- [ ] Static analysis findings resolved: ☐ Yes ☐ None
- [ ] Engineering approval: ☐ Approved ☐ Deferred ☐ Rejected

---

## Post-Deployment Validation

### Week 1 Checklist

- [ ] No security alerts or anomalies in production
- [ ] All compliance controls functioning as expected
- [ ] Logging and audit trails working correctly
- [ ] Encryption/secrets management validated
- [ ] Third-party integrations secure and compliant
- [ ] Incident response procedures tested

### Ongoing Compliance

- [ ] Quarterly compliance reviews scheduled
- [ ] Annual penetration testing scheduled
- [ ] Vulnerability scanning configured (continuous)
- [ ] Security monitoring and alerting active
- [ ] Incident response drills scheduled quarterly

---

## Key Contacts

| Role | Name | Email | Responsibility |
|------|------|-------|-----------------|
| Security Lead | {} | {} | Overall security posture |
| Compliance Officer | {} | {} | Regulatory compliance |
| Privacy Officer | {} | {} | Data privacy/GDPR |
| DPA Contact | {} | {} | Data Protection Officer |

---

## Relevant Policies & Procedures

- Security Policy: {Link}
- Data Protection Policy: {Link}
- Incident Response Plan: {Link}
- Third-Party Risk Policy: {Link}
- Access Control Policy: {Link}
- Data Classification Policy: {Link}

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | {YYYY-MM-DD} | Initial compliance checklist | {Name} |

**Last Review**: {YYYY-MM-DD}  
**Next Review**: {YYYY-MM-DD} (post-deployment: 1 month)

---

## Appendix: Compliance Framework Mapping

### GDPR
- **Articles Applicable**: 5, 12, 13, 14, 15, 17, 18, 32
- **Key Requirement**: User consent, right to erasure, data portability
- **Penalty**: Up to 4% of annual revenue or €20M

### CCPA
- **Applicable If**: Business operates in California and collects CA resident data
- **Key Requirement**: Right to access, delete, opt-out
- **Penalty**: Up to $7,500 per knowing violation

### PCI-DSS
- **Applicable If**: Processing, storing, transmitting payment card data
- **Levels**: 1-4 based on transaction volume
- **Key Requirement**: Secure network, data protection, access control

### SOC2
- **Type I**: Point-in-time assessment
- **Type II**: 6-month operational assessment
- **Key Requirement**: Security, availability, processing integrity, confidentiality

---

## Sign-Off Log

| Date | Status | Security Lead | Compliance Lead | Notes |
|------|--------|---------------|-----------------|-------|
| {YYYY-MM-DD} | Ready for review | {} | {} | Initial checklist |
| {YYYY-MM-DD} | Changes required | {} | {} | Add GDPR items |
| {YYYY-MM-DD} | Approved | {} | {} | Ready for deployment |
