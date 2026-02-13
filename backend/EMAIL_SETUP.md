# Email Testing Setup

## Quick Setup with Mailtrap (Recommended)

1. **Sign up at Mailtrap** (Free)
   - Visit: https://mailtrap.io/register/signup
   - Create free account

2. **Get Credentials**
   - Go to: https://mailtrap.io/inboxes
   - Click on your inbox
   - Find "SMTP Settings"
   - Copy Username and Password

3. **Update `.env` file**
   ```env
   # For Mailtrap Testing
   MAILTRAP_USER=your_mailtrap_username
   MAILTRAP_PASS=your_mailtrap_password
   ```

4. **Restart server**
   ```bash
   npm run server
   ```

## Alternative: Gmail App Password

If you prefer Gmail:

1. Enable 2FA: https://myaccount.google.com/security
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Update `.env`:
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-16-char-app-password
   ```

## Test the Email

Use the forgot password feature:
- Go to candidate/recruiter login
- Click "Forgot Password?"
- Enter email
- Check Mailtrap inbox or server console for OTP
