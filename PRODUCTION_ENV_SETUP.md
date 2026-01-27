# 🔐 Production Environment Setup Guide

## ✅ Current Status

**Development Environment**: All required variables configured!

```
Required: 2/2 ✅
Optional: 6/8 ⚠️
Total: 8/10 configured
```

---

## 📋 Environment Variables Checklist

### ✅ Required Variables (MUST HAVE)

| Variable | Status | Value | Purpose |
|----------|--------|-------|---------|
| `VITE_SUPABASE_URL` | ✅ Set | `https://ialxlykysbqyiejepzkx.supabase.co` | Database connection |
| `VITE_SUPABASE_ANON_KEY` | ✅ Set | `eyJhbGciOi...` (JWT) | Public API authentication |

### ⚠️ Optional Variables (Recommended for Production)

| Variable | Status | Purpose | Priority |
|----------|--------|---------|----------|
| `VITE_STRIPE_PUBLISHABLE_KEY` | ❌ Not Set | Payment processing | **High** |
| `VITE_SENTRY_DSN` | ❌ Not Set | Error tracking & monitoring | **High** |
| `VITE_GA_MEASUREMENT_ID` | ✅ Placeholder | Google Analytics tracking | Medium |
| `VITE_APP_URL` | ✅ Set | Production URL | Medium |
| `VITE_ENABLE_ANALYTICS` | ✅ Set | Enable/disable tracking | Low |
| `VITE_ENABLE_AI_CHAT` | ✅ Set | AI assistant feature | Low |
| `VITE_ENABLE_AR_PREVIEW` | ✅ Set | AR equipment preview | Low |
| `VITE_ENABLE_BIOMETRIC_AUTH` | ✅ Set | Biometric login | Low |

---

## 🚀 Production Deployment Checklist

### Step 1: Update URLs

```bash
# In your deployment platform (Vercel/Netlify)
VITE_APP_URL=https://islakayd.com  # Your actual domain
```

### Step 2: Enable Stripe Payments (High Priority)

1. **Get Stripe Keys**:
   - Login to: https://dashboard.stripe.com
   - Go to: Developers → API Keys
   - Copy your **Publishable key** (starts with `pk_live_...` for production)

2. **Add to Environment**:
   ```bash
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_actual_key_here
   ```

3. **Update Supabase Functions**:
   - Upload Stripe Secret Key to Supabase Edge Functions
   - Configure webhook endpoints

### Step 3: Enable Error Tracking (High Priority)

1. **Create Sentry Project**:
   - Signup at: https://sentry.io
   - Create new project → Select "React"
   - Copy your DSN

2. **Add to Environment**:
   ```bash
   VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/your-project-id
   ```

### Step 4: Configure Analytics (Medium Priority)

1. **Setup Google Analytics 4**:
   - Go to: https://analytics.google.com
   - Create property → Get Measurement ID
   - Copy ID (format: `G-XXXXXXXXXX`)

2. **Update Environment**:
   ```bash
   VITE_GA_MEASUREMENT_ID=G-YOUR-ACTUAL-ID
   VITE_ENABLE_ANALYTICS=true
   ```

### Step 5: Update Feature Flags

Review and set appropriate values for production:

```bash
# Production recommendations:
VITE_ENABLE_AI_CHAT=true           # Enable AI assistant
VITE_ENABLE_AR_PREVIEW=false       # Beta feature, keep disabled initially
VITE_ENABLE_BIOMETRIC_AUTH=false   # Beta feature, test first
```

---

## 🌐 Platform-Specific Setup

### Vercel Deployment

1. **Go to**: https://vercel.com/new

2. **Import Repository**: `shutyourole365/islakaydpro`

3. **Configure Environment Variables**:
   ```
   Project Settings → Environment Variables → Add New
   ```

4. **Add Each Variable**:
   - Copy from `.env.local`
   - Update URLs for production
   - Add Stripe/Sentry keys

5. **Deploy**: Click "Deploy"

### Netlify Deployment

1. **Go to**: https://app.netlify.com/start

2. **Connect Repository**: `shutyourole365/islakaydpro`

