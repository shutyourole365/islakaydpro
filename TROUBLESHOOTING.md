# 🔧 Troubleshooting Guide

## Common Issues & Quick Fixes

This guide helps you **solve problems fast** so you can get back to building your daughter's future. 💪

---

## 🚨 Startup Issues

### ❌ "Environment Validation Failed"

**Symptom:** Red error screen on app startup with configuration errors.

**Cause:** Missing or invalid environment variables.

**Fix:**
```bash
# 1. Check if .env.local exists
ls -la .env.local

# 2. If not, copy from example
cp .env.example .env.local

# 3. Edit with your credentials
code .env.local  # or nano .env.local

# 4. Ensure these are filled in:
VITE_SUPABASE_URL=https://your-actual-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-long-jwt-token

# 5. Restart dev server
npm run dev
```

**Verify Fix:** App should start without errors.

---

### ❌ "Cannot connect to database"

**Symptom:** Database queries fail with connection errors.

**Cause:** Invalid Supabase credentials or project paused.

**Fix:**
```bash
# 1. Check Supabase project status
# Visit: https://app.supabase.com/projects

# 2. Ensure project is active (not paused)
# Free tier pauses after 7 days of inactivity

# 3. Verify credentials are correct
# Dashboard → Settings → API
# Copy URL and anon key again

# 4. Update .env.local with correct values

# 5. Test connection
curl https://your-project.supabase.co/rest/v1/
```

**Verify Fix:** Should return API status, not 404.

---

### ❌ Build fails with TypeScript errors

**Symptom:** `npm run build` shows type errors.

**Cause:** Type mismatches or missing dependencies.

**Fix:**
```bash
# 1. Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# 2. Run type check
npm run typecheck

# 3. If specific errors, fix them one by one
# TypeScript errors show file:line:column

# 4. Try build again
npm run build
```

**Verify Fix:** Build completes without errors.

---

## 🔐 Authentication Issues

### ❌ Users can't sign up

**Symptom:** Signup button does nothing or shows error.

**Check:**
1. Browser console for errors (F12 → Console)
2. Supabase Auth settings (Dashboard → Authentication → Settings)
3. Email confirmation settings

**Fix:**
```typescript
// Check AuthContext.tsx signUp function
// Add console logging to debug
console.log('Attempting signup:', email);

// In Supabase Dashboard:
// 1. Authentication → Settings
// 2. Enable Email Confirmation (or disable for testing)
// 3. Check SMTP settings if emails not sending
```

---

### ❌ "Session expired" errors

**Symptom:** Users constantly logged out.

**Cause:** Token refresh issues or session storage problems.

**Fix:**
```typescript
// In supabase client configuration (lib/supabase.ts)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,  // Ensure this is true
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
```

---

## 💳 Payment Issues

### ❌ Stripe checkout not working

**Symptom:** Payment button does nothing or shows error.

**Check:**
```bash
# 1. Verify Stripe key is set
echo $VITE_STRIPE_PUBLIC_KEY

# 2. Check it starts with pk_test_ or pk_live_
# 3. Verify webhook endpoint in Stripe dashboard
```

**Fix:**
```bash
# Test Stripe connection
curl https://api.stripe.com/v1/products \
  -u your-secret-key:

# If 401 error, key is invalid
# Get new keys from: https://dashboard.stripe.com/apikeys
```

---

### ❌ Webhook events not received

**Symptom:** Bookings not updating after payment.

**Fix:**
```bash
# 1. Check webhook endpoint URL
# Stripe Dashboard → Developers → Webhooks
# Should be: https://your-project.supabase.co/functions/v1/stripe-webhook

# 2. Verify webhook secret in Supabase edge function
# Supabase Dashboard → Edge Functions → stripe-webhook → Secrets
# STRIPE_WEBHOOK_SECRET=whsec_...

# 3. Test webhook
# Use Stripe CLI:
stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook
```

---

## 📊 Analytics Not Working

### ❌ No data in Google Analytics

**Symptom:** GA4 dashboard shows no pageviews.

**Check:**
```javascript
// 1. Open browser console (F12)
// 2. Check for analytics errors

// 3. Verify analytics is initialized
// Should see: "Analytics initialized with ID: G-XXXXXXXXXX"

// 4. Check if events are firing
// Network tab → Filter "google-analytics.com"
```

**Fix:**
```bash
# 1. Verify measurement ID
# Google Analytics → Admin → Data Streams → View stream details
# Copy Measurement ID (G-XXXXXXXXXX)

# 2. Update .env.local
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_ENABLE_ANALYTICS=true

# 3. Restart dev server
npm run dev

# 4. Test in Real-Time view
# GA4 → Reports → Realtime
# Visit your site and watch for active users
```

---

## 🗺️ Map Not Loading

### ❌ Equipment map shows blank

**Symptom:** Map component shows loading spinner or blank area.

**Cause:** Leaflet CSS not loaded or equipment missing coordinates.

**Fix:**
```typescript
// 1. Verify equipment has lat/long
console.log(equipment.latitude, equipment.longitude);

// 2. Check Leaflet CSS import in EquipmentMap.tsx
import 'leaflet/dist/leaflet.css';

// 3. Ensure tiles load
// Open Network tab, look for tile requests to basemaps.cartocdn.com

// 4. Test with known coordinates
const testLocation = { lat: 40.7128, lng: -74.0060 }; // NYC
```

