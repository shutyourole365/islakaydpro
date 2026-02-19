const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_KEY
);

async function createUser() {
  console.log('🔧 Creating demo user with Admin API...\n');

  try {
    // Check if user exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existing = existingUsers?.users?.find(u => u.email === 'demo@islakayd.com');
    
    if (existing) {
      console.log('✅ User already exists:', existing.id);
      console.log('   Updating profile...\n');
      
      await supabase.from('profiles').upsert({
        id: existing.id,
        full_name: 'Islakayd Demo Owner',
        bio: 'Demo account for equipment listings',
        location: 'Los Angeles, CA',
        is_verified: true,
        rating: 4.9,
        total_reviews: 127,
        account_status: 'active'
      });
      
      console.log('✅ Profile updated!\n');
      return;
    }

    // Create new user
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'demo@islakayd.com',
      password: 'Demo123456!',
      email_confirm: true,
      user_metadata: {
        full_name: 'Islakayd Demo Owner'
      }
    });

    if (error) {
      throw error;
    }

    console.log('✅ User created:', data.user.id);
    console.log('   Waiting for profile trigger...\n');
    
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Update profile
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: data.user.id,
      full_name: 'Islakayd Demo Owner',
      bio: 'Demo account for equipment listings',
      location: 'Los Angeles, CA',
      is_verified: true,
      rating: 4.9,
      total_reviews: 127,
      account_status: 'active'
    });

    if (profileError) {
      console.log('⚠️  Profile update error:', profileError.message);
    } else {
      console.log('✅ Profile created!\n');
    }

    console.log('📝 Demo Credentials:');
    console.log('   Email: demo@islakayd.com');
    console.log('   Password: Demo123456!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createUser();
