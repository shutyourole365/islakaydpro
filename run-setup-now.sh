#!/bin/bash
set -e

echo "🚀 ISLAKAYD COMPLETE SETUP"
echo "================================"
echo ""

# Load environment variables
export $(cat .env.local | grep -v '^#' | xargs)

echo "Step 1: Creating demo user..."
node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_KEY);

(async () => {
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existing = existingUsers?.users?.find(u => u.email === 'demo@islakayd.com');
  
  if (existing) {
    console.log('✅ Demo user already exists');
    process.exit(0);
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email: 'demo@islakayd.com',
    password: 'Demo123456!',
    email_confirm: true,
    user_metadata: { full_name: 'Islakayd Demo Owner' }
  });

  if (error && error.message.includes('already registered')) {
    console.log('✅ User already exists');
    process.exit(0);
  }
  
  if (error) {
    console.log('❌ Error:', error.message);
    process.exit(1);
  }

  console.log('✅ Demo user created:', data.user.id);
  
  // Update profile
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  await supabase.from('profiles').upsert({
    id: data.user.id,
    full_name: 'Islakayd Demo Owner',
    bio: 'Demo account for equipment listings',
    location: 'Los Angeles, CA',
    is_verified: true,
    rating: 4.9,
    total_reviews: 127,
    account_status: 'active'
  });
  
  console.log('✅ Profile updated');
})();
" || echo "User creation step completed with warnings"

echo ""
echo "Step 2: Waiting for profile trigger..."
sleep 3

echo ""
echo "Step 3: Seeding equipment..."
npm run seed:equipment

echo ""
echo "================================"
echo "✅ SETUP COMPLETE!"
echo ""
echo "📝 Demo Credentials:"
echo "   Email: demo@islakayd.com"
echo "   Password: Demo123456!"
echo ""
echo "🌐 Visit: http://localhost:5173"
echo "================================"
