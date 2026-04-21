# 🗄️ Database Setup Guide

## Quick Setup (5 minutes)

Since the Supabase CLI isn't accessible in this environment, we'll set up the database manually through the Supabase Dashboard.

### Step 1: Open Supabase SQL Editor

Click here to open your SQL Editor:
👉 **https://app.supabase.com/project/ialxlykysbqyiejepzkx/sql/new**

### Step 2: Run the Complete Setup Script

1. Open the file `COMPLETE_DATABASE_SETUP.sql` (2,038 lines)
2. Copy **ALL** content from that file
3. Paste it into the Supabase SQL Editor
4. Click "Run" (or press Ctrl+Enter)
5. Wait for completion (~10-15 seconds)

### Step 3: Verify Tables Created

Visit the Table Editor to confirm all tables were created:
👉 **https://app.supabase.com/project/ialxlykysbqyiejepzkx/editor**

You should see these tables:
- ✅ profiles
- ✅ categories
- ✅ equipment
- ✅ bookings
- ✅ reviews
- ✅ favorites
- ✅ notifications
- ✅ messages
- ✅ conversations
- ✅ conversation_participants
- ✅ user_analytics
- ✅ equipment_analytics
- ✅ equipment_availability
- ✅ saved_searches
- ✅ verification_requests
- ✅ audit_logs
- ✅ user_sessions
- ✅ platform_settings
- ✅ email_preferences
- ✅ email_logs
- ✅ payment_methods
- ✅ transactions
- ✅ push_subscriptions

### Step 4: (Optional) Add Sample Data

If you want to test with sample data, run:
```bash
cat setup-database.sql
```

Then copy the seed data section and run it in SQL Editor.

---

## What Gets Created

### 🔐 Security Features
- Row Level Security (RLS) policies on all tables
- Audit logging for security events
- User session tracking
- Two-factor authentication support

### 📊 Analytics
- User analytics (rental history, earnings, ratings)
- Equipment analytics (views, bookings, revenue)
- Platform-wide metrics

### 💳 Payments
- Stripe payment integration
- Transaction history
- Payment methods storage

### 📧 Notifications
- Email notifications system
- Push notifications support
- In-app notifications

### 🚀 Performance
- Optimized indexes for common queries
- Database functions for counters
- Efficient query patterns

---

## Troubleshooting

### Error: "relation already exists"
This means some tables already exist. You can either:
1. Drop existing tables first (⚠️ **loses all data**):
   ```sql
   DROP SCHEMA public CASCADE;
   CREATE SCHEMA public;
   ```
2. Or skip to the verification step if tables are already set up

### Error: "permission denied"
Make sure you're using the Service Role key in the SQL Editor, not the Anon key.

### Error: "syntax error"
Make sure you copied the **entire** SQL file without missing any characters.

---

## Quick Links

- **SQL Editor**: https://app.supabase.com/project/ialxlykysbqyiejepzkx/sql/new
- **Table Editor**: https://app.supabase.com/project/ialxlykysbqyiejepzkx/editor
- **Authentication**: https://app.supabase.com/project/ialxlykysbqyiejepzkx/auth/users
- **API Settings**: https://app.supabase.com/project/ialxlykysbqyiejepzkx/settings/api
- **Database Settings**: https://app.supabase.com/project/ialxlykysbqyiejepzkx/settings/database

---

## After Setup

Once database is set up, return to your project and run:
```bash
npm run dev
```

Then test:
1. Sign up for a new account
2. Browse equipment listings
3. Add items to favorites
4. Try creating a booking
5. Check that notifications appear

---

## Environment Variables

Already configured in `.env.local`:
```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

✅ You're all set! No changes needed.
