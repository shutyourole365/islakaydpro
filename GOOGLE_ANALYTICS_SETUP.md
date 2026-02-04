# 🔍 Google Analytics 4 - Complete Setup Guide

## ⚡ Quick Setup (10 minutes)

### Step 1: Create GA4 Account (3 minutes)

1. **Go to Google Analytics**
   ```
   https://analytics.google.com
   ```

2. **Sign in** with your Google account

3. **Click "Start measuring"**

4. **Create Account:**
   - Account name: `Islakayd` (or your preferred name)
   - Account data sharing: ✅ Check recommended options
   - Click "Next"

5. **Create Property:**
   - Property name: `Islakayd Platform`
   - Reporting time zone: Select your timezone
   - Currency: USD (or your currency)
   - Click "Next"

6. **Business Details:**
   - Industry: `Other`
   - Business size: Select your size
   - Click "Next"

7. **Business Objectives:**
   - ✅ Generate leads
   - ✅ Examine user behavior
   - Click "Create"

8. **Accept Terms of Service**

### Step 2: Set Up Web Stream (2 minutes)

1. **Select Platform:** Click "Web"

2. **Add Stream Details:**
   ```
   Website URL: https://your-domain.vercel.app
   Stream name: Islakayd Web
   ```
   
3. **Click "Create stream"**

4. **Copy Your Measurement ID**
   - Looks like: `G-XXXXXXXXXX`
   - You'll see it at the top right
   - **SAVE THIS!**

### Step 3: Add to Vercel (3 minutes)

```bash
# Navigate to your project
cd /workspaces/islakaydpro

# Add environment variables to Vercel
vercel env add VITE_GA_MEASUREMENT_ID

# When prompted, paste your Measurement ID: G-XXXXXXXXXX
# Select: Production, Preview, Development

# Enable analytics
vercel env add VITE_ENABLE_ANALYTICS

# When prompted, enter: true
# Select: Production, Preview, Development

# Redeploy to apply changes
vercel --prod
```

### Step 4: Verify It Works (2 minutes)

1. **Visit your production site**
   ```
   https://your-domain.vercel.app
   ```

2. **Open Chrome DevTools**
   - Press `F12` or `Cmd+Option+I` (Mac)
   - Go to **Network** tab
   - Filter by: `google-analytics`

3. **Browse your site**
   - Click around
   - You should see requests to:
     - `google-analytics.com/g/collect`
     - `analytics.google.com`

4. **Check Real-Time in GA4**
   - Go back to Google Analytics
   - Click "Reports" → "Realtime"
   - You should see yourself as an active user! 🎉

---

## 📊 Events Already Tracked

Your app automatically tracks these events (configured in `src/services/analytics.ts`):

### Page Views
- Automatic on every route change
- Tracks page title and URL

### User Actions
```javascript
// Sign Up
event: 'sign_up'
parameters: { method: 'email' | 'google' }

// Login
event: 'login'
parameters: { method: 'email' | 'google' }

// Equipment View
event: 'view_item'
parameters: { 
  item_id: equipmentId,
  item_name: equipmentTitle,
  item_category: categoryName
}

// Search
event: 'search'
parameters: { 
  search_term: query,
  result_count: numberOfResults
}

// Booking
event: 'purchase'
parameters: { 
  transaction_id: bookingId,
  value: totalAmount,
  currency: 'USD'
}

// Error
event: 'exception'
parameters: { 
  description: errorMessage,
  fatal: boolean
}
```

---

## 🎯 Custom Events You Can Add

### Add to Favorites
```typescript
import { analytics } from './services/analytics';

analytics.event('add_to_wishlist', {
  item_id: equipmentId,
  item_name: equipmentTitle,
  value: dailyRate
});
```

### Start Booking Flow
```typescript
analytics.event('begin_checkout', {
  item_id: equipmentId,
  value: totalAmount,
  currency: 'USD'
});
```

### Message Owner
```typescript
analytics.event('contact', {
  method: 'message',
  item_id: equipmentId
});
```

### Share Equipment
```typescript
analytics.event('share', {
  method: 'link',
  item_id: equipmentId,
  content_type: 'equipment'
});
```

---

## 📈 Key Metrics to Monitor

### Daily Checks
- **Active users** (Realtime report)
- **New signups** (User acquisition)
- **Bookings** (Conversions)
- **Page views** (Engagement)

### Weekly Reviews
- **User retention** (7-day, 30-day)
- **Conversion funnel:**
  1. Visit homepage
  2. Browse equipment
  3. View equipment detail
  4. Start booking
  5. Complete booking
- **Top equipment categories**
- **Geographic distribution**

### Monthly Analysis
- **Revenue trends**
- **User cohorts**
- **Device breakdown** (mobile vs desktop)
- **Traffic sources** (organic, social, direct, referral)

---

## 🎨 Custom Dashboard Setup

### Create Funnel Report

