#!/usr/bin/env tsx
/**
 * Force Create Demo User via Admin API
 * Uses service role key to bypass all restrictions
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const serviceKey = process.env.VITE_SUPABASE_SERVICE_KEY!;

if (!serviceKey) {
  console.error('❌ Missing VITE_SUPABASE_SERVICE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createUser() {
  console.log('🚀 Creating demo user via Admin API...\n');

  const email = 'demo@islakayd.com';
  const password = 'Demo123456!';
  const fullName = 'Islakayd Demo Owner';

  try {
    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existing = existingUsers?.users.find(u => u.email === email);

    if (existing) {
      console.log('✅ User already exists!');
      console.log(`   Email: ${email}`);
      console.log(`   User ID: ${existing.id}`);
      console.log(`   Created: ${existing.created_at}\n`);
      
      // Check if profile exists
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', existing.id)
        .single();

      if (profile) {
        console.log('✅ Profile exists!');
        console.log(`   Name: ${profile.full_name || 'Not set'}`);
        console.log(`   Location: ${profile.location || 'Not set'}\n`);
      } else {
        console.log('⚠️  Profile missing, creating...');
        await createProfile(existing.id, fullName);
      }

      console.log('🎉 Ready to seed! Run: npm run seed:equipment\n');
      return;
    }

    // Create new user
    console.log('📝 Creating new user...');
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
      }
    });

    if (userError) {
      throw userError;
    }

    if (!userData.user) {
      throw new Error('No user data returned');
    }

    console.log('✅ User created successfully!');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   User ID: ${userData.user.id}\n`);

    // Wait for trigger to create profile
    console.log('⏳ Waiting for profile creation trigger (3 seconds)...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Check if profile was created by trigger
    const { data: autoProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userData.user.id)
      .single();

    if (autoProfile) {
      console.log('✅ Profile auto-created by trigger!');
      
      // Update with additional info
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          bio: 'Demo account showcasing premium equipment rentals',
          location: 'Los Angeles, CA',
          is_verified: true,
          rating: 4.9,
          total_reviews: 127,
        })
        .eq('id', userData.user.id);

      if (!updateError) {
        console.log('✅ Profile updated with demo info!\n');
      }
    } else {
      // Trigger didn't work, create manually
      console.log('⚠️  No auto-profile, creating manually...');
      await createProfile(userData.user.id, fullName);
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 SUCCESS! Demo account is ready!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📧 Login Credentials:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}\n`);
    console.log('🚀 Next Step:');
    console.log('   npm run seed:equipment\n');

  } catch (error: unknown) {
    const err = error as { message?: string; status?: number; code?: string };
    console.error('❌ Error:', err.message || 'Unknown error');
    if (err.status) console.error('   Status:', err.status);
    if (err.code) console.error('   Code:', err.code);
    process.exit(1);
  }
}

async function createProfile(userId: string, fullName: string) {
  const { error } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      full_name: fullName,
      bio: 'Demo account showcasing premium equipment rentals',
      location: 'Los Angeles, CA',
      is_verified: true,
      rating: 4.9,
      total_reviews: 127,
      account_status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

  if (error) {
    console.error('   ❌ Profile creation error:', error.message);
  } else {
    console.log('   ✅ Profile created successfully!\n');
  }
}

createUser();
