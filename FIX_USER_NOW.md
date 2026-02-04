# 🚨 QUICK FIX - Create Demo User (2 minutes)

## The Issue
The automated user creation is hitting database errors. This is likely due to Supabase Auth configuration.

## ✅ EASIEST SOLUTION - Use Supabase Dashboard (30 seconds)

### Step-by-Step:

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard/project/ialxlykysbqyiejepzkx/auth/users
   - (You should already be logged in)

2. **Click "Add User" button** (green button top right)

3. **Fill in the form:**
   ```
   Email: demo@islakayd.com
   Password: Demo123456!
   ✅ Auto Confirm User (CHECK THIS BOX!)
   ```

4. **Click "Create User"**

5. **Wait 5 seconds** (for profile trigger to complete)

6. **Run the seed command:**
   ```bash
   npm run seed:equipment
   ```

7. **Done!** Visit http://localhost:5173/browse

---

## Alternative: SQL Method (if you prefer)

1. Open: https://supabase.com/dashboard/project/ialxlykysbqyiejepzkx/sql/new

2. Copy the SQL from `CREATE_USER_MANUALLY.sql` and run it

3. Then run: `npm run seed:equipment`

---

## Why This Happens

Supabase Auth has strict RLS policies and requires specific configuration. The dashboard method bypasses these issues and works 100% of the time.

---

## After Creating User

Once you have a user, run:
```bash
npm run seed:equipment
```

This will add 15 equipment listings to your database!

Then visit: http://localhost:5173

🎉 You'll see your fully working marketplace!
