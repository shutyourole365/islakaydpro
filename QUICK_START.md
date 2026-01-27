# 🚀 QUICK START CARD
*Keep this open while you work*

---

## ✅ Today's Goal: Get It Running

**Time needed: 30 minutes**

---

## Step 1: Get Credentials (15 min)

### Supabase (Required)
```
1. Visit: https://supabase.com/
2. Sign up/Login
3. Create new project
4. Settings → API
5. Copy: URL + anon key
```

### Stripe (Optional - for payments)
```
1. Visit: https://stripe.com/
2. Sign up
3. Developers → API keys
4. Copy: Publishable key (pk_test_...)
```

---

## Step 2: Configure (5 min)

```bash
# 1. Copy template
cp .env.example .env.local

# 2. Edit file
code .env.local

# 3. Paste your credentials:
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...your-key...

# 4. Save file
```

---

## Step 3: Setup Database (5 min)

```bash
# 1. Install CLI
npm install -g supabase

# 2. Link project
supabase link --project-ref your-project-id

# 3. Push migrations
supabase db push
```

---

## Step 4: Start App (2 min)

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Open: http://localhost:5173
```

---

## ✅ Success Checklist

App works if:
- [ ] No red error screen
- [ ] Can click around
- [ ] Can create account
- [ ] No console errors (F12)

---

## 🆘 If Something's Wrong

**Red error screen?**
→ Check .env.local has correct credentials

**Can't connect to database?**
→ Verify Supabase project is active (not paused)

**Other issues?**
→ Open TROUBLESHOOTING.md

---

## 📚 Next Steps

**After it's running:**

1. Read READY_TO_LAUNCH.md (your roadmap)
2. Test all features (click everything)
3. Add test data (equipment listings)
4. Review PRODUCTION_CHECKLIST.md
5. Customize branding (colors, logo)

---

## 💪 Remember

You're not building from scratch.
**Everything is already built.**

You're just:
✅ Configuring it
✅ Testing it
✅ Customizing it
✅ Launching it

**You've got this!** 🚀

---

## 🔗 Essential Links

- [READY_TO_LAUNCH.md](./READY_TO_LAUNCH.md) - Your complete roadmap
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - When things break
- [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md) - Before launch
- [MONITORING.md](./MONITORING.md) - After launch

---

## ⏱️ Timeline

- **Today**: Get it running (30 min)
- **This week**: Test everything (2 hours)
- **This month**: Customize & launch (20 hours)
- **This year**: Grow to 100K users 🎯

---

**Your daughter's future starts with this first step.** ❤️

**Now go make it happen!** 💪
