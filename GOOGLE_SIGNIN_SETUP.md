# 🔐 Google Sign-In Setup Guide for Islakayd

## ✅ What's Already Done

Your app is now configured with Google Sign-In! The code is ready and working. You just need to configure Google OAuth in Supabase.

---

## 🚀 Step-by-Step Setup

### Step 1: Go to Supabase Dashboard

1. Open: **https://app.supabase.com**
2. Select your project: **islakaydpro**
3. Go to: **Authentication** → **Providers** (left sidebar)

---

### Step 2: Enable Google Provider

1. Scroll down to find **Google**
2. Toggle it **ON** (enable)
3. You'll see two options:
   - ✅ **Use Supabase's Google OAuth** (Recommended - Easiest)
   - ⚙️ Use your own Google OAuth credentials

---

## 🎯 OPTION A: Use Supabase's Google OAuth (Recommended)

This is the easiest way - no Google Cloud Console setup needed!

1. In Supabase, select: **"Use Supabase's Google OAuth app"**
2. Click **Save**
3. ✅ **Done!** Google Sign-In is now working!

**Pros:**
- ✅ Instant setup (30 seconds)
- ✅ No Google Cloud Console needed
- ✅ Perfect for development
- ✅ Works immediately

**Cons:**
- Shows "via Supabase" in Google sign-in popup
- Limited customization

---

## ⚙️ OPTION B: Use Your Own Google OAuth (Production)

For a branded experience (shows "Islakayd" instead of "Supabase"):

### Part 1: Create Google OAuth Credentials

1. Go to: **https://console.cloud.google.com**
2. Create a new project (or select existing)
   - Name: **Islakayd**
3. Go to: **APIs & Services** → **OAuth consent screen**
4. Choose: **External**
5. Fill in:
   - App name: **Islakayd**
   - User support email: **your-email@example.com**
   - Developer email: **your-email@example.com**
6. Click **Save and Continue**
7. Skip "Scopes" (click **Save and Continue**)
8. Add test users if needed (or skip)
9. Click **Save and Continue**

### Part 2: Create OAuth Client ID

1. Go to: **APIs & Services** → **Credentials**
2. Click: **+ CREATE CREDENTIALS** → **OAuth client ID**
3. Choose: **Web application**
4. Name: **Islakayd Production**
5. Add **Authorized JavaScript origins**:
   ```
   https://islakayd.com
   https://www.islakayd.com
   https://ialxlykysbqyiejepzkx.supabase.co
   ```
6. Add **Authorized redirect URIs**:
   ```
   https://ialxlykysbqyiejepzkx.supabase.co/auth/v1/callback
   ```
7. Click **Create**
8. Copy the **Client ID** and **Client Secret**

### Part 3: Configure Supabase

1. Go back to **Supabase Dashboard**
2. Authentication → Providers → **Google**
3. Select: **"Use your own Google OAuth credentials"**
4. Paste:
   - **Client ID**: (from Google Console)
   - **Client Secret**: (from Google Console)
5. Click **Save**

### Part 4: Update Redirect URIs (After Custom Domain)

Once islakayd.com is live, add to Google Console:
```
https://islakayd.com/auth/callback
https://www.islakayd.com/auth/callback
```

---

## 🧪 Testing Google Sign-In

### Local Testing (Development)

1. Make sure dev server is running:
   ```bash
   npm run dev
   ```

2. Open the app in your browser

3. Click **"Sign In"** or **"Sign Up"**

4. Click the **Google** button

5. You'll be redirected to Google sign-in

6. After signing in with Google, you'll be redirected back to the app

7. ✅ You're logged in!

### What Happens Behind the Scenes

1. User clicks Google button
2. App redirects to Google OAuth
3. User authorizes the app
4. Google redirects back with auth token
5. Supabase creates user account
6. Profile is created automatically
7. User is logged in!

---

## 🔧 Troubleshooting

### "Redirect URI mismatch" Error

**Fix:** Add the redirect URI to Google Console:
```
https://ialxlykysbqyiejepzkx.supabase.co/auth/v1/callback
```

### "App not verified" Warning

This is normal for testing. Options:
1. Click "Advanced" → "Go to Islakayd (unsafe)" for testing
2. Or complete Google verification (for production)

### Sign-in popup closes immediately

**Check:**
- Google OAuth is enabled in Supabase
- Redirect URIs are correct
- Browser allows popups from your site

### User not appearing in database

**Check:**
- Supabase → Authentication → Users (check if user was created)
- Check browser console for errors
- Verify database policies allow inserts

---

## 📱 Mobile App Considerations

For production mobile apps, you'll need:

### iOS
1. Configure OAuth redirect in Xcode
2. Add URL scheme: `islakayd://`
3. Update redirect URI in Supabase

### Android
1. Configure deep linking in AndroidManifest
2. Add intent filter for `islakayd://`
3. Update redirect URI in Supabase

---

## ✅ Verification Checklist

Test these scenarios:

- [ ] Sign up with Google (new user)
- [ ] Sign in with Google (existing user)
- [ ] Profile is created in database
- [ ] User can access protected pages
- [ ] User can sign out
- [ ] User data persists after refresh

---

## 🎯 Quick Start Commands

```bash
# Start development server
npm run dev

# Open in browser
# Click Sign In → Click Google button
```

---

## 📊 User Flow

```
1. User clicks "Sign in with Google"
   ↓
2. Redirect to Google OAuth
   ↓
3. User selects Google account
   ↓
4. Google sends auth code to Supabase
   ↓
5. Supabase creates/updates user
   ↓
6. User redirected back to app
   ↓
7. ✅ Logged in!
```

---

## 🔐 Security Notes

✅ **Already Configured:**
- HTTPS required (enforced by OAuth)
- Secure token storage (Supabase handles)
- CSRF protection (built-in)
- Session management (automatic)

---

## 📚 Additional Resources

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)
- [OAuth Best Practices](https://oauth.net/2/)

---

## 🎉 That's It!

**Quickest Setup:**
1. Go to Supabase → Authentication → Providers
2. Enable Google (use Supabase's OAuth)
3. Save
4. Test sign-in
5. ✅ Done!

**Total time:** 1-2 minutes 🚀

Your users can now sign in with Google on:
- 🌐 Web (all browsers)
- 📱 Mobile (iOS & Android PWA)
- 💻 Desktop (installed PWA)
