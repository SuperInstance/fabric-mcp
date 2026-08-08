# SendGrid Configuration Guide
**Last Updated:** 2026-03-15
**Status:** Ready for Setup

---

## Account Setup

### 1. Create SendGrid Account

1. Visit https://sendgrid.com/
2. Click "Start for Free"
3. Choose plan:
   - **Free Tier:** 100 emails/day (testing only)
   - **Professional:** $120/month (50K emails)
   - **Premier:** $500/month (300K emails) ✅ Recommended for launch

### 2. Verify Account

1. Check email for verification link
2. Complete sender identity verification
3. Set up 2-factor authentication (recommended)

---

## Domain Authentication

### DNS Configuration (Required for 100K+ sends)

#### SPF Record
```
Type: TXT
Name: @
Value: v=spf1 include:sendgrid.net ~all
TTL: 3600
```

#### DKIM Configuration
SendGrid will provide 3 CNAME records to add:
```
Type: CNAME
Name: smtpapi._domainkey
Value: dkim.sendgrid.net
TTL: 3600

Type: CNAME
Name: em1234.superinstance.ai
Value: u1234.wl.sendgrid.net
TTL: 3600

Type: CNAME
Name: s1234.superinstance.ai
Value: s1234.domainkey.u1234.wl.sendgrid.net
TTL: 3600
```

#### DMARC Policy
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:dmarc@superinstance.ai
TTL: 3600
```

**After 2 weeks with p=none, upgrade to p=quarantine, then p=reject**

### Verification Steps

1. Add DNS records at your domain registrar
2. Wait 15-30 minutes for propagation
3. Verify in SendGrid: Settings > Sender Authentication
4. Status should show "Verified"

---

## API Key Configuration

### Create API Key

1. Navigate to Settings > API Keys
2. Click "Create API Key"
3. Name: "Email Marketing Automation"
4. Permissions:
   - **Mail Send:** Full Access
   - **Scheduled Sends:** Full Access
   - **Templates:** Read Access
   - **Sender Identities:** Read Access
   - **Categories:** Read Access
   - **Stats:** Read Access

### Store API Key Securely

```bash
# Add to .env file (NEVER commit to git)
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Python Integration

```python
import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

# Initialize client
sg = SendGridAPIClient(os.environ.get('SENDGRID_API_KEY'))

# Send email
message = Mail(
    from_email='noreply@superinstance.ai',
    to_emails='user@example.com',
    subject='Welcome to SuperInstance',
    html_content='<strong>Hello!</strong>')
response = sg.send(message)
```

---

## Sender Identity Setup

### Create Sender Identity

1. Navigate to Settings > Sender Identity
2. Click "Create New Sender Identity"
3. Configure:

**From Address:** noreply@superinstance.ai
**From Name:** SuperInstance Team
**Reply To:** support@superinstance.ai
**Address:** 1234 Innovation Way, San Francisco, CA 94102

### Verification Options

Choose one:
- **Single Sender Verification:** SendGrid sends verification email
- **Domain Authentication:** (Recommended) Already configured above

---

## Email Template Setup

### Create Templates in SendGrid

1. Navigate to Marketing > Email Templates
2. Click "Create Template"
3. Name: "Welcome Sequence - Email 1"
4. Click "Add Version" and paste HTML template

#### Template Variables

SendGrid supports substitution variables:
```
{{first_name}}     → User's first name
{{email}}          → User's email
{{unsubscribe_url}}→ Unsubscribe link
{{preferences_url}}→ Preference center
{{view_in_browser}}→ View in browser link
{{signup_url}}     → Dynamic signup URL
{{dashboard_url}}  → Dashboard URL
```

### Custom Fields (Advanced)

For personalized content, add custom fields:

