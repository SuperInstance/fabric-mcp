# Login Issues & Password Reset

**Article ID:** KB064
**Category:** Technical Support
**Difficulty:** Beginner
**Time to Complete:** 5 minutes
**Languages:** EN, ES, ZH, AR, HI, SW, FR, DE, JA
**Last Updated:** 2026-03-15

---

## Overview

Having trouble logging into your SuperInstance account? This guide covers the most common login issues and provides step-by-step solutions to get you back to learning quickly.

---

## Quick Diagnosis

### What type of login issue are you experiencing?

| Issue | Solution | Link |
|-------|----------|------|
| Forgot password | Password reset | [Jump to Solution](#forgot-password) |
| Wrong password | Verify and reset | [Jump to Solution](#wrong-password) |
| Account locked | Wait or unlock | [Jump to Solution](#account-locked) |
| Email not recognized | Check email or register | [Jump to Solution](#email-not-recognized) |
| 2FA problems | Recovery codes | [Jump to Solution](#two-factor-authentication-issues) |
| Browser issues | Clear cache/update | [Jump to Solution](#browser-and-cache-issues) |
| Session expired | Re-login | [Jump to Solution](#session-expired) |

---

## Common Issues & Solutions

### Forgot Password

**Symptoms:**
- Can't remember your password
- Password reset link not working
- Reset email not received

**Solution:**

1. **Go to the Login Page**
   Visit [https://superinstance.ai/login](https://superinstance.ai/login)

2. **Click "Forgot Password"**
   Located below the password field

3. **Enter Your Email Address**
   Use the email associated with your account

4. **Check Your Email**
   - Look for an email from `noreply@superinstance.ai`
   - Subject: "Reset Your SuperInstance Password"
   - Check spam/junk folder if not in inbox

5. **Click the Reset Link**
   - Link expires in 24 hours
   - Opens in a new tab for security

6. **Create a New Password**
   - Must meet password requirements (see [Password Requirements](#password-requirements))
   - Enter twice to confirm

7. **Login with New Password**
   - Use your new password to login
   - Consider enabling 2FA for extra security

**If Reset Email Doesn't Arrive:**
1. Wait 5-10 minutes (email delivery can be delayed)
2. Check spam/junk folders
3. Add `noreply@superinstance.ai` to your contacts
4. Verify email address is correct
5. Contact support if problem persists

---

### Wrong Password

**Symptoms:**
- "Invalid password" error message
- Password not accepted after multiple attempts
- Recently changed password not working

**Solution:**

1. **Verify Password**
   - Check for typos (Caps Lock, num lock)
   - Ensure correct email address
   - Try copy-pasting from password manager

2. **Reset Password**
   If you're unsure of the password, reset it:
   - Use "Forgot Password" link
   - Follow password reset steps above

3. **Clear Browser Cache**
   Old saved passwords can cause issues:
   - Clear saved passwords for superinstance.ai
   - Disable password autofill temporarily
   - Enter password manually

4. **Try Different Browser**
   Browser-specific issues can occur:
   - Try Chrome, Firefox, Safari, or Edge
   - Incognito/private mode can help diagnose

5. **Check Keyboard Layout**
   Language settings can affect typing:
   - Ensure correct keyboard layout (EN, ES, etc.)
   - Check for special character issues

---

### Account Locked

**Symptoms:**
- "Account locked" error message
- "Too many login attempts" notification
- Cannot login even with correct password

**Solution:**

**Automatic Lock (5 failed attempts):**
- **Duration:** 30 minutes
- **Reason:** Security measure to prevent brute force attacks
- **Action:** Wait 30 minutes and try again
- **Prevention:** Use password reset instead of guessing

**Manual Lock (Suspicious activity):**
- **Duration:** Until verified
- **Reason:** Unusual login pattern detected
- **Action:**
  1. Check your email for security alert
  2. Follow verification instructions
  3. May require email confirmation or 2FA
  4. Contact support if you believe this is an error

**Immediate Unlock (Account verified):**
1. Use "Forgot Password" link
2. Reset password via email verification
3. This automatically unlocks the account
4. Login with new password

---

### Email Not Recognized

**Symptoms:**
- "Email not found" error message
- "Account does not exist" notification
- Cannot register because email already in use

**Solution:**

**If you think you have an account:**
1. **Verify Email Address**
   - Check for typos
   - Try alternative email addresses
   - Check old emails from SuperInstance

2. **Check Social Login**
   - You may have registered with Google, Facebook, or Apple
   - Try logging in with social media buttons
   - Check if email is linked to social account

3. **Search Your Inbox**
   - Search for "SuperInstance" or "welcome" emails
   - Look for original registration email
   - Find which email you used

4. **Contact Support**
   - Provide alternative email addresses
   - Provide name and approximate registration date
   - Support can help locate your account

**If you need a new account:**
1. **Use a Different Email**
   - If email is "already in use" but you can't access the account
   - Contact support to recover or remove old account

2. **Register New Account**
   - Use current email address
   - Follow registration steps in [KB001: Creating Your Account](https://help.superinstance.ai/kb001)

---

### Two-Factor Authentication Issues

**Symptoms:**
- Can't receive 2FA code
- Authenticator app not working
- Lost 2FA device
- Backup codes lost

**Solution:**

**Authenticator App Issues:**
1. **Check Time Sync**
   - Ensure device time is correct
   - Authenticator apps require accurate time
   - Enable automatic time updates

2. **Try Different Code**
   - Codes change every 30 seconds
   - Wait for next code if first fails
   - Don't reuse old codes

3. **Reinstall Authenticator**
   - Backup codes first (if available)
   - Remove and re-add SuperInstance account
   - Scan QR code again

**SMS/Email Code Issues:**
1. **Check Delivery**
   - Wait up to 2 minutes for delivery
   - Check spam folder (email codes)
   - Ensure phone has service (SMS codes)

2. **Request New Code**
   - Wait 60 seconds between requests
   - Limit: 3 requests per login attempt

**Lost 2FA Device:**
1. **Use Backup Codes**
   - You received 10 backup codes when enabling 2FA
   - Each code can be used once
   - Keep them safe!

2. **Contact Support**
   If you don't have backup codes:
   - Email: support@superinstance.ai
   - Provide: Account email, verification ID
   - Process: Identity verification required
   - Timeline: 1-3 business days

**Disable 2FA (After Login):**
1. Go to Account Settings
2. Security tab
3. Two-Factor Authentication section
4. Click "Disable"
5. Confirm with password or 2FA code

---

### Browser and Cache Issues

**Symptoms:**
- Login button not working
- Stuck on loading screen
- Error messages like "404" or "500"
- Page not displaying correctly

**Solution:**

**Clear Browser Cache:**
1. Open browser settings
2. Privacy/Security section
3. Clear browsing data
4. Select "Cached images and files"
5. Clear data for superinstance.ai specifically

**Disable Extensions:**
1. Open incognito/private mode
2. Try logging in
3. If successful, an extension is causing issues
4. Disable extensions one by one to find the culprit

**Update Browser:**
1. Check for browser updates
2. Install latest version
3. Restart browser
4. Try login again

**Try Different Browser:**
- Chrome (recommended)
- Firefox
- Safari
- Edge

**Disable VPN/Proxy:**
- VPNs can sometimes cause login issues
- Try disabling temporarily
- Contact IT if on corporate network

---

### Session Expired

**Symptoms:**
- "Session expired" message
- Automatically logged out
- "Please login again" notification

**Solution:**

**Normal Session Expiration:**
- **Duration:** 24 hours of inactivity
- **Reason:** Security measure
- **Action:** Simply login again

**Frequent Expiration:**
1. **Check Browser Settings**
   - Some browsers clear cookies on close
   - Disable "clear cookies on exit" for superinstance.ai

2. **Check Device Time**
   - Incorrect time can cause session issues
   - Enable automatic time sync

3. **Disable Battery Saver**
   - Some battery savers aggressive clear data
   - Add superinstance.ai to exceptions

**Stay Logged In:**
- Check "Remember me" box when logging in
- Creates 30-day session (don't use on shared devices)
- Requires cookie acceptance

---

## Password Requirements

When creating or resetting your password, it must meet these criteria:

### Minimum Requirements
- **Length:** 8-128 characters
- **Uppercase:** At least one (A-Z)
- **Lowercase:** At least one (a-z)
- **Number:** At least one (0-9)
- **Special Characters:** Optional but recommended (!@#$%^&*)

### Prohibited
- Your email address or username
- Common words (password, welcome, etc.)
- Sequential characters (123, abc)
- Repeated characters (aaa, 111)

### Best Practices
✅ Use a passphrase (e.g., "BlueHorse$Sky42")
✅ Use a password manager
✅ Unique password for SuperInstance
✅ Enable 2FA for extra security

❌ Don't reuse passwords
❌ Don't share your password
❌ Don't write it down insecurely
❌ Don't use personal information

---

## Security Features

### Login Security
- **Failed Attempt Tracking:** 5 attempts = 30-minute lock
- **Unusual Activity Detection:** Alerts for suspicious logins
- **Device Recognition:** Remembers trusted devices
- **Location Tracking:** Alerts for new login locations

### Session Security
- **Auto-Logout:** After 24 hours of inactivity
- **Concurrent Sessions:** Maximum 3 devices
- **Session Management:** View and revoke active sessions
- **Secure Cookies:** HttpOnly, Secure flags enabled

### Account Security
- **Encryption:** All data encrypted in transit and at rest
- **2FA Available:** Highly recommended for all users
- **Password Hashing:** Bcrypt with salt
- **Regular Audits:** Security testing and monitoring

---

## Prevention Tips

### Avoid Future Login Issues

1. **Use a Password Manager**
   - LastPass, 1Password, Bitwarden
   - Autofills correct password
   - Stores passwords securely

2. **Enable 2FA**
   - Adds extra security layer
   - Prevents unauthorized access
   - Protects even if password is compromised

3. **Save Backup Codes**
   - Print and store securely
   - Don't rely on single device
   - Update after using each code

4. **Keep Email Updated**
   - Ensure email address is current
   - Add noreply@superinstance.ai to contacts
   - Check spam filters regularly

5. **Bookmark Login Page**
   - Use official URL: superinstance.ai/login
   - Avoid phishing sites
   - Verify SSL certificate (HTTPS)

---

## Still Need Help?

### Contact Support

If you've tried all solutions and still can't login:

📧 **Email:** support@superinstance.ai
📧 **Subject:** Login Issue - [Your Email]
📧 **Body Include:**
- Email address associated with account
- Description of the issue
- Steps you've already tried
- Screenshot of error message (if applicable)
- Browser and device information

**Average Response Time:** Under 2 hours
**24/7 Support:** Available for Pro and Enterprise tiers

### Emergency Access

**Urgent Access Needed:**
- For time-sensitive coursework or deadlines
- Enterprise users: Contact account manager directly
- Institution users: Contact administrator
- Pro users: Use priority support channel

---

## Related Articles

- [KB001: Creating Your Account](https://help.superinstance.ai/kb001)
- [KB109: Two-Factor Authentication](https://help.superinstance.ai/kb109)
- [KB053: Browser Compatibility Guide](https://help.superinstance.ai/kb053)
- [KB069: Clearing Cache & Cookies](https://help.superinstance.ai/kb069)
- [KB110: Account Recovery Steps](https://help.superinstance.ai/kb110)

---

## Video Tutorial

[Login Issues & Password Reset - Video Guide](https://help.superinstance.ai/videos/kb064)

**Duration:** 4:15 minutes
**Languages:** Subtitles in all supported languages
**Topics Covered:**
- Password reset process
- Account unlock steps
- 2FA troubleshooting
- Browser cache clearing

---

## User Feedback

⭐⭐⭐⭐⭐ **"Quick and easy password reset process!"**
- User, 2026-03-14

⭐⭐⭐⭐⭐ **"The 2FA section saved me when I lost my phone."**
- Pro Subscriber, 2026-03-13

⭐⭐⭐⭐☆ **"Would be helpful to have live chat for login issues."**
- Free Tier User, 2026-03-12

---

**Was this article helpful?**
⭐⭐⭐⭐⭐ [Rate this article](https://help.superinstance.ai/rate/kb064)

**Found it helpful?** 3,456 users found this article helpful
**Rating:** 4.9/5 stars

---

**Article History:**
- **Created:** 2026-02-20
- **Last Updated:** 2026-03-15
- **Reviewed by:** Technical Support Team
- **Next Review:** 2026-06-15
