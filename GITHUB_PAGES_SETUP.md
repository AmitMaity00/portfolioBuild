# GitHub Pages Deployment - Setup Guide

## 🚀 Overview

This guide walks you through setting up GitHub Pages deployment for your Portfolio Builder application. Users can now connect their GitHub account and deploy their portfolios directly to GitHub Pages with one click.

---

## 📋 Prerequisites

- Portfolio Builder application running
- Node.js and npm installed
- GitHub account

---

## 🔧 Step 1: Environment Variables Configuration

### 1.1 GitHub OAuth App Setup

First, create a GitHub OAuth application:

1. Go to **GitHub Settings** → **Developer settings** → **OAuth apps**
   - URL: https://github.com/settings/developers

2. Click **New OAuth App** and fill in:
   - **Application name:** `Portfolio Builder`
   - **Homepage URL:** `http://localhost:3000` (dev) or your production URL
   - **Authorization callback URL:** `http://localhost:3000/api/github/callback` (dev)
   
3. Copy the **Client ID** and **Client Secret**

### 1.2 Update `.env.local`

Add these variables to your `frontend/.env.local`:

```env
# GitHub OAuth Configuration
NEXT_PUBLIC_GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Encryption Key (change this in production!)
ENCRYPTION_KEY=your-encryption-key-32-characters-long-!!!
```

⚠️ **Production Security:**
- Use a secure encryption key (32+ characters)
- Store secrets in your deployment provider's environment variables
- Never commit `.env.local` to version control

---

## 📦 Step 2: Install Dependencies

Run the following in your frontend directory:

```bash
cd frontend
npm install axios react-hot-toast
```

These packages are required:
- **axios**: For GitHub API requests
- **react-hot-toast**: For user notifications

---

## 🗄️ Step 3: Database Schema Update

The database schema has been updated to include GitHub connection fields:

```typescript
github: {
  connected: boolean;
  username: string;
  accessToken: string;  // Encrypted
  deployedUrl: string;
  repositoryName: string;
  deployedAt: Date;
}
```

**If using Supabase/PostgreSQL**, run migrations to add this field to the `user_portfolios` table:

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
```

---

## 🔐 Step 4: Security Implementation

### Token Encryption

GitHub access tokens are automatically encrypted before being stored in the database using `aes-256-gcm`:

```typescript
// Encrypting (automatic in /api/github/connect)
const encryptedToken = encrypt(accessToken);

// Decrypting (automatic in /api/github/deploy)
const decryptedToken = decrypt(encryptedToken);
```

**Key Features:**
- ✅ Tokens never exposed in logs or frontend
- ✅ Each token uses a unique IV (initialization vector)
- ✅ GCM mode ensures data authenticity
- ✅ Tokens decrypted only when needed for deployments

---

## 🎯 Step 5: API Endpoints Reference

### Authentication & Connection

#### `POST /api/github/callback`
Exchanges OAuth code for access token.

**Request:**
```json
{
  "code": "github-oauth-code"
}
```

**Response:**
```json
{
  "success": true,
  "accessToken": "ghu_xxxxxxxx",
  "githubUsername": "usernamehere"
}
```

#### `POST /api/github/connect`
Stores GitHub credentials in database.

**Request:**
```json
{
  "accessToken": "ghu_xxxxxxxx",
  "githubUsername": "usernamehere"
}
```

**Response:**
```json
{
  "success": true,
  "message": "GitHub connected successfully"
}
```

#### `GET /api/github/connect`
Retrieves GitHub connection status.

**Response:**
```json
{
  "connected": true,
  "username": "usernamehere",
  "deployedUrl": "https://usernamehere.github.io/username-portfolio-builder/",
  "repositoryName": "username-portfolio-builder"
}
```

#### `DELETE /api/github/connect`
Disconnects GitHub account.

**Response:**
```json
{
  "success": true,
  "message": "GitHub disconnected"
}
```

### Deployment

#### `POST /api/github/deploy`
Deploys portfolio to GitHub Pages.

**Request:**
```json
{
  "htmlContent": "<!DOCTYPE html>...",
  "cssContent": "body { ... }",
  "jsContent": "console.log(...)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Portfolio deployed successfully!",
  "deployedUrl": "https://usernamehere.github.io/username-portfolio-builder/",
  "repositoryName": "username-portfolio-builder"
}
```

#### `GET /api/github/deploy`
Gets current deployment status.

**Response:**
```json
{
  "deployed": true,
  "deployedUrl": "https://usernamehere.github.io/username-portfolio-builder/",
  "repositoryName": "username-portfolio-builder",
  "deployedAt": "2024-03-29T10:30:00Z"
}
```

---

## 🧩 Step 6: Frontend Components

### GitHubConnect Component
Located in `components/GitHubConnect.tsx`

**Features:**
- OAuth flow handling
- Connection status display
- Quick connect/disconnect buttons
- Shows deployed URL when available

**Usage:**
```tsx
<GitHubConnect />
```

### DeployButton Component
Located in `components/DeployButton.tsx`

**Features:**
- One-click deployment
- Loading state with spinner
- Success messaging
- Error handling with toast notifications

**Usage:**
```tsx
<DeployButton
  htmlContent={portfolioHTML}
  cssContent={portfolioCSS}
  jsContent={portfolioJS}
  onSuccess={(url) => console.log('Deployed to:', url)}
  disabled={false}
