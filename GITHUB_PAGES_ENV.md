# GitHub Pages Deployment - Environment Variables & Quick Reference

## 🔐 Required Environment Variables

Add these to your `frontend/.env.local`:

```env
# =============================
# GitHub OAuth Configuration
# =============================
NEXT_PUBLIC_GITHUB_CLIENT_ID=your-github-client-id-here
GITHUB_CLIENT_SECRET=your-github-client-secret-here

# =============================
# Token Encryption Key
# =============================
# Generate a random 32+ character string
# Example: openssl rand -hex 16
ENCRYPTION_KEY=your-32-character-encryption-key-here

# =============================
# Existing Environment Variables
# =============================
# (Keep all your existing variables)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
GEMINI_API_KEY=...
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

## 🔑 How to Get GitHub OAuth Credentials

### Step 1: Create GitHub OAuth App
1. Go to: https://github.com/settings/developers
2. Click **New OAuth App**
3. Fill in the form:
   - **Application name:** Portfolio Builder
   - **Homepage URL:** `http://localhost:3000` (dev) or your production URL
   - **Authorization callback URL:** `http://localhost:3000/api/github/callback`

### Step 2: Copy Credentials
1. Copy **Client ID** → Set as `NEXT_PUBLIC_GITHUB_CLIENT_ID`
2. Click **Generate a new client secret** → Copy it → Set as `GITHUB_CLIENT_SECRET`

### Step 3: Update for Production
When deploying to production:
- Change Homepage URL to your production domain
- Change callback URL to: `https://yourdomain.com/api/github/callback`

## 🔑 Generate Encryption Key

Run one of these commands to generate a strong encryption key:

### macOS/Linux:
```bash
openssl rand -hex 16  # Generates 32-character hex string
# or
python3 -c "import secrets; print(secrets.token_hex(16))"
```

### Windows PowerShell:
```powershell
[Convert]::ToHexString([byte[]][Security.Cryptography.RNGCryptoServiceProvider]::new().GetBytes(16))
```

### Online Generator:
https://www.browserling.com/tools/random-hex

⚠️ **Production Note:** Use a strong, random key and store it securely in your deployment provider's secret manager.

## 📦 Dependencies to Install

```bash
cd frontend
npm install axios react-hot-toast
```

| Package | Version | Purpose |
|---------|---------|---------|
| axios | ^1.6.0 | HTTP requests to GitHub API |
| react-hot-toast | ^2.4.0 | Toast notifications |

## 🗄️ Database Migration (if using Postgres)

If you're using Supabase or PostGreSQL, add this column to `user_portfolios` table:

```sql
ALTER TABLE user_portfolios
ADD COLUMN github JSONB DEFAULT '{
  "connected": false,
  "username": "",
  "accessToken": "",
  "deployedUrl": "",
  "repositoryName": "",
  "deployedAt": null
}'::jsonb;

-- If column already exists, you can update it:
-- ALTER TABLE user_portfolios ALTER COLUMN github SET DEFAULT '{"connected": false, ...}'::jsonb;
```

## 📋 Checklist Before Going Live

### Development Setup
- [ ] Created GitHub OAuth app
- [ ] Added `NEXT_PUBLIC_GITHUB_CLIENT_ID` to `.env.local`
- [ ] Added `GITHUB_CLIENT_SECRET` to `.env.local`
- [ ] Generated and added `ENCRYPTION_KEY` to `.env.local`
- [ ] Ran `npm install` to get axios and react-hot-toast
- [ ] Database schema updated (if using Postgres)
- [ ] All files created in correct locations
- [ ] DNS resolves for localhost

### Testing
- [ ] Dev server runs: `npm run dev`
- [ ] Dashboard page loads
- [ ] "Deploy & Publish" tab visible
- [ ] GitHub connect button works
- [ ] OAuth flow completes
- [ ] Deployment button works
- [ ] Deployed URL accessible
- [ ] Toast notifications appear

### Production Deployment
- [ ] Updated GitHub OAuth app callback URL
- [ ] Created production GitHub OAuth app (if needed)
- [ ] Set production environment variables in deployment platform
- [ ] Database migrated for GitHub schema
- [ ] Tested OAuth flow on production domain
- [ ] Tested deploy with production credentials
- [ ] Monitored for errors in first week

## 🚀 Quick Start Commands

```bash
# 1. Install dependencies
cd frontend
npm install axios react-hot-toast

# 2. Add environment variables
# Edit frontend/.env.local and add the GitHub variables

# 3. Start development server
npm run dev

# 4. Test in browser
# Navigate to http://localhost:3000/dashboard
# Click "Deploy & Publish" tab
# Click "Connect GitHub"

# 5. Deploy portfolio
# After connecting, click "Launch Site"
```

## 🔍 Verification Commands

```bash
# Check if env vars are loaded
node -e "console.log(process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID)"

# Check Node version (should be 18+)
node --version

# Check npm packages installed
npm list axios react-hot-toast

# Test GitHub API connection
curl -H "Authorization: Bearer YOUR_TOKEN" https://api.github.com/user
```

## 📊 API Response Examples

### Successful Deployment
```json
{
  "success": true,
  "message": "Portfolio deployed successfully!",
  "deployedUrl": "https://username.github.io/username-portfolio-builder/",
  "repositoryName": "username-portfolio-builder"
}
```

### Connection Status
```json
{
  "connected": true,
  "username": "octocat",
  "deployedUrl": "https://octocat.github.io/octocat-portfolio-builder/",
  "repositoryName": "octocat-portfolio-builder"
}
```

## 🛑 Common Issues & Quick Fixes

| Issue | Solution |
|-------|----------|
| `GITHUB_CLIENT_SECRET is undefined` | Add to `.env.local` not `.env.example` |
| OAuth redirect fails | Check callback URL matches GitHub app settings |
| Deployment fails | Verify token was stored (check DB) |
| Token decryption fails | Check `ENCRYPTION_KEY` is correct |
| Files not on GitHub Pages | Wait 10 seconds, check repo is public |
| Module not found: encryption | Run `npm install` again, check file path |

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `GITHUB_PAGES_SETUP.md` | Complete setup guide |
| `GITHUB_PAGES_ENV.md` | This file - env variables info |
| `README.md` | Project overview |

## 🔗 Useful Links

- [GitHub OAuth Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [GitHub Pages Docs](https://docs.github.io/)
- [GitHub REST API Clients](https://docs.github.com/en/rest)
- [Encryption Best Practices](https://nodejs.org/en/knowledge/file-system/security/introduction/)

## ✅ Feature Complete!

Your Portfolio Builder now supports GitHub Pages deployment with:
- ✅ OAuth authentication
- ✅ Encrypted token storage
- ✅ One-click deployment
- ✅ GitHub Pages configuration
- ✅ Error handling
- ✅ User notifications

---

**Questions or issues?** Check the troubleshooting section in `GITHUB_PAGES_SETUP.md` or refer to the documentation links above.
