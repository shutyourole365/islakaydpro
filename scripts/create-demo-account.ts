#!/usr/bin/env tsx
/**
 * Create Demo Account Script
 * Creates a demo owner account for testing and seeding data
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function createDemoAccount() {
  console.log('🎯 Creating demo account...\n');

  const demoEmail = 'demo@islakayd.com';
  const demoPassword = 'Demo123456!';
  const demoName = 'Islakayd Demo Owner';

  try {
    // Try to sign up
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: demoEmail,
      password: demoPassword,
      options: {
        data: {
          full_name: demoName,
        },
      },
    });

    if (authError) {
      // Check if user already exists
      if (authError.message.includes('already registered')) {
        console.log('✅ Demo account already exists!');
        console.log(`   Email: ${demoEmail}`);
        console.log(`   Password: ${demoPassword}\n`);
        
        // Get existing user ID
        const { data: signInData } = await supabase.auth.signInWithPassword({
          email: demoEmail,
          password: demoPassword,
        });
        
        return signInData?.user?.id;
      }
      
      throw authError;
    }

    if (authData.user) {
      console.log('✅ Demo account created successfully!');
      console.log(`   Email: ${demoEmail}`);
      console.log(`   Password: ${demoPassword}`);
      console.log(`   User ID: ${authData.user.id}\n`);

      // Wait a bit for the profile to be created by trigger
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update profile with additional info
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: demoName,
          bio: 'Demo account for equipment listings',
          location: 'Los Angeles, CA',
          is_verified: true,
        })
        .eq('id', authData.user.id);

      if (profileError) {
        console.log('⚠️  Could not update profile:', profileError.message);
      } else {
        console.log('✅ Profile updated with demo information\n');
      }

      return authData.user.id;
    }
  } catch (error: any) {
    console.error('❌ Error creating demo account:', error.message);
    process.exit(1);
  }
}

// Run the script
createDemoAccount().then((userId) => {
  if (userId) {
    console.log('🎉 Ready to seed equipment!');
    console.log('   Run: npm run seed:equipment\n');
  }
  process.exit(0);
});
