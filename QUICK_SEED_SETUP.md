# Quick Setup: Create Demo Account and Seed Data

## Option 1: Via Your Live Site (Recommended - 2 minutes)

1. **Visit your site:** https://islakayd.com

2. **Click "Get Started" or "Sign Up"**

3. **Create an account:**
   - Email: your-email@example.com
   - Password: (your choice)
   - Name: Your Name

4. **Once signed up, come back here and run:**
   ```bash
   npm run seed:equipment
   ```

**That's it!** The script will use your new account as the owner for all equipment.

---

## Option 2: Use Supabase Dashboard (Alternative - 3 minutes)

1. **Go to:** https://supabase.com/dashboard/project/ialxlykysbqyiejepzkx

2. **Navigate to:** Authentication → Users

3. **Click "Add User" button**

4. **Fill in:**
   - Email: demo@islakayd.com
   - Password: Demo123456!
   - Auto Confirm: ✅ YES

5. **Click "Create User"**

6. **Run the seed script:**
   ```bash
   npm run seed:equipment
   ```

---

## Option 3: SQL Direct Insert (Advanced - 1 minute)

If you want to run SQL directly:

1. **Go to:** https://supabase.com/dashboard/project/ialxlykysbqyiejepzkx/editor

2. **Click "SQL Editor"**

3. **Copy & paste this:**

```sql
-- Create demo auth user
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
)
VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'demo@islakayd.com',
  crypt('Demo123456!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- Create demo profile (triggers should handle this, but just in case)
INSERT INTO public.profiles (
  id,
  full_name,
  bio,
  location,
  is_verified,
  rating,
  total_reviews,
  account_status
)
SELECT 
  id,
  'Islakayd Demo Owner',
  'Demo account showcasing premium equipment rentals',
  'Los Angeles, CA',
  true,
  4.9,
  127,
  'active'
FROM auth.users 
WHERE email = 'demo@islakayd.com';
```

4. **Click "Run"**

5. **Run the seed script:**
   ```bash
   npm run seed:equipment
   ```

---

## What Happens Next?

Once you have a user account (via ANY option above), running `npm run seed:equipment` will:

✅ Find your user account
✅ Create 15 professional equipment listings
✅ Assign them all to your account
✅ Make them visible on your site immediately

**You'll have:**
- 3 Construction Equipment listings
- 3 Photography Equipment listings  
- 2 Power Tools listings
- 2 Event Equipment listings
- 2 Landscaping Equipment listings
- 3 Specialty Equipment listings

**All with:**
- Professional descriptions
- Realistic pricing
- Multiple features
- Technical specifications
- Different locations across the US

---

## 🚀 Quick Start (Do This Now!)

**If you're in a hurry, just do this:**

1. Open: https://islakayd.com
2. Click "Sign Up"
3. Enter any email/password
4. Come back here
5. Run: `npm run seed:equipment`

**Done in 2 minutes!** 🎉

---

## 💡 Demo Account Details

After running any option above, you'll have credentials to test:

```
Email: demo@islakayd.com (or your email if you signed up normally)
Password: Demo123456! (or your password)
```

You can sign in and:
- ✅ Browse all 15 equipment listings
- ✅ Edit equipment details
- ✅ Add more equipment
- ✅ Manage bookings
- ✅ See your dashboard

---

## 🐛 Troubleshooting

**"No profiles found" error?**
→ Make sure you signed up first! The script needs at least 1 user.

**Can't access Supabase dashboard?**
→ Just use Option 1 (sign up on your site)

**Seed script fails?**
→ Check .env.local has VITE_SUPABASE_SERVICE_KEY

**Equipment not showing?**
→ Refresh your site, check equipment is `is_active: true`

---

## ✅ After Seeding

Visit your site and you'll see:
- **Homepage**: Featured equipment in the carousel
- **Browse page**: All 15 listings with filters
- **Search**: Can search by type, location, price
- **Dashboard** (when signed in): Your equipment listed

**Ready to launch!** 🚀