/>
```

### ToastProvider Component
Located in `components/ToastProvider.tsx`

Provides notification toasts throughout the app.

---

## 🎨 Step 7: Dashboard Integration

The **Deploy & Publish** tab in the dashboard includes:

1. **GitHub Connection Section**
   - Connect/Disconnect button
   - Current connection status
   - GitHub username display

2. **Launch Site Section**
   - Repository naming information
   - Deployment button
   - Success/deployed URL display

**Generated Repository Names:**
```
Format: {username}-portfolio-builder
Examples:
  john-portfolio-builder
  sarah-portfolio-builder
  developer123-portfolio-builder
```

---

## 🚀 Step 8: Testing the Feature

### Local Testing

1. **Start the dev server:**
   ```bash
   cd frontend
   npm run dev
   ```

2. **Navigate to Dashboard:**
   - Click "Deploy & Publish" tab
   - Click "Connect GitHub" button
   - Authorize the OAuth app

3. **Deploy Portfolio:**
   - Click "Launch Site" button
   - Wait for deployment to complete
   - Test the deployed URL

### What Gets Deployed

The deployment includes:
- `index.html` - Main portfolio page
- `style.css` - Styling (if available)
- `script.js` - JavaScript interactions (if available)

---

## 🔍 Repository Structure After Deployment

```
username-portfolio-builder/
├── index.html
├── style.css
└── script.js
```

GitHub Pages automatically serves `index.html` from the root directory.

---

## ⚙️ GitHub Pages Configuration

**Automatic Configuration:**
The deploy endpoint automatically:

1. ✅ Creates the repository (public)
2. ✅ Uploads files to the `main` branch
3. ✅ Enables GitHub Pages on the `main` branch
4. ✅ Sets root folder (`/`) as the source
5. ✅ Returns the deployment URL

**Manual Configuration (if needed):**

Go to your repository → **Settings** → **Pages**:
- Source: `Deploy from a branch`
- Branch: `main`
- Folder: `/ (root)`

---

## 📊 Database Schema

### user_portfolios Table

```typescript
interface UserPortfolio {
  // ... existing fields ...
  
  // GitHub Deployment
  github: {
    connected: boolean;              // Connection status
    username: string;                // GitHub username
    accessToken: string;             // Encrypted OAuth token
    deployedUrl: string;             // GitHub Pages URL
    repositoryName: string;          // GitHub repo name
    deployedAt: Date | null;         // Last deployment time
  };
}
```

**Example Record:**
```json
{
  "connected": true,
  "username": "john-developer",
  "accessToken": "a3f1:b2e4:c9d8e7f6g5h4...",
  "deployedUrl": "https://john-developer.github.io/john-portfolio-builder/",
  "repositoryName": "john-portfolio-builder",
  "deployedAt": "2024-03-29T15:30:00Z"
}
```

---

## 🛡️ Error Handling

### Common Errors & Solutions

#### "GitHub not connected"
- Click "Connect GitHub" first
- Authorize the OAuth app
- Refresh the page

#### "Repository already exists"
- The app automatically handles this
- Existing repo files are updated
- No error is thrown to the user

#### "Token decryption failed"
- Encryption key mismatch
- Regenerate token by reconnecting GitHub

#### "GitHub rate limit exceeded"
- GitHub allows 60 requests/hour (unauthenticated)
- 5,000 requests/hour (authenticated)
- Wait an hour or use a different account

---

## 🔄 Updating Deployed Portfolio

After editing your portfolio in the designer:

1. Go to **Dashboard** → **Deploy & Publish**
2. Ensure GitHub is connected
3. Click **"Launch Site"** button
4. Your deployed portfolio updates automatically

**Note:** GitHub may take 5-10 seconds to refresh the changes.

---

## 🗑️ Deleting Deployments

To delete your deployed portfolio:

1. Visit your GitHub repository: `https://github.com/{username}/{repo-name}`
2. Go to **Settings** → **Danger Zone** → **Delete this repository**
3. Confirm deletion