3. **Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`

4. **Environment Variables**:
   ```
   Site Settings → Environment Variables
   ```

5. **Deploy**: Click "Deploy site"

---

## 🔒 Security Best Practices

### ✅ DO:
- ✅ Use **live** Stripe keys in production (pk_live_...)
- ✅ Enable HTTPS for all production domains
- ✅ Rotate Supabase keys if compromised
- ✅ Set proper CORS policies in Supabase
- ✅ Enable Sentry for production error tracking
- ✅ Use environment-specific API keys (test vs live)

### ❌ DON'T:
- ❌ Commit `.env.local` to git (already in .gitignore)
- ❌ Use test Stripe keys in production
- ❌ Share API keys publicly
- ❌ Hard-code sensitive values in source code
- ❌ Use same database for dev and production

---

## 🧪 Testing Before Production

Run these checks before deploying:

```bash
# 1. Verify environment variables
node check-env.cjs

# 2. Build production bundle
npm run build

# 3. Preview production build
npm run preview

# 4. Run tests
npm test

# 5. Check for errors
npm run typecheck
npm run lint
```

---

## 📊 Monitoring Setup

### After Deployment:

1. **Sentry Dashboard**:
   - Monitor: https://sentry.io/organizations/your-org/issues/
   - Set up alerts for critical errors

2. **Google Analytics**:
   - Real-time: https://analytics.google.com/analytics/web/#/realtime
   - Track user behavior, conversions

3. **Supabase Dashboard**:
   - Database: https://app.supabase.com/project/ialxlykysbqyiejepzkx/editor
   - Logs: https://app.supabase.com/project/ialxlykysbqyiejepzkx/logs
   - Usage: Monitor API calls, storage

---

## 🆘 Troubleshooting

### "Supabase client not initialized"
**Solution**: Check `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set

### "Stripe is not defined"
**Solution**: Add `VITE_STRIPE_PUBLISHABLE_KEY` or disable payment features

### "Analytics not tracking"
**Solution**: 
1. Verify `VITE_GA_MEASUREMENT_ID` is correct
2. Set `VITE_ENABLE_ANALYTICS=true`
3. Check browser console for errors

### "Environment variable is undefined"
**Solution**: 
1. Ensure variable name starts with `VITE_`
2. Restart dev server after changing `.env.local`
3. Rebuild for production: `npm run build`

---

## 📝 Quick Copy-Paste Templates

### .env.local (Development)
```bash
# Supabase (Required)
VITE_SUPABASE_URL=https://ialxlykysbqyiejepzkx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Application
VITE_APP_URL=http://localhost:5173

# Stripe (Optional)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_test_key

# Analytics (Optional)
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_ENABLE_ANALYTICS=false

# Error Tracking (Optional)
VITE_SENTRY_DSN=https://your-sentry-dsn

# Feature Flags
VITE_ENABLE_AI_CHAT=true
VITE_ENABLE_AR_PREVIEW=false
VITE_ENABLE_BIOMETRIC_AUTH=false
```

### Production Environment (Vercel/Netlify)
```bash
# Supabase (Required)
VITE_SUPABASE_URL=https://ialxlykysbqyiejepzkx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Application (UPDATE THIS!)
VITE_APP_URL=https://islakayd.com

# Stripe (REQUIRED FOR PAYMENTS!)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key

# Analytics (RECOMMENDED!)
VITE_GA_MEASUREMENT_ID=G-YOUR-REAL-ID
VITE_ENABLE_ANALYTICS=true

# Error Tracking (RECOMMENDED!)
VITE_SENTRY_DSN=https://your-actual-sentry-dsn

# Feature Flags
VITE_ENABLE_AI_CHAT=true
VITE_ENABLE_AR_PREVIEW=false
VITE_ENABLE_BIOMETRIC_AUTH=false
```

---

## ✅ Final Checklist

Before going live, verify:

- [ ] All required environment variables set
- [ ] Stripe keys updated to **live** keys (pk_live_...)
- [ ] Sentry DSN configured for error tracking
- [ ] Google Analytics tracking verified
- [ ] `VITE_APP_URL` points to production domain
- [ ] Build succeeds: `npm run build`
- [ ] Tests pass: `npm test`
- [ ] TypeScript checks pass: `npm run typecheck`
- [ ] No console errors in production build
- [ ] Database connection works
- [ ] Payments process correctly (test mode first!)
- [ ] Analytics events fire correctly

---

## 🎉 Next Steps

Once environment is configured:

1. ✅ Commit any documentation changes
2. 🚀 Deploy to production platform
3. 🧪 Test all critical features
4. 📊 Monitor analytics & errors
5. 🔔 Set up alerts in Sentry

**Ready to deploy?** Type "4" to start production deployment!
