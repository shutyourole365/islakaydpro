# 🚀 Production Deployment Guide

**Status**: Ready to deploy! All prerequisites met. ✅

Your Islakayd application is production-ready and can be deployed in minutes.

## ⚡ Quick Deploy (Recommended)

### Deploy to Vercel - 1 Click! ⭐

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/shutyourole365/islakaydpro)

**Or manually**: https://vercel.com/new → Import `shutyourole365/islakaydpro`

### Deploy to Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/shutyourole365/islakaydpro)

---

## 📋 Pre-Deployment Checklist

Run these commands to verify everything is ready:

```bash
# 1. Check environment variables
node check-env.cjs

# 2. Run tests
npm test

# 3. Build for production
npm run build

# 4. TypeScript check
npm run typecheck
```

**Expected**: All checks pass ✅

---

## Table of Contents

- [Vercel Deployment (Recommended)](#vercel-deployment-recommended)
- [Netlify Deployment](#netlify-deployment)
- [Environment Variables Setup](#environment-variables-setup)
- [Post-Deployment Steps](#post-deployment-steps)
- [Custom Domain Configuration](#custom-domain-configuration)
- [Monitoring & Analytics](#monitoring--analytics)
- [Troubleshooting](#troubleshooting)
- [Rollback Procedure](#rollback-procedure)

---

## Vercel Deployment (Recommended)

### Why Vercel? ⭐
- **Fastest deployment**: 30 seconds from push to live
- **Zero config**: Automatically detects Vite
- **Preview URLs**: Every push gets a URL
- **Best DX**: CLI + dashboard both excellent

### Option 1: Using Vercel CLI (Fastest)

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# First deployment (staging)
vercel

# Deploy to production
vercel --prod
```

**Result**: Your app is live at `your-project.vercel.app` in ~30 seconds! 🚀

### Option 2: Using GitHub Integration

1. **Push code**: `git push origin main`
2. **Import project**: Visit [vercel.com/new](https://vercel.com/new)
3. **Select repository**: `shutyourole365/islakaydpro`
4. **Configure settings**:
   - Framework Preset: Vite ✅ (auto-detected)
   - Build Command: `npm run build` ✅ (auto-detected)
   - Output Directory: `dist` ✅ (auto-detected)
5. **Add environment variables** (click "Environment Variables" tab):
   ```
   VITE_SUPABASE_URL=https://ialxlykysbqyiejepzkx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   VITE_STRIPE_PUBLIC_KEY=pk_live_... (if using Stripe)
   VITE_ENABLE_ANALYTICS=true
   ```
6. **Click "Deploy"** 🚀

### Vercel Configuration (Already Created!)

The `vercel.json` file is already configured with:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

---

## Netlify Deployment

### Why Netlify? 🟢
- **Great free tier**: 100GB bandwidth/month
- **Powerful plugins**: Lighthouse, image optimization
- **Form handling**: Built-in form submissions
- **Functions**: Serverless functions included

### Option 1: Using Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# First deployment (preview)
netlify deploy

# Deploy to production
netlify deploy --prod
```

### Option 2: Using Git Integration

1. **Push code**: `git push origin main`
2. **Create site**: Visit [app.netlify.com/start](https://app.netlify.com/start)
3. **Connect repository**: Select `shutyourole365/islakaydpro`
4. **Configure settings**:
   - Build command: `npm run build` ✅
   - Publish directory: `dist` ✅
   - Node version: 20 ✅ (set in netlify.toml)
5. **Add environment variables**:
   ```
   VITE_SUPABASE_URL=https://ialxlykysbqyiejepzkx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   VITE_STRIPE_PUBLIC_KEY=pk_live_...
   VITE_ENABLE_ANALYTICS=true
   ```
6. **Click "Deploy site"** 🚀

### Netlify Configuration (Already Created!)

The `netlify.toml` file is already configured with:
- ✅ Build command: `npm run build`
- ✅ Publish directory: `dist`
- ✅ Node 20 specified
- ✅ SPA redirects configured
- ✅ Security headers set
- ✅ Lighthouse plugin for performance monitoring

---

## Post-Deployment Steps

### 1. Verify Deployment ✅

Visit your deployed URL and check:

```bash
# Test your deployment
curl https://your-app.vercel.app
curl https://your-app.netlify.app

# Should return your index.html with 200 status
```

### 2. Test Critical Paths

- [ ] Home page loads
- [ ] Search functionality works
- [ ] Equipment listings display
- [ ] Authentication works (sign up/in)
- [ ] Database connection works (check listings)
- [ ] AI Assistant responds

### 3. Configure Custom Domain (Optional)

**Vercel:**
```bash
vercel domains add your-domain.com
```
Then add DNS records as instructed.

**Netlify:**
Go to Site Settings → Domain Management → Add custom domain

### 4. Set Up Monitoring

**Add to your dashboard:**
- Vercel Analytics: Auto-enabled
- Netlify Analytics: Enable in site settings
- Sentry (if configured): Verify error tracking
- Google Analytics: Check events are tracked

### 5. Update Supabase Allowed URLs

1. Go to [Supabase Dashboard](https://app.supabase.co)
2. Navigate to: Authentication → URL Configuration
3. Add your production URLs:
   ```
   https://your-app.vercel.app
   https://your-app.netlify.app
   https://your-domain.com
   ```
4. Save changes

### 6. Test Environment Variables

```bash
# From your browser console on deployed site
console.log(import.meta.env.VITE_SUPABASE_URL)
// Should show: "https://ialxlykysbqyiejepzkx.supabase.co"

console.log(import.meta.env.VITE_ENABLE_ANALYTICS)
// Should show: "true"
```

---

## Troubleshooting

### Build Fails

**Error**: "Cannot find module"
```bash
# Solution: Ensure all dependencies are in package.json
npm install
npm run build
```

**Error**: "TypeScript errors"
```bash
# Solution: Fix TypeScript errors locally first
npm run typecheck
```

### Environment Variables Not Working

**Problem**: `import.meta.env.VITE_*` is undefined

**Solution**:
1. Check variable names start with `VITE_`
2. Verify variables are set in platform dashboard
3. Redeploy after adding variables

### 404 Errors on Refresh

**Problem**: Routes work on initial load but 404 on refresh

**Solution**: Ensure SPA redirects are configured
- Vercel: Check `vercel.json` has rewrite rules ✅ (already configured)
- Netlify: Check `netlify.toml` has redirects ✅ (already configured)

### Database Connection Issues

**Problem**: "Failed to fetch" or database errors

**Solution**:
1. Check Supabase URL is correct
2. Verify anon key is set
3. Add production URL to Supabase allowed URLs
4. Check RLS policies allow anonymous reads

### Performance Issues

**Problem**: Slow load times

**Solution**:
1. Check bundle size: `npm run build`
2. If main bundle > 500 kB, run Priority #5: Bundle Optimization
3. Enable compression on hosting platform
4. Use CDN for assets

---

## Rollback Procedure

### Vercel

**Instant rollback via Dashboard:**
1. Go to your project dashboard
2. Click "Deployments"
3. Find last working deployment
4. Click "..." → "Promote to Production"

**Via CLI:**
```bash
vercel rollback
```

### Netlify

**Via Dashboard:**
1. Go to Deploys
2. Find last working deploy
3. Click "Publish deploy"

**Via CLI:**
```bash
netlify deploy --prod --alias previous-working-deploy-id
```

---

## Advanced: AWS Amplify

For enterprise deployments with AWS infrastructure:

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Click "New app" → "Host web app"
3. Connect your repository
4. Configure build settings:
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: dist
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```
5. Add environment variables
6. Click "Save and deploy"

---

## Docker Deployment

### Dockerfile

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### nginx.conf

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

### Build and Run

```bash
# Build image
docker build -t islakayd .

# Run container
docker run -p 3000:80 islakayd

# Or use docker-compose
docker-compose up -d
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "3000:80"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```

---

## Environment Variables

All deployment platforms require these environment variables:

### Required Variables

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_APP_URL=https://your-domain.com
```

### Optional Variables

```bash
# Stripe Payments
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Analytics
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_PWA=true
VITE_ENABLE_AI_ASSISTANT=true

# Error Tracking
VITE_SENTRY_DSN=https://...@sentry.io/...
```

### Setting Environment Variables

#### Vercel
```bash
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
# ... add all variables
```

#### Netlify
```bash
netlify env:set VITE_SUPABASE_URL "https://..."
netlify env:set VITE_SUPABASE_ANON_KEY "..."
```

#### GitHub Actions
Add secrets in repository settings → Secrets and variables → Actions

---

## Post-Deployment Checklist

### 1. Verify Deployment

- [ ] Site loads correctly
- [ ] All pages are accessible
- [ ] Forms work properly
- [ ] Authentication works
- [ ] Database connections work
- [ ] Images load correctly
- [ ] PWA installs properly

### 2. Configure Domain

- [ ] Add custom domain
- [ ] Configure DNS records
- [ ] Enable HTTPS/SSL
- [ ] Set up www redirect
- [ ] Configure CORS if needed

### 3. Performance Optimization

- [ ] Enable CDN
- [ ] Configure caching headers
- [ ] Enable gzip compression
- [ ] Optimize images (use CDN)
- [ ] Run Lighthouse audit
- [ ] Check Core Web Vitals

### 4. Security

- [ ] Enable HTTPS
- [ ] Configure security headers
- [ ] Set up rate limiting
- [ ] Review RLS policies
- [ ] Enable 2FA for admin accounts
- [ ] Set up monitoring/alerts

### 5. Analytics & Monitoring

- [ ] Configure Google Analytics
- [ ] Set up error tracking (Sentry)
- [ ] Configure uptime monitoring
- [ ] Set up performance monitoring
- [ ] Enable log aggregation

### 6. SEO

- [ ] Submit sitemap to search engines
- [ ] Verify Google Search Console
- [ ] Add robots.txt
- [ ] Configure Open Graph tags
- [ ] Set up analytics tracking

---

## Troubleshooting

### Build Failures

**Issue**: Build fails with dependency errors
```bash
# Solution: Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Issue**: TypeScript errors during build
```bash
# Solution: Run type check locally
npm run typecheck
# Fix any errors, then rebuild
```

### Runtime Errors

**Issue**: Environment variables not loading
- Ensure variables are prefixed with `VITE_`
- Verify variables are set in deployment platform
- Rebuild after adding variables

**Issue**: API calls failing
- Check CORS configuration
- Verify API URLs are correct
- Check network tab for errors

### Performance Issues

**Issue**: Slow initial load
- Enable CDN
- Optimize images
- Enable code splitting
- Use caching headers

---

## Continuous Deployment

### GitHub Actions

The included `.github/workflows/ci.yml` automatically:
- Runs tests on every push
- Checks linting and types
- Builds the project
- Deploys to preview (PRs)
- Deploys to production (main branch)

### Automatic Previews

Both Vercel and Netlify provide automatic preview deployments for pull requests:
- Each PR gets a unique preview URL
- Changes are deployed automatically
- Easy to review before merging

---

## Rollback Strategy

### Vercel
```bash
# List deployments
vercel ls

# Rollback to previous
vercel rollback [deployment-url]
```

### Netlify
```bash
# Via CLI
netlify deploy --alias [previous-deploy-id]

# Or use the Netlify dashboard
```

### Docker
```bash
# Keep previous images tagged
docker tag islakayd:latest islakayd:previous
docker tag islakayd:new islakayd:latest

# Rollback
docker tag islakayd:previous islakayd:latest
docker-compose up -d
```

---

## Support

For deployment issues:
- Check [documentation](https://github.com/shutyourole365/islakaydpro)
- Open an [issue](https://github.com/shutyourole365/islakaydpro/issues)
- Contact support@islakayd.com

---

**Happy Deploying! 🚀**
