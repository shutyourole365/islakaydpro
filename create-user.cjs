const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.VITE_SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function main() {
  console.log('🚀 Creating demo user...\n');

  const email = 'demo@islakayd.com';
  const password = 'Demo123456!';

  try {
    // Create user
    const { data, error } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: { full_name: 'Islakayd Demo Owner' }
    });

    if (error) {
      if (error.message.includes('already registered') || error.message.includes('User already registered')) {
        console.log('✅ User already exists!');
        console.log(`   Email: ${email}`);
        console.log(`   Password: ${password}\n`);
        console.log('🚀 Run: npm run seed:equipment\n');
        process.exit(0);
      }
      throw error;
    }

    console.log('✅ User created!');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   ID: ${data.user.id}\n`);

    // Wait for profile trigger
    await new Promise(r => setTimeout(r, 2000));

    // Update profile
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

    console.log('✅ Profile updated!\n');
    console.log('🚀 Next: npm run seed:equipment\n');

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

main();