1. Navigate to Settings > Custom Fields
2. Create fields:
   - `user_type` (researcher, developer, educator, student)
   - `language` (en, es, zh, ar, hi, sw, fr, de, ja)
   - `signup_date` (YYYY-MM-DD)
   - `interests` (comma-separated list)
   - `activation_status` (pending, active, inactive)

---

## IP Warm-Up Schedule

### Why Warm Up?

Email providers distrust new IP addresses. Gradually increase volume to build reputation.

### Schedule (100K Target)

| Week | Daily Sends | Weekly Total | Notes |
|------|-------------|--------------|-------|
| 1 | 1,000 | 5,000 | Monitor bounce rate closely |
| 2 | 2,000 | 10,000 | Check spam folder placement |
| 3 | 4,000 | 20,000 | Review engagement metrics |
| 4 | 6,000 | 30,000 | A/B test subject lines |
| 5 | 10,000 | 50,000 | Optimize send times |
| 6 | 15,000 | 75,000 | Scale successful campaigns |
| 7 | 20,000 | 100,000 | Full launch blast ✅ |

### Daily Send Schedule

- **Best Time:** 10 AM local time (Tuesday-Thursday)
- **Second Best:** 2 PM local time (Monday, Friday)
- **Avoid:** 6 PM - 6 AM (spam folder risk)

---

## List Management

### Create Custom Lists

1. Navigate to Marketing > Contacts
2. Click "Create List"
3. Create segments:

**Main Lists:**
- `all_subscribers` - Master list
- `researchers` - Academic researchers
- `developers` - Software engineers
- `educators` - Teachers and professors
- `students` - Graduate/undergraduate students

**Segmentation Lists:**
- `beta_users` - Pre-launch beta testers
- `active_users` - Active platform users
- `trial_users` - Free trial users
- `paid_users` - Pro plan users
- `churned_users` - Inactive 30+ days

### Import Contacts

1. Prepare CSV file with headers:
```csv
email,first_name,last_name,user_type,language,signup_date,interests
user1@example.com,John,Researcher,researcher,en,2026-03-15,consensus,optimization
```

2. Navigate to Marketing > Contacts
3. Click "Import Contacts"
4. Upload CSV file
5. Map fields to SendGrid custom fields
6. Choose destination list

**Batch Size:** Maximum 10,000 per import

---

## Webhook Configuration

### Event Webhooks

Track email events in real-time:

1. Navigate to Settings > Mail Settings > Event Webhook
2. Enable events:
   - **Delivered** - Email successfully delivered
   - **Open** - Recipient opened email
   - **Click** - Recipient clicked link
   - **Bounce** - Email bounced
   - **Dropped** - SendGrid dropped email
   - **Spam Report** - Recipient marked as spam
   - **Unsubscribe** - Recipient unsubscribed
   - **Group Unsubscribe** - Unsubscribe from group
   - **Group Resubscribe** - Resubscribe to group

3. Set webhook URL: `https://api.superinstance.ai/webhooks/sendgrid`
4. Click "Test Your Integration"

### Webhook Handler (Python)

```python
from flask import Flask, request, jsonify
import hashlib

app = Flask(__name__)

@app.route('/webhooks/sendgrid', methods=['POST'])
def sendgrid_webhook():
    events = request.get_json()
    for event in events:
        # Process event
        event_type = event.get('event')
        email = event.get('email')
        timestamp = event.get('timestamp')

        # Handle different event types
        if event_type == 'open':
            handle_open(email, timestamp)
        elif event_type == 'click':
            handle_click(email, event.get('url'))
        elif event_type == 'bounce':
            handle_bounce(email, event.get('reason'))
        # ... handle other events

    return '', 204

def handle_open(email, timestamp):
    # Update user activity in database
    # Trigger automation workflows
    pass

def handle_click(email, url):
    # Track link clicks
    # Update user interests
    pass

def handle_bounce(email, reason):
    # Remove hard bounces from list
    # Log soft bounces for review
    pass
```

---

## Analytics & Reporting

