# Security Configuration Guide

## Overview
This project now uses environment variables for secure configuration management, protecting sensitive data like API endpoints from being hardcoded in source code.

## Environment Variables Setup

### Development Environment
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your development API endpoint:
   ```env
   VITE_API_BASE_URL=https://www.farishtey.in/api/
   ```

### Production Environment
1. Create a `.env.production` file or set environment variables in your hosting platform:
   ```env
   VITE_API_BASE_URL=https://your-production-api.com/api/
   ```

2. **IMPORTANT**: Never commit `.env` or `.env.production` to version control!

## Files Updated with Environment Variables

All API endpoints now use `import.meta.env.VITE_API_BASE_URL` instead of hardcoded URLs:

### Authentication
- ✅ `src/auth/signin.jsx`
- ✅ `src/auth/signup.jsx`

### Pages
- ✅ `src/pages/approval_dashboard.jsx`
- ✅ `src/pages/book_training.jsx`
- ✅ `src/pages/regis_cert.jsx`
- ✅ `src/pages/add_train.jsx`
- ✅ `src/pages/add_inst.jsx`
- ✅ `src/pages/SuperAdminApprovalDashboard.jsx`
- ✅ `src/pages/MyTrainingRequests.jsx`

### Components
- ✅ `src/components/Complete_Button.jsx`

## How It Works

### Vite Environment Variables
Vite exposes environment variables through `import.meta.env`:
- Variables prefixed with `VITE_` are accessible in client-side code
- Variables are statically replaced at build time
- Different `.env` files for different environments

### Example Usage
```javascript
// Before (Hardcoded - INSECURE)
const API_BASE_URL = "https://www.farishtey.in/api/";

// After (Environment Variable - SECURE)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
```

## Git Security

### Protected Files (.gitignore)
The following files are now excluded from version control:
```
.env
.env.local
.env.production
.env.production.local
.env.development.local
```

### Version Controlled Files
- ✅ `.env.example` - Template file (safe to commit)
- ✅ `.gitignore` - Protects sensitive files

## Deployment Checklist

### For Development
- [x] Copy `.env.example` to `.env`
- [x] Update `VITE_API_BASE_URL` with dev API endpoint
- [x] Run `npm run dev`

### For Production Build
- [x] Create `.env.production` with production API endpoint
- [x] Run `npm run build`
- [x] Deploy `dist/` folder to hosting service

### For Hosting Platforms

#### Netlify
Set environment variable in Netlify dashboard:
```
Key: VITE_API_BASE_URL
Value: https://your-production-api.com/api/
```

#### Vercel
Add environment variable in Vercel project settings:
```
Name: VITE_API_BASE_URL
Value: https://your-production-api.com/api/
```

#### Other Platforms
Check your hosting platform's documentation for setting environment variables during build time.

## Security Best Practices

### ✅ DO
- Use environment variables for all API endpoints
- Keep `.env` files out of version control
- Use different endpoints for dev/staging/production
- Document required environment variables in `.env.example`
- Regularly audit for hardcoded secrets

### ❌ DON'T
- Never commit `.env` files to Git
- Never hardcode API endpoints in source code
- Never share `.env` files in public channels
- Never expose sensitive keys in client-side code
- Never use the same credentials across environments

## Verification Commands

### Check for hardcoded URLs
```bash
# Should return only import.meta.env references
grep -r "farishtey.in" src/
```

### Verify environment variable is set
```bash
# Development
npm run dev
# Check browser console: console.log(import.meta.env.VITE_API_BASE_URL)
```

### Build verification
```bash
npm run build
# Check dist/assets/*.js files - URL should be replaced with actual value
```

## Troubleshooting

### Issue: API calls returning undefined URL
**Solution**: Ensure `.env` file exists and `VITE_API_BASE_URL` is set

### Issue: Environment variable not updating
**Solution**: Restart dev server (`npm run dev`) after changing `.env`

### Issue: Production build using wrong URL
**Solution**: Check `.env.production` file and hosting platform environment variables

## Additional Security Measures Implemented

### ✅ Console Log Cleanup
All sensitive data logging has been removed:
- No OTP logging
- No user data logging
- No API response logging
- No authentication token logging

### ✅ Role-Based Access Control
- Protected routes with `ProtectedRoute` component
- Role validation in `roleUtils.js`
- Unauthorized access handling

### ✅ Data Validation
- Form validation on client-side
- Error handling for API responses
- Input sanitization

## Support

For questions about security configuration:
1. Check this documentation
2. Review `.env.example` for required variables
3. Verify `.gitignore` is protecting sensitive files
4. Ensure environment variables are set correctly

---

**Last Updated**: November 12, 2025  
**Version**: 1.0.0  
**Security Level**: Production Ready ✅