1. **Go to:** Explore → Create New Exploration
2. **Select:** Funnel exploration
3. **Add Steps:**
   ```
   Step 1: page_view (homepage)
   Step 2: search
   Step 3: view_item
   Step 4: begin_checkout (if you add this event)
   Step 5: purchase
   ```
4. **Save as:** "Booking Conversion Funnel"

### Create Equipment Performance Report

1. **Go to:** Explore → Create New Exploration
2. **Select:** Free form
3. **Dimensions:** 
   - Item name
   - Item category
4. **Metrics:**
   - Item views
   - Item revenue
5. **Save as:** "Equipment Performance"

---

## 🔍 Troubleshooting

### Not Seeing Data?

**Check Environment Variables:**
```bash
vercel env ls

# Should show:
# VITE_GA_MEASUREMENT_ID (Production, Preview, Development)
# VITE_ENABLE_ANALYTICS (Production, Preview, Development)
```

**Verify in Browser Console:**
```javascript
// Open console on your site
// Type:
window.gtag

// Should return a function, not undefined
```

**Check Analytics Service:**
```typescript
// In src/services/analytics.ts
console.log('GA Enabled:', import.meta.env.VITE_ENABLE_ANALYTICS);
console.log('GA ID:', import.meta.env.VITE_GA_MEASUREMENT_ID);
```

### Data Delayed?

- GA4 can take **24-48 hours** for historical reports
- **Realtime** reports show data within seconds
- **Exploration** reports update within 4 hours

### Ad Blockers

- About 30% of users have ad blockers
- They block Google Analytics
- This is normal - your actual traffic is ~30% higher

---

## 🚀 Advanced Setup (Optional)

### Enable Enhanced Measurement

In GA4 Property Settings:
- ✅ Page views (already on)
- ✅ Scrolls (useful!)
- ✅ Outbound clicks
- ✅ Site search (if you use ?q= in URLs)
- ✅ Video engagement
- ✅ File downloads

### Set Up Conversions

1. **Go to:** Admin → Events
2. **Find these events:**
   - `sign_up`
   - `purchase`
3. **Toggle "Mark as conversion"** ✅

### Connect Google Ads (for marketing)

1. **Go to:** Admin → Product links
2. **Click:** Link Google Ads
3. **Follow prompts** to connect account
4. **Use for remarketing campaigns**

### Set Up Custom Audiences

Create audiences for:
- **High-intent users:** Viewed 3+ equipment in 1 session
- **Abandoned bookings:** Started checkout but didn't complete
- **Power users:** 5+ sessions in 30 days
- **Equipment owners:** Visited "list equipment" page

---

## 📱 Mobile App Tracking (PWA)

Your PWA automatically tracks:
- Install prompts shown
- PWA installs (via `appinstalled` event)
- Offline usage attempts

To track PWA installs:
```typescript
// Already configured in src/components/pwa/InstallPrompt.tsx
window.addEventListener('appinstalled', () => {
  analytics.event('pwa_install', {
    platform: 'web'
  });
});
```

---

## 🎯 Success Benchmarks

### Week 1 Targets:
- 50+ page views/day
- 10+ unique users/day
- 5%+ signup conversion rate
- 2+ bookings/day

### Month 1 Targets:
- 1,000+ page views/week
- 100+ unique users/week
- 50+ total signups
- 20+ completed bookings

### Month 3 Targets:
- 5,000+ page views/week
- 500+ unique users/week
- 300+ total signups
- 100+ completed bookings
- $5,000+ booking value

---

## 📊 Weekly Report Template

Copy this for your weekly check-ins:

```markdown
# Week [X] Analytics Report

## Overview
- Active Users: [number]
- New Signups: [number]
- Bookings: [number]
- Revenue: $[amount]

## Top Performers
1. [Equipment name] - [views] views, [bookings] bookings
2. [Equipment name] - [views] views, [bookings] bookings
3. [Equipment name] - [views] views, [bookings] bookings

## User Behavior
- Avg. session duration: [time]
- Bounce rate: [%]
- Pages per session: [number]
- Mobile vs Desktop: [%] / [%]

## Conversion Funnel
- Homepage → Browse: [%]
- Browse → Detail: [%]
- Detail → Booking: [%]
- Booking → Complete: [%]

## Actions for Next Week
- [ ] [Action item 1]
- [ ] [Action item 2]
- [ ] [Action item 3]
```

---

## ✅ Setup Complete!

You now have:
- ✅ GA4 account created
- ✅ Measurement ID added to Vercel
- ✅ Analytics tracking live
- ✅ Key events configured
- ✅ Dashboard templates ready
- ✅ Benchmarks to track

**Next Steps:**
1. Wait 24 hours for initial data
2. Create your funnel report
3. Set up conversion goals
4. Share reports with your team

**Questions?** Check the [GA4 Help Center](https://support.google.com/analytics)

🎉 Happy tracking!
