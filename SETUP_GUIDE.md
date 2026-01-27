# 🚀 Complete Setup Guide for Islakayd

**Don't worry - I'll walk you through every step!** Follow this guide in order and you'll have everything running perfectly.

---

## ✅ Step 1: Install Dependencies

Open your terminal and run:

```bash
npm install
```

**What this does:** Installs all the packages needed for the project including React, TypeScript, Vite, and all the new testing tools we added.

**Expected output:** You'll see a progress bar and "added XXX packages" at the end.

**Time required:** 2-3 minutes

---

## ✅ Step 2: Set Up Supabase (Backend Database)

### 2a. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project" (sign up with GitHub if you don't have an account)
3. Click "New project"
4. Fill in:
   - **Name:** islakayd (or whatever you prefer)
   - **Database Password:** Create a strong password (save it somewhere safe!)
   - **Region:** Choose closest to you
   - **Pricing Plan:** Free tier is perfect for development
5. Click "Create new project"
6. **Wait 2-3 minutes** for Supabase to set up your database

### 2b. Get Your API Keys

1. In your Supabase project dashboard, click on the **Settings** icon (gear icon) in the left sidebar
2. Click **API** in the settings menu
3. You'll see two important values:
   - **Project URL:** Something like `https://abcdefghijk.supabase.co`
   - **anon public key:** A long string starting with `eyJ...`
4. **Keep this tab open** - you'll need these values in the next step

### 2c. Run Database Migrations

1. In your terminal, make sure you're in the project folder:
   ```bash
   cd /workspaces/islakaydpro
   ```