Or use the **Disconnect GitHub** button:
- Removes connection from Portfolio Builder
- Doesn't delete the repository on GitHub

---

## 📱 Multiple Deployments

Currently, each user can have **one active deployment** per GitHub account.

**To maintain multiple versions:**
1. Create multiple GitHub repositories manually
2. Follow the same structure: `index.html`, `style.css`, `script.js`
3. Connect to GitHub Pages for each repository separately

---

## 🔒 Production Deployment Checklist

- [ ] Update `.env.local` with production GitHub OAuth credentials
- [ ] Use a strong, unique `ENCRYPTION_KEY` (32+ characters, random)
- [ ] Enable HTTPS on your domain
- [ ] Test OAuth flow with production URLs
- [ ] Update GitHub OAuth callback URL to production domain
- [ ] Run database migrations on production
- [ ] Test full deployment flow end-to-end
- [ ] Set up monitoring for deployment failures
- [ ] Document custom encryption key for team


---

## 🐛 Troubleshooting

### Issue: OAuth shows "Invalid redirect URI"

**Solution:**
1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Edit your app
3. Update "Authorization callback URL" to match your domain:
   - Dev: `http://localhost:3000/api/github/callback`
   - Prod: `https://yourdomain.com/api/github/callback`

### Issue: Files not appearing on GitHub Pages

**Solution:**
1. Check repository is public (not private)
2. Verify files exist in the `main` branch
3. Wait 5-10 seconds before refreshing
4. Check GitHub Pages settings: Settings → Pages → Source should be `main` and `/ (root)`

### Issue: "Cannot find module encryption"

**Solution:**
1. Verify `frontend/lib/encryption.ts` exists
2. Clear node_modules: `rm -rf node_modules && npm install`
3. Restart dev server

---

## 📚 Files Changed/Created

### New Files:
- `/lib/encryption.ts` - Token encryption utilities
- `/lib/githubService.ts` - GitHub API client
- `/components/GitHubConnect.tsx` - Connection UI
- `/components/DeployButton.tsx` - Deploy UI
- `/components/ToastProvider.tsx` - Notifications
- `/app/api/github/callback/route.ts` - OAuth callback
- `/app/api/github/connect/route.ts` - Connection management
- `/app/api/github/deploy/route.ts` - Deployment logic

### Modified Files:
- `/app/layout.tsx` - Added ToastProvider
- `/app/dashboard/page.tsx` - Added deploy tab and components
- `/backend/models/UserPortfolio.ts` - Added GitHub schema
- `/package.json` - Added axios and react-hot-toast

---

## ✅ Verification Steps

1. **Environment Variables:**
   ```bash
   echo $NEXT_PUBLIC_GITHUB_CLIENT_ID  # Should show your Client ID
   ```

2. **Dependencies:**
   ```bash
   npm list axios react-hot-toast  # Should show installed packages
   ```

3. **File Structure:**
   ```bash
   ls -la frontend/lib/encryption.ts
   ls -la frontend/lib/githubService.ts
   ls -la frontend/components/GitHubConnect.tsx
   ```

4. **Test Connection:**
   - Open Dashboard
   - Click Deploy & Publish tab
   - Verify "Connect GitHub" button appears
   - Click it and complete OAuth flow

---

## 📞 Support

For issues or questions:

1. Check the troubleshooting section above
2. Review error messages in browser console (F12)
3. Check GitHub API rate limits: https://api.github.com/rate_limit
4. Review GitHub OAuth documentation: https://docs.github.com/en/developers/apps

---

## 🎉 You're All Set!

Your Portfolio Builder now supports GitHub Pages deployment!

**Next Steps:**
1. Test the feature locally
2. Deploy to production
3. Share with users
4. Monitor for issues

Happy building! 🚀