### Key Metrics Dashboard

Navigate to Marketing > Analytics to view:

**Engagement Metrics:**
- Open rate (target: 25%+)
- Click rate (target: 4%+)
- Unsubscribe rate (target: <0.5%)
- Spam complaint rate (target: <0.1%)

**Deliverability Metrics:**
- Deliverability rate (target: 99%+)
- Bounce rate (target: <2%)
- Spam score (target: <1.0)

**Conversion Metrics:**
- Click-to-signup rate (target: 20%+)
- Signup activation rate (target: 50%+)
- Trial-to-paid rate (target: 10%+)

### Custom Reports

1. Navigate to Marketing > Reports
2. Click "Create Report"
3. Choose report type:
   - **Email Activity:** Opens, clicks, bounces over time
   - **Device Stats:** Desktop vs mobile opens
   - **Client Stats:** Email client breakdown
   - **Link Performance:** Top-performing links
   - **Geographic:** Performance by country

---

## Testing & Validation

### Test Email Checklist

Before any major send, validate:

- [ ] HTML template renders correctly in all clients
- [ ] Plain text version included
- [ ] All links work and are tracked
- [ ] Subject line preview text looks good
- [ ] Personalization variables populate correctly
- [ ] Spam score < 1.0 (use Mail-Tester.com)
- [ ] Send test to internal team (5+ people)
- [ ] Test on mobile devices
- [ ] Test in Gmail, Outlook, Apple Mail
- [ ] Unsubscribe link works
- [ ] Reply-to address is monitored

### Test Send Procedure

1. Create test list with 10 internal emails
2. Send campaign to test list only
3. Monitor for 1 hour:
   - Check delivery success rate
   - Verify emails arrive in inbox (not spam)
   - Test all links work
   - Confirm personalization works
4. If all tests pass, proceed to full send

---

## Deliverability Optimization

### Reputation Monitoring

Check your sender reputation weekly:
- **SendGrid Score:** Available in dashboard
- **Google Postmaster:** https://postmaster.google.com/
- **Microsoft SNDS:** https://postmaster.live.com/snds/
- **SenderScore:** https://senderscore.org/

### Content Best Practices

1. **Text-to-HTML Ratio:** 60:40 minimum
2. **Image-to-Text Ratio:** Max 40% images
3. **Alt Text:** Required for all images
4. **Avoid Spam Words:** Free, guarantee, amazing, incredible
5. **Email Size:** Max 100KB recommended
6. **One Clear CTA:** Don't overwhelm with choices

### List Hygiene

**Weekly Tasks:**
- Remove hard bounces immediately
- Process spam complaints (unsubscribe)
- Review soft bounces (remove after 3)
- Update inactive segment

**Monthly Tasks:**
- Re-engage inactive subscribers (send win-back email)
- Remove subscribers inactive 6+ months
- Clean duplicates and invalid emails
- Review complaint trends

---

## Automation Setup

### Marketing Campaigns (SendGrid)

SendGrid offers two automation tools:

1. **Single Sends:** One-time broadcasts
2. **Marketing Automation:** Behavior-triggered workflows

### Create Automation Workflow

1. Navigate to Marketing > Marketing Automation
2. Click "Create Automation"
3. Choose entry trigger:
   - **Contact Added to List:** Welcome sequence
   - **Link Clicked:** Feature follow-up
   - **Custom Field Match:** Segmentation

4. Build workflow:
   - Add email steps
   - Set wait/delay times
   - Add condition branches
   - Set goals and exit criteria

### Example: Welcome Sequence

```
Entry: User added to "new_subscribers" list
→ Wait 0 minutes
→ Send "Welcome - Email 1"
→ Wait 1 day
→ Send "Welcome - Email 2"
→ Wait 2 days
→ Send "Welcome - Email 3"
→ Wait 4 days
→ Send "Welcome - Email 4"
→ Wait 7 days
→ Send "Welcome - Email 5"
→ Check: User clicked signup link?
  → YES: Add to "active_users" list → Send "Onboarding 1"
  → NO: Add to "nurture" list → Send nurture sequence
```