---

## 🐛 Performance Issues

### ❌ App is slow/laggy

**Symptoms:** Pages take long to load, interactions feel sluggish.

**Diagnose:**
```bash
# 1. Run Lighthouse audit
# Chrome DevTools → Lighthouse → Analyze

# 2. Check bundle size
npm run build
# Look for warnings about large chunks

# 3. Profile in React DevTools
# Install React DevTools extension
# Profiler → Record → Identify slow components
```

**Quick Fixes:**
```typescript
// 1. Add loading states for data fetching
const [isLoading, setIsLoading] = useState(true);

// 2. Implement pagination
const ITEMS_PER_PAGE = 20;

// 3. Optimize images
// Use WebP format, add lazy loading
<img src="..." loading="lazy" />

// 4. Memoize expensive calculations
const expensiveValue = useMemo(() => {
  return calculateExpensiveValue(data);
}, [data]);
```

---

## 🔍 Debugging Techniques

### Finding Errors

**Browser Console:**
```javascript
// Always check console first
F12 → Console tab

// Look for red errors
// Click to see file and line number
// Fix the root cause, not just the symptom
```

**Network Tab:**
```javascript
// Check API calls
F12 → Network tab

// Filter by:
// - XHR: AJAX requests
// - Fetch: Modern API calls
// - WS: WebSocket connections

// Click request to see:
// - Headers (request details)
// - Payload (data sent)
// - Response (data received)
// - Timing (performance)
```

**React DevTools:**
```javascript
// Install React DevTools extension

// Components tab:
// - Inspect component props/state
// - Find which component has the bug

// Profiler tab:
// - Record interactions
// - See which components render slowly
```

### Common Error Messages

**"Cannot read property '...' of undefined"**
```typescript
// Use optional chaining
user?.profile?.name  // Safe
user.profile.name    // Crashes if user is undefined
```

**"Failed to fetch"**
```typescript
// Network error or CORS issue
// Check:
// 1. API endpoint URL is correct
// 2. Server is running
// 3. CORS headers are set
// 4. Network connectivity
```

**"Hydration failed"**
```typescript
// Server/client HTML mismatch
// Common causes:
// 1. Using Date.now() or random values
// 2. Conditional rendering based on browser APIs
// 3. Third-party scripts modifying DOM

// Fix: Use useEffect for client-only code
useEffect(() => {
  // Client-side only code here
}, []);
```

---

## 📞 Getting Help

### Self-Help Resources

1. **Check Documentation First:**
   - [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Configuration
   - [ARCHITECTURE.md](./ARCHITECTURE.md) - How it works
   - [FILE_GUIDE.md](./FILE_GUIDE.md) - Code navigation

2. **Search Existing Issues:**
   - Check GitHub issues for similar problems
   - Many common issues already solved

3. **Check Service Status:**
   - Supabase: https://status.supabase.com/
   - Vercel: https://vercel-status.com/
   - Stripe: https://status.stripe.com/

### When to Ask for Help

Ask when you've:
- ✅ Read relevant documentation
- ✅ Checked console for errors
- ✅ Googled the error message
- ✅ Tried obvious fixes
- ✅ Been stuck for > 30 minutes

**Don't spend hours on something that could be fixed in 5 minutes with help!**

### How to Ask Good Questions

**Bad:** "It doesn't work"
**Good:** 
```
Title: Signup fails with "Invalid password" error

What I'm trying to do:
- Create new user account

What's happening:
- Click signup button
- Form submits but shows error: "Password should be at least 6 characters"
- Password is definitely 8+ characters

What I've tried:
- Checked password length (console.log)
- Verified validation function
- Tested with different passwords

Screenshots/Code:
[Attach screenshot and relevant code]

Environment:
- Browser: Chrome 120
- OS: macOS 14
- Node: v20.10.0
```

---

## ✅ Preventive Maintenance

### Weekly Checks (5 minutes)
- [ ] Run `npm audit` for security issues
- [ ] Check error count in Sentry
- [ ] Review failed API calls in Supabase logs
- [ ] Test critical user flows (signup, booking)

### Monthly Checks (30 minutes)
- [ ] Update dependencies (`npm outdated`, `npm update`)
- [ ] Review and close old issues
- [ ] Clean up test data in database
- [ ] Backup critical data
- [ ] Review performance metrics

### Quarterly Checks (2 hours)
- [ ] Full security audit
- [ ] Performance optimization
- [ ] Code quality review
- [ ] Update documentation
- [ ] Plan new features based on user feedback

---

## 🎯 Quick Reference

**Environment Issues:** Check `.env.local` → Restart server
**Database Issues:** Verify Supabase project is active → Check credentials
**Auth Issues:** Check Supabase Auth settings → Review browser console
**Payment Issues:** Verify Stripe keys → Check webhook endpoint
**Performance Issues:** Run Lighthouse → Optimize images/code
**Map Issues:** Check coordinates → Verify Leaflet CSS loaded

**Remember:** Most issues are configuration problems, not code bugs. Check environment variables first! 🔍

---

**You've got this! Every problem has a solution, and you're building something amazing for your daughter.** 💪❤️

---

Last Updated: 2024