2. Install Supabase CLI (if you haven't already):
   ```bash
   npm install -g supabase
   ```

3. Link your project (you'll be prompted to paste your project ref - it's in the URL):
   ```bash
   supabase link --project-ref your-project-ref
   ```

4. Push the database schema:
   ```bash
   supabase db push
   ```

**What this does:** Creates all the tables, security policies, and functions in your database.

---

## ✅ Step 3: Configure Environment Variables

1. Open the file `.env.local` (I already created it for you!)

2. Replace the placeholder values:

   **Find this line:**
   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   ```
   **Replace with your actual Project URL from Step 2b**

   **Find this line:**
   ```
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```
   **Replace with your actual anon public key from Step 2b**

3. **For Stripe (payment processing):**
   - If you want to test payments:
     1. Go to [stripe.com](https://stripe.com)
     2. Create an account (free)
     3. Go to Developers > API keys
     4. Copy your **Publishable key** (starts with `pk_test_`)
     5. Paste it in `.env.local`:
        ```
        VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_key_here
        ```
   - If you don't need payments yet, you can skip this for now

4. Save the `.env.local` file

---

## ✅ Step 4: Run Type Checking and Linting

Make sure everything compiles correctly:

```bash
npm run typecheck
```

**Expected output:** "Found 0 errors"

Then check code quality:

```bash
npm run lint
```

**Expected output:** Should complete without errors

---

## ✅ Step 5: Run Tests

Verify the testing infrastructure works:

```bash
npm run test:run
```

**What this does:** Runs all 20+ unit tests we created.

**Expected output:** "✓ 20 passed" (or similar)

---

## ✅ Step 6: Start the Development Server

```bash
npm run dev
```

**What this does:** Starts the local development server.

**Expected output:** You'll see:
```
  VITE v5.4.2  ready in 1234 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

**Now open your browser and go to:** http://localhost:5173

You should see the Islakayd homepage! 🎉

---

## 🎯 Step 7: Verify Everything Works

### Test the core features:

1. **Home Page:** Should load with beautiful hero section
2. **Search:** Click search icon (or press `/`) - modal should open
3. **Browse:** Click "Browse Equipment" - should show equipment grid
4. **Categories:** Click any category - should filter equipment
5. **Equipment Detail:** Click any equipment card - modal opens with details
6. **Comparison:** Click the "+" button on equipment cards - adds to comparison
7. **Authentication:** Click "Sign In" - auth modal opens
8. **AI Assistant:** Click the floating bot icon - Kayd AI opens

### If you see any errors:

- Check browser console (F12 > Console tab)
- Most common issue: Supabase credentials not configured correctly
- Solution: Double-check `.env.local` has correct values from your Supabase project

---

## 🚀 Step 8: Test Production Build

Before deploying, test the production build:

```bash
npm run build
```

**Expected output:** "✓ built in XXXms"

Then preview it:

```bash
npm run preview
```

**Open:** http://localhost:4173

If this works, you're ready to deploy! 🎉

---

## 🌐 Step 9: Deploy to Production (Optional)

### Option A: Vercel (Recommended - Easiest)

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Follow prompts:
   - Link to existing project? **No** (first time)
   - What's your project name? **islakayd**
   - Which directory is your code? **.**
   - Want to override settings? **No**

4. **Set environment variables in Vercel:**
   - Go to vercel.com > Your project > Settings > Environment Variables
   - Add all variables from `.env.local` (except VITE_APP_URL)
   - Use your production Supabase credentials (not test!)

5. Your site is live! 🚀

### Option B: Netlify

See `DEPLOYMENT.md` for detailed Netlify instructions.

---

## 🐛 Troubleshooting

### "Module not found" errors
**Solution:** Run `npm install` again

### "Supabase client error" or blank pages
**Solution:** Check `.env.local` has correct Supabase URL and key

### Tests failing
**Solution:** Make sure you ran `npm install` to get all test dependencies

### Port 5173 already in use
**Solution:** 
- Kill the process: `lsof -ti:5173 | xargs kill -9`
- Or use a different port: `npm run dev -- --port 3000`

### TypeScript errors
**Solution:** Run `npm run typecheck` to see specific errors

---

## 📚 Additional Resources

- **Full Documentation:** See `README.md`
- **Deployment Guide:** See `DEPLOYMENT.md`
- **Contributing:** See `CONTRIBUTING.md`
- **Supabase Docs:** [supabase.com/docs](https://supabase.com/docs)
- **Vite Docs:** [vitejs.dev](https://vitejs.dev)
- **React Docs:** [react.dev](https://react.dev)

---

## ✅ Quick Checklist

Use this checklist to track your progress:

- [ ] Ran `npm install`
- [ ] Created Supabase project
- [ ] Got Supabase URL and anon key
- [ ] Ran database migrations (`supabase db push`)
- [ ] Updated `.env.local` with Supabase credentials
- [ ] Ran `npm run typecheck` (0 errors)
- [ ] Ran `npm run lint` (no errors)
- [ ] Ran `npm run test:run` (all tests pass)
- [ ] Ran `npm run dev` (server starts)
- [ ] Opened http://localhost:5173 (site loads)
- [ ] Tested key features (search, browse, auth, etc.)
- [ ] Ran `npm run build` (production build succeeds)
- [ ] Optional: Deployed to Vercel/Netlify

---

## 🎉 You Did It!

If you made it through all steps, congratulations! Your Islakayd platform is now running. 

**What you have now:**
- ✅ Full-featured equipment rental marketplace
- ✅ Secure authentication with Supabase
- ✅ Database with RLS (Row Level Security)
- ✅ Payment processing ready (Stripe)
- ✅ AI assistant (Kayd)
- ✅ Real-time features
- ✅ Comprehensive testing
- ✅ Error boundaries for stability
- ✅ Analytics tracking
- ✅ SEO optimized
- ✅ PWA (installable as mobile app)
- ✅ Production-ready deployment

**Need help?** 
- Check the troubleshooting section above
- Review the documentation files
- The codebase has extensive comments explaining everything

**Next steps:**
- Customize the branding (colors, logo)
- Add real equipment listings
- Invite beta testers
- Launch! 🚀

---

**Remember:** Take it step by step. Each step is designed to be simple. You've got this! 💪