---

## Security & Compliance

### GDPR Compliance

- [ ] Clear consent at signup
- [ ] Easy unsubscribe (one-click)
- [ ] Data export capability
- [ ] Data deletion on request
- [ ] Privacy policy linked
- [ ] Cookie policy linked

### CAN-SPAM Compliance

- [ ] Accurate header info
- [ ] Valid physical address
- [ ] Working unsubscribe mechanism
- [ ] Clear opt-out options
- [ ] No misleading subject lines

### Data Security

- [ ] API keys stored in environment variables
- [ ] SSL/TLS for all connections
- [ ] Regular security audits
- [ ] Access logging and monitoring
- [ ] PII encryption at rest

---

## Emergency Procedures

### High Bounce Rate (>5%)

1. **Immediate:** Pause all sends
2. **Investigate:**
   - Check DNS configuration
   - Verify SPF/DKIM/DMARC records
   - Review recent list imports
   - Check for spam trap hits
3. **Fix:**
   - Remove hard bounces
   - Clean mailing list
   - Reduce send volume
   - Contact SendGrid support
4. **Resume:** Gradual ramp-up over 3-5 days

### Spam Complaints (>0.1%)

1. **Immediate:** Pause sends to affected segment
2. **Investigate:**
   - Review recent email content
   - Check relevance to audience
   - Verify consent mechanisms
3. **Fix:**
   - Unsubscribe complainants
   - Adjust content strategy
   - Review targeting
   - Improve list hygiene
4. **Prevent:**
   - Better segmentation
   - Preference center
   - Frequency capping

### Account Suspension

If SendGrid suspends your account:

1. **Review violation notice**
2. **Document compliance efforts**
3. **Create remediation plan**
4. **Contact support with:**
   - Account details
   - Violation explanation
   - Corrective actions taken
   - Future prevention plan
5. **Implement review before resuming**

---

## Cost Calculator

### SendGrid Pricing (March 2026)

| Plan | Monthly Cost | Sends | Cost/1000 |
|------|--------------|-------|-----------|
| Free | $0 | 100/day | $0 |
| Basic | $19.95 | 5K | $4.00 |
| Pro | $89 | 50K | $1.78 |
| Premier | $500 | 300K | $1.67 |

### ROI Calculation

**Launch Campaign (100K emails):**
- SendGrid Cost (Premier): $500
- Expected Conversions: 3% = 3,000 signups
- Cost per Signup: $0.17
- Expected LTV: $50/signup
- ROI: 29,300%

---

## Support & Resources

### SendGrid Support
- **Documentation:** https://docs.sendgrid.com/
- **API Reference:** https://docs.sendgrid.com/api-reference/
- **Community:** https://sendgrid.com/community
- **Support Email:** support@sendgrid.com
- **Status Page:** https://status.sendgrid.com/

### Helpful Tools
- **Mail-Tester:** https://www.mail-tester.com/ (spam score)
- **Email on Acid:** https://www.emailonacid.com/ (testing)
- **Litmus:** https://litmus.com/ (preview)
- **Putsmail:** https://putsmail.com/ (test emails)

---

## Next Steps

1. [ ] Create SendGrid account
2. [ ] Configure DNS records (SPF, DKIM, DMARC)
3. [ ] Generate API key and store securely
4. [ ] Create sender identity
5. [ ] Upload email templates
6. [ ] Create custom fields
7. [ ] Import test contacts (100 emails)
8. [ ] Send test campaign and validate
9. [ ] Begin IP warm-up schedule
10. [ ] Launch to full list after warm-up complete

---

**Status:** Configuration Ready
**Last Updated:** 2026-03-15
**Owner:** Growth Marketing Team
