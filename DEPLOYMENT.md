# Deployment Guide

This guide covers deploying Islakayd to various platforms.

## Prerequisites

- Node.js 18+ installed
- Supabase account and project configured
- Environment variables configured
- Project builds successfully (`npm run build`)

## Table of Contents

- [Vercel Deployment](#vercel-deployment)
- [Netlify Deployment](#netlify-deployment)
- [AWS Amplify](#aws-amplify)
- [Docker Deployment](#docker-deployment)
- [Environment Variables](#environment-variables)
- [Post-Deployment Checklist](#post-deployment-checklist)

---

## Vercel Deployment

### Option 1: Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Option 2: Using GitHub Integration

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your GitHub repository
5. Configure environment variables (see below)
6. Click "Deploy"

### Vercel Configuration

Create `vercel.json`:

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

### Option 1: Using Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy

# Deploy to production
netlify deploy --prod
```

### Option 2: Using Git Integration

1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [netlify.com](https://netlify.com)
3. Click "Add new site"
4. Connect your repository
5. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Add environment variables
7. Click "Deploy site"

### Netlify Configuration

Create `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

---

## AWS Amplify

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
