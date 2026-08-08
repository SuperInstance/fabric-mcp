# Spreadsheet Moment - Rollback Plan

**Version:** 1.0.0
**Last Updated:** 2026-03-14
**Owner:** Operations Lead
**Approver:** Engineering Lead

---

## Executive Summary

This rollback plan provides detailed procedures for reverting Spreadsheet Moment platform to a previous stable state in the event of a failed deployment, critical issues, or security incidents. The plan ensures minimal downtime and data loss while maintaining system integrity.

**Maximum RTO (Recovery Time Objective):** 15 minutes
**Maximum RPO (Recovery Point Objective):** 5 minutes
**Rollback Success Rate Target:** 100%

---

## Table of Contents

1. [Rollback Triggers](#1-rollback-triggers)
2. [Pre-Rollback Preparation](#2-pre-rollback-preparation)
3. [Rollback Procedures](#3-rollback-procedures)
4. [Post-Rollback Verification](#4-post-rollback-verification)
5. [Rollback Communication](#5-rollback-communication)
6. [Rollback Testing](#6-rollback-testing)
7. [Emergency Contacts](#7-emergency-contacts)

---

## 1. Rollback Triggers

### 1.1 Automatic Rollback Triggers

**Immediate Rollback (< 2 minutes):**
- Error rate > 10% for 1 minute
- System completely down (all instances unhealthy)
- Database connection failures (100% connection pool exhausted)
- Security breach confirmed (active attack)
- Data corruption detected (checksum failures)
- Critical security vulnerability exploited (CVE with active exploit)

**Urgent Rollback (< 5 minutes):**
- Error rate > 5% for 3 minutes
- Latency p95 > 1000ms for 3 minutes
- Database deadlocks or severe performance degradation
- Authentication/authorization failures (users unable to login)
- Critical user-facing bugs (data loss, incorrect calculations)
- Memory leaks causing OOM (Out of Memory) errors

**Considered Rollback (< 15 minutes):**
- Error rate > 1% for 10 minutes
- Latency p95 > 500ms for 10 minutes
- Customer complaints > 20 in 10 minutes
- Feature regression (working feature broken)
- Third-party service integration failures
- Performance degradation impacting user experience

### 1.2 Manual Rollback Triggers

**Decision Authority:**
- **Immediate:** Operations Lead (can initiate without approval)
- **Urgent:** Engineering Lead approval required
- **Considered:** Product Manager + Engineering Lead approval required

**Manual Rollback Scenarios:**
- Business logic errors (incorrect calculations, data validation issues)
- Legal/compliance concerns (privacy violations, regulatory issues)
- UX problems (confusing interface, broken workflows)
- Feature flags need to be disabled
- A/B test showing negative results

### 1.3 Rollback Decision Matrix

| Severity | Error Rate | Latency p95 | User Impact | Rollback Time | Approval Required |
|----------|------------|-------------|-------------|---------------|-------------------|
| Critical | >10% | N/A | Complete outage | <2 min | Ops Lead only |
| High | >5% | >1000ms | Severe degradation | <5 min | Engineering Lead |
| Medium | >1% | >500ms | Moderate degradation | <15 min | Product + Eng |
| Low | <1% | <500ms | Minimal impact | Scheduled | All stakeholders |

---

## 2. Pre-Rollback Preparation

### 2.1 Pre-Launch Rollback Preparation

**Week Before Launch:**
- [ ] Document all rollback procedures
- [ ] Test rollback procedures on staging
- [ ] Verify backup integrity
- [ ] Create rollback runbooks
- [ ] Train team on rollback procedures
- [ ] Set up rollback monitoring
- [ ] Prepare rollback communication templates

**Day Before Launch:**
- [ ] Verify previous version available
- [ ] Test database backup restore
- [ ] Verify configuration backups
- [ ] Pre-stage rollback scripts
- [ ] Confirm rollback team availability
- [ ] Test rollback communication channels

### 2.2 Rollback Readiness Checklist

**Infrastructure:**
- [ ] Previous Docker images available in registry
- [ ] Database backups accessible and verified
- [ ] Configuration backups stored securely
- [ ] Rollback scripts tested and ready
- [ ] Monitoring dashboards configured for rollback
- [ ] Alert thresholds set for rollback triggers

**Team:**
- [ ] Rollback team identified and trained
- [ ] On-call rotation includes rollback experts
- [ ] Escalation paths documented
- [ ] Communication channels tested
- [ ] Decision authority matrix clear

**Process:**
- [ ] Rollback procedures documented
- [ ] Rollback testing completed
- [ ] Rollback automation ready
- [ ] Post-rollback verification steps defined
- [ ] Rollback communication templates prepared

### 2.3 Rollback Pre-Checks

**Before initiating rollback, verify:**

1. **System Status:**
   ```bash
   # Check current deployment status
   kubectl get pods -n production
   kubectl get deployment spreadsheet-moment -n production
   kubectl rollout history deployment/spreadsheet-moment -n production
   ```

2. **Error Analysis:**
   ```bash
   # Check recent error logs
   kubectl logs -l app=spreadsheet-moment -n production --tail=1000 | grep ERROR
   ```

3. **Performance Metrics:**
   ```bash
   # Check current performance
   kubectl top pods -n production
   curl -w "@curl-format.txt" -o /dev/null -s https://api.spreadsheetmoment.com/health
   ```

4. **Database Status:**
   ```bash
   # Verify database health
   kubectl exec -it postgres-0 -n production -- psql -U postgres -c "SELECT 1;"
   ```

---

## 3. Rollback Procedures

### 3.1 Application Rollback

**Scenario:** Critical application issues detected

**Procedure:**

1. **Declare Incident:**
   - Post in #incident-response Slack channel
   - Page on-call team
   - Create incident bridge call

2. **Assess Situation (2 minutes):**
   - Review error logs
   - Check metrics dashboards
   - Verify user impact
   - Confirm rollback is necessary

3. **Execute Rollback:**
   ```bash
   # Rollback to previous version
   kubectl rollout undo deployment/spreadsheet-moment -n production

   # Monitor rollback progress
   kubectl rollout status deployment/spreadsheet-moment -n production

   # Verify new pods are running
   kubectl get pods -n production -l app=spreadsheet-moment
   ```

4. **Verify Rollback:**
   ```bash
   # Check health endpoint
   curl -f https://api.spreadsheetmoment.com/health

   # Run smoke tests
   ./scripts/smoke_test.sh --environment=production

   # Verify error rate decreased
   # Check metrics dashboard
   ```

5. **Monitor Stability (10 minutes):**
   - Watch error rates
   - Monitor latency
   - Check user complaints
   - Verify system stability

**Rollback Time:** 5-10 minutes
**Downtime:** 1-2 minutes (during rollout)

### 3.2 Database Rollback

**Scenario:** Database migration issues or data corruption

**Procedure:**

1. **Stop Application:**
   ```bash
   # Scale down to zero
   kubectl scale deployment spreadsheet-moment --replicas=0 -n production
   ```

2. **Assess Database:**
   ```bash
   # Connect to database
   kubectl exec -it postgres-0 -n production -- psql -U postgres

   # Check schema version
   SELECT version FROM schema_migrations ORDER BY version DESC LIMIT 1;

   # Check table integrity
   \dt
   SELECT COUNT(*) FROM users;
   ```

3. **Restore from Backup:**
   ```bash
   # Copy backup to pod
   kubectl cp pre-migration-backup.sql postgres-0:/tmp/backup.sql -n production

   # Restore database
   kubectl exec -it postgres-0 -n production -- psql -U postgres -f /tmp/backup.sql
   ```

4. **Revert Migration:**
   ```bash
   # Run down migration
   kubectl exec -it postgres-0 -n production -- psql -U postgres -f /migrations/001_down.sql
   ```

5. **Restart Application:**
   ```bash
   # Scale up
   kubectl scale deployment spreadsheet-moment --replicas=3 -n production

   # Verify pods started
   kubectl get pods -n production -l app=spreadsheet-moment
   ```

6. **Verify Data:**
   ```bash
   # Run data integrity checks
   ./scripts/verify_data_integrity.sh
   ```

**Rollback Time:** 15-30 minutes
**Downtime:** 10-25 minutes

### 3.3 Configuration Rollback

**Scenario:** Configuration changes causing issues

**Procedure:**

1. **Identify Bad Configuration:**
   ```bash
   # Check current config
   kubectl get configmap spreadsheet-config -n production -o yaml
   ```

2. **Restore Previous Config:**
   ```bash
   # Apply previous config
   kubectl apply -f kubernetes/backups/configmap-backup.yaml

   # Or edit directly
   kubectl edit configmap spreadsheet-config -n production
   ```

3. **Restart Pods:**
   ```bash
   # Force pod restart to pick up new config
   kubectl rollout restart deployment/spreadsheet-moment -n production
   ```

4. **Verify Configuration:**
   ```bash
   # Check config loaded
   kubectl exec -it deployment/spreadsheet-moment -n production -- env | grep CONFIG
   ```

**Rollback Time:** 5-10 minutes
**Downtime:** 1-2 minutes

### 3.4 Infrastructure Rollback

**Scenario:** Infrastructure changes causing issues

**Procedure:**

1. **Assess Infrastructure Changes:**
   ```bash
   # Check recent Terraform changes
   cd deployment/terraform/production
   terraform plan
   ```

2. **Revert Infrastructure:**
   ```bash
   # Revert to previous state
   terraform apply terraform.tfstate.backup

   # Or manually revert specific changes
   terraform destroy -target=aws_instance.new_instance
   terraform apply
   ```

3. **Verify Infrastructure:**
   ```bash
   # Check cluster health
   kubectl cluster-info
   kubectl get nodes
   ```

**Rollback Time:** 20-60 minutes
**Downtime:** Variable (depending on changes)

### 3.5 Feature Flag Rollback

**Scenario:** New feature causing issues

**Procedure:**

1. **Disable Feature Flag:**
   ```bash
   # Update feature flag
   kubectl patch configmap feature-flags -n production --type merge -p '{"data":{"NEW_FEATURE":"false"}}'

   # Or use feature flag service
   curl -X POST https://flags.spreadsheetmoment.com/api/v1/flags/NEW_FEATURE/disable \
     -H "Authorization: Bearer $API_KEY"
   ```

2. **Restart Services:**
   ```bash
   # Rollout restart to pick up flag change
   kubectl rollout restart deployment/spreadsheet-moment -n production
   ```

3. **Verify Feature Disabled:**
   ```bash
   # Test feature endpoint returns 404
   curl -I https://api.spreadsheetmoment.com/api/v1/new-feature
   ```

**Rollback Time:** 2-5 minutes
**Downtime:** 0 minutes (feature flags)

### 3.6 Full System Rollback

**Scenario:** Complete system failure

**Procedure:**

1. **Execute Full Rollback:**
   ```bash
   # Rollback application
   kubectl rollout undo deployment/spreadsheet-moment -n production

   # Rollback database (if needed)
   # See database rollback procedure

   # Rollback configuration
   kubectl apply -f kubernetes/backups/

   # Rollback infrastructure (if needed)
   # See infrastructure rollback procedure
   ```

2. **Verify All Systems:**
   ```bash
   # Run full verification
   ./scripts/verify_full_system.sh
   ```

**Rollback Time:** 30-60 minutes
**Downtime:** 15-45 minutes

---

## 4. Post-Rollback Verification

### 4.1 System Verification Checklist

**Application:**
- [ ] All pods Running and Ready
- [ ] Health endpoints returning 200
- [ ] No errors in application logs
- [ ] Smoke tests passing
- [ ] API endpoints responding

**Database:**
- [ ] Database accessible
- [ ] Data integrity verified
- [ ] Schema version correct
- [ ] No data corruption
- [ ] Backups tested

**Infrastructure:**
- [ ] All nodes Ready
- [ ] Load balancers working
- [ ] CDN caching properly
- [ ] DNS resolving correctly
- [ ] SSL certificates valid

**Performance:**
- [ ] Error rate < 0.1%
- [ ] Latency p95 < 100ms
- [ ] CPU usage < 70%
- [ ] Memory usage < 80%
- [ ] Database connections healthy

**User Experience:**
- [ ] User authentication working
- [ ] Core functionality operational
- [ ] No user complaints in last 10 minutes
- [ ] Support tickets manageable
- [ ] Social media sentiment neutral/positive

### 4.2 Verification Scripts

**Full System Verification:**
```bash
#!/bin/bash
# verify_full_system.sh

echo "Starting full system verification..."

# Verify application
echo "Verifying application..."
kubectl get pods -n production
curl -f https://api.spreadsheetmoment.com/health || exit 1

# Verify database
echo "Verifying database..."
kubectl exec -it postgres-0 -n production -- psql -U postgres -c "SELECT 1;" || exit 1

# Verify performance
echo "Verifying performance..."
./scripts/load_test.sh --rps=10 --duration=30

# Verify security
echo "Verifying security..."
./scripts/security_scan.sh

echo "System verification complete"
```

**Smoke Test Verification:**
```bash
#!/bin/bash
# smoke_test.sh

echo "Running smoke tests..."

# Test authentication
curl -X POST https://api.spreadsheetmoment.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass"}'

# Test spreadsheet creation
curl -X POST https://api.spreadsheetmoment.com/api/v1/spreadsheets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Spreadsheet"}'

# Test API endpoints
curl https://api.spreadsheetmoment.com/api/v1/status

echo "Smoke tests complete"
```

### 4.3 Rollback Success Criteria

**Immediate Success (5 minutes):**
- Error rate decreased to < 0.5%
- System responding to requests
- No critical errors in logs
- Health endpoints returning 200

**Short-term Success (30 minutes):**
- Error rate < 0.1%
- Latency p95 < 100ms
- User complaints stopped
- System stable

**Long-term Success (24 hours):**
- No recurrence of rollback issues
- Root cause identified and fixed
- Fixes tested and deployed
- Incident post-mortem completed

---

## 5. Rollback Communication

### 5.1 Internal Communication

**Immediate (< 5 minutes):**
1. **Declare Incident:** Post in #incident-response
2. **Page Team:** Alert on-call engineering team
3. **Create Bridge:** Start conference call for coordination
4. **Update Status:** Mark incident in status page

**Frequent Updates (Every 5-10 minutes):**
1. **Progress Updates:** Share rollback progress
2. **ETA Updates:** Provide estimated completion time
3. **Impact Assessment:** Update on user impact
4. **Next Steps:** Outline ongoing actions

**Resolution (< 1 hour post-rollback):**
1. **Success Confirmation:** Announce rollback complete
2. **Summary:** Provide incident summary
3. **Next Steps:** Outline investigation and fix plan
4. **Follow-up:** Schedule post-mortem meeting

### 5.2 External Communication

**Status Page Updates:**

**Initial Incident (10 minutes):**
```
We are currently experiencing technical difficulties.
Our team is actively investigating the issue.
Next update in 15 minutes.
```

**Rollback in Progress (20 minutes):**
```
We are rolling back to a previous stable version
to resolve the issue. This may take 10-15 minutes.
Thank you for your patience.
```

**Rollback Complete (30 minutes):**
```
The rollback has been completed successfully.
All services are restored. We are continuing to monitor
the situation closely.
```

**Resolved (1 hour):**
```
This incident has been resolved. We apologize for
any inconvenience caused. A full post-incident report
will be published within 24 hours.
```

### 5.3 Communication Templates

**Incident Declaration:**
```
@here Incident declared: [INCIDENT_TITLE]
Severity: [SEVERITY]
Impact: [USER_IMPACT]
Rollback initiated by: [NAME]
ETA: [ESTIMATED_TIME]
Bridge call: [ZOOM_LINK]
```

**Rollback Progress:**
```
Rollback Progress Update:
- Application rollback: [STATUS] ([PERCENT]%)
- Database rollback: [STATUS] ([PERCENT]%)
- Configuration rollback: [STATUS] ([PERCENT]%)
- Overall: [STATUS]
ETA to completion: [TIME]
```

**Rollback Complete:**
```
Rollback Complete ✓
Time to rollback: [DURATION]
Downtime: [DURATION]
System status: HEALTHY
Next steps: Investigating root cause and preparing fix
```

---

## 6. Rollback Testing

### 6.1 Pre-Launch Rollback Testing

**Testing Schedule:**
- **Week -2:** Initial rollback procedure testing
- **Week -1:** Rollback procedure refinement
- **Day -2:** Full rollback drill
- **Day -1:** Final rollback verification

**Test Scenarios:**

1. **Application Rollback Test:**
   - Deploy new version
   - Verify it's working
   - Rollback to previous version
   - Verify rollback successful
   - Document any issues

2. **Database Rollback Test:**
   - Run migration on staging
   - Verify migration successful
   - Rollback migration
   - Verify data integrity
   - Document any issues

3. **Configuration Rollback Test:**
   - Update configuration
   - Verify config applied
   - Rollback configuration
   - Verify old config active
   - Document any issues

4. **Full System Rollback Test:**
   - Deploy everything to staging
   - Verify system working
   - Execute full rollback
   - Verify everything restored
   - Document any issues

### 6.2 Rollback Drill Results

**Drill Date:** [DATE]
**Participants:** [NAMES]
**Scenarios Tested:** [LIST]

**Results:**
- Application Rollback: [PASS/FAIL] - [TIME]
- Database Rollback: [PASS/FAIL] - [TIME]
- Configuration Rollback: [PASS/FAIL] - [TIME]
- Full System Rollback: [PASS/FAIL] - [TIME]

**Issues Found:**
1. [ISSUE_1]
2. [ISSUE_2]
3. [ISSUE_3]

**Improvements Made:**
1. [IMPROVEMENT_1]
2. [IMPROVEMENT_2]
3. [IMPROVEMENT_3]

**Conclusion:** [READY/NOT_READY] for launch

### 6.3 Continuous Rollback Improvement

**Post-Rollback Reviews:**
- Conduct after every rollback
- Document what went well
- Identify areas for improvement
- Update rollback procedures
- Retest improved procedures

**Rollback Metrics:**
- Track rollback frequency
- Measure rollback time
- Calculate rollback success rate
- Monitor downtime duration
- Analyze rollback causes

**Rollback Optimization:**
- Automate rollback procedures
- Reduce rollback time
- Minimize downtime
- Improve rollback reliability
- Enhance rollback monitoring

---

## 7. Emergency Contacts

### 7.1 Rollback Team

| Role | Name | Phone | Email | Slack |
|------|------|-------|-------|-------|
| Rollback Commander | Operations Lead | [Phone] | [Email] | @ops-lead |
| Application Lead | Engineering Lead | [Phone] | [Email] | @eng-lead |
| Database Lead | DBA | [Phone] | [Email] | @dba |
| Infrastructure Lead | DevOps Lead | [Phone] | [Email] | @devops-lead |
| Security Lead | Security Lead | [Phone] | [Email] | @security-lead |

### 7.2 Escalation Contacts

| Role | Name | Phone | Email |
|------|------|-------|-------|
| CTO | [Name] | [Phone] | [Email] |
| VP Engineering | [Name] | [Phone] | [Email] |
| VP Product | [Name] | [Phone] | [Email] |
| CEO | [Name] | [Phone] | [Email] |

### 7.3 Service Providers

| Service | Contact | Phone | Email |
|---------|---------|-------|-------|
| Cloud Provider | AWS Support | 1-800-555-1234 | support@aws.amazon.com |
| Database Support | PostgreSQL | 1-800-555-5678 | support@postgresql.org |
| Monitoring Service | Datadog | 1-800-555-9012 | support@datadoghq.com |
| CDN Provider | Cloudflare | 1-800-555-3456 | support@cloudflare.com |

---

## Appendix

### A. Rollback Command Reference

**Quick Rollback Commands:**
```bash
# Application rollback
kubectl rollout undo deployment/spreadsheet-moment -n production

# Database restore
kubectl exec -it postgres-0 -n production -- psql -U postgres < backup.sql

# Configuration rollback
kubectl apply -f kubernetes/backups/configmap.yaml

# Pod restart
kubectl rollout restart deployment/spreadsheet-moment -n production
```

**Verification Commands:**
```bash
# Check pods
kubectl get pods -n production

# Check rollout status
kubectl rollout status deployment/spreadsheet-moment -n production

# Check logs
kubectl logs -f deployment/spreadsheet-moment -n production

# Health check
curl -f https://api.spreadsheetmoment.com/health
```

### B. Rollback Decision Tree

```
Error Detected
    |
    v
Is Error Rate > 10%?
    |
    +-- YES --> Automatic Rollback (Immediate)
    |
    +-- NO --> Is Error Rate > 5%?
                  |
                  +-- YES --> Urgent Rollback (5 minutes)
                  |
                  +-- NO --> Is Error Rate > 1%?
                            |
                            +-- YES --> Considered Rollback (15 minutes)
                            |
                            +-- NO --> Monitor and Assess
```

### C. Rollback Metrics Dashboard

**Grafana Dashboard:** https://grafana.spreadsheetmoment.com/d/rollback

**Key Metrics:**
- Rollback Frequency: rollbacks per week
- Rollback Time: minutes to complete
- Downtime Duration: minutes of unavailability
- Rollback Success Rate: percentage of successful rollbacks
- Time to Recovery: minutes from issue to resolution

---

**Last Updated:** 2026-03-14
**Next Review:** After any rollback or quarterly
**Owner:** Operations Lead
**Status:** Ready for Launch

---

**Remember:** Rollback is a safety mechanism. When in doubt, rollback first and investigate later. User experience and data integrity are the top priorities.
