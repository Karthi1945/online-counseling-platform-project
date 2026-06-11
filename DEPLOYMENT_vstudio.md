# Deployment Guide: Cloudflare + Render

This guide explains how to deploy the Counselor & Client Platform to **Cloudflare Pages** (frontend) and **Render** (backend).

---

## 📋 Prerequisites

1. **Cloudflare Account**: [Sign up](https://dash.cloudflare.com/sign-up)
2. **Render Account**: [Sign up](https://dashboard.render.com/)
3. **GitHub Repository**: Push code to GitHub
4. **Node.js 18+**: For local building

---

## 🚀 Quick Setup

### Step 1: Frontend Deployment (Cloudflare Pages)

#### 1.1 Create Cloudflare Pages Project
```bash
# Option A: Via Cloudflare Dashboard
1. Go to https://dash.cloudflare.com/ → Pages
2. Click "Create a project"
3. Connect your GitHub repository
4. Select the repo and branch (main)
5. Set build settings:
   - Build command: npm run build
   - Build output directory: dist
   - Node.js version: 18
6. Click "Save and Deploy"
```

#### 1.2 Configure Environment Variables
In Cloudflare Pages dashboard:
```
Settings → Environment variables

Add:
- VITE_API_BASE_URL: https://counselor-platform-backend.onrender.com
```

#### 1.3 Get API Keys (for GitHub Actions)
In Cloudflare dashboard:
1. Go to Account Settings
2. Copy **Account ID** from Overview
3. Create API Token:
   - Go to API Tokens → Create Token
   - Use "Edit Cloudflare Workers" template
   - Copy the token

#### 1.4 Add GitHub Secrets
In your GitHub repo:
```
Settings → Secrets and variables → Actions → New repository secret

Add:
- CLOUDFLARE_API_TOKEN: <your-api-token>
- CLOUDFLARE_ACCOUNT_ID: <your-account-id>
```

---

### Step 2: Backend Deployment (Render)

#### 2.1 Create Render Web Service
```bash
# Option A: Via Render Dashboard
1. Go to https://dashboard.render.com/
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Set configuration:
   - Name: counselor-platform-backend
   - Environment: Node
   - Build command: npm install
   - Start command: npm start
   - Plan: Free (or Starter for production)
5. Click "Create Web Service"
```

#### 2.2 Configure Environment Variables
In Render dashboard:
```
Service → Environment

Add:
- NODE_ENV: production
- PORT: 3000
```

#### 2.3 Get API Keys (for GitHub Actions)
1. Go to Render Dashboard → Settings
2. Copy **Service ID** from URL (format: srv-xxxxxx)
3. Create API Key:
   - Account Settings → API Keys
   - Click "Create API Key"
   - Copy the key

#### 2.4 Add GitHub Secrets
In your GitHub repo settings, add:
```
- RENDER_SERVICE_ID: <your-service-id>
- RENDER_API_KEY: <your-api-key>
- SLACK_WEBHOOK: <optional-slack-webhook>
```

---

## 🔄 Deployment Workflows

### Automatic Deployment on Push
Both workflows are triggered automatically on push to `main`:

**Frontend** (deploy-frontend.yml):
- Triggers on changes to: `src/`, `index.html`, `package.json`, `vite.config.ts`
- Builds and deploys to Cloudflare Pages
- Posts preview link in PR comments

**Backend** (deploy-backend.yml):
- Triggers on changes to: `server.js`, `package.json`, `src/`
- Validates code
- Deploys to Render
- Sends Slack notification (optional)

### Manual Deployment
```bash
# Frontend
npm run build
# Then push to main branch, workflow handles the rest

# Backend
# Push to main branch, workflow handles the rest
# Or use Render dashboard to trigger manual deploy
```

---

## 📦 Local Build & Test

```bash
# Install dependencies
npm install

# Build frontend
npm run build

# Test frontend build
npm run preview

# Start backend locally
npm start
# Backend runs at http://localhost:3000
# Frontend serves from http://localhost:3000 in production mode
```

---

## 🌐 Access Your Deployment

After successful deployment:

- **Frontend**: https://counselor-client-platform.pages.dev
- **Backend API**: https://counselor-platform-backend.onrender.com/api
- **Health Check**: https://counselor-platform-backend.onrender.com/api/counselors

---

## 🔐 Security Best Practices

1. **Never commit secrets** - Use GitHub secrets for API keys
2. **Environment-specific configs** - Different URLs for dev/prod
3. **CORS Configuration** - Backend should allow frontend domain:
   ```javascript
   // Add to server.js if needed
   const cors = require('cors');
   app.use(cors({
     origin: 'https://counselor-client-platform.pages.dev',
     credentials: true
   }));
   ```
4. **Rate Limiting** - Consider adding rate limiting on Render
5. **Database** - Use persistent storage solution if needed (Render Postgres)

---

## 🛠️ Troubleshooting

### Frontend Build Fails
```bash
# Clean and rebuild
npm run clean
npm install
npm run build

# Check build logs in Cloudflare Pages dashboard
```

### Backend Not Starting
```bash
# Check Render logs: https://dashboard.render.com/ → Service → Logs
# Verify NODE_ENV and PORT environment variables
# Check that server.js listens on 0.0.0.0:PORT
```

### API Connection Issues
```bash
# Ensure VITE_API_BASE_URL is set correctly in Cloudflare
# Check CORS settings on backend
# Verify backend is running: curl https://counselor-platform-backend.onrender.com/api/counselors
```

### Deployment Stuck
```bash
# Force redeploy on Render:
# Dashboard → Service → Settings → Redeploy

# Force redeploy on Cloudflare Pages:
# Pages → Your Project → Deployments → Retry Deployment
```

---

## 📊 Monitoring

### Cloudflare Pages Analytics
- Dashboard → Pages → Your Project → Analytics
- Monitor build times, traffic, errors

### Render Logs
- Dashboard → Service → Logs
- Real-time backend logs
- Build and deployment logs

### GitHub Actions
- Repository → Actions
- View workflow runs
- Debug failed deployments

---

## 💡 Tips & Optimization

1. **Reduce Build Time**:
   - Cache dependencies in CI/CD
   - Minimize bundle size with code splitting
   - Use Node.js 18 cache layer

2. **Cost Optimization**:
   - Cloudflare Pages: Free tier includes unlimited builds
   - Render: Free tier has 1 project, limited resources
   - Consider upgrading to Starter for production

3. **Custom Domain**:
   - **Cloudflare**: Pages → Settings → Custom Domain
   - **Render**: Service → Settings → Custom Domain

4. **Performance**:
   - Enable caching on Cloudflare
   - Use Render Postgres for database needs
   - Monitor API response times

---

## 🔗 Resources

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Render Documentation](https://render.com/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

---

## ❓ FAQ

**Q: Can I use different backends for dev/prod?**
A: Yes, use environment variables. Set `VITE_API_BASE_URL` differently per environment.

**Q: What if Render goes down?**
A: Set up monitoring/alerts. Consider redundancy with another provider.

**Q: How do I rollback a deployment?**
A: Both platforms allow reverting to previous deployments via their dashboards.

**Q: Can I use a custom domain?**
A: Yes! Both Cloudflare and Render support custom domains (paid on some tiers).

---

Generated: 2026-06-09
