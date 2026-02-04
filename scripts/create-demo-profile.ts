#!/usr/bin/env tsx
/**
 * Create Demo Profile Script
 * Creates a demo owner profile directly for testing
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function createDemoProfile() {
  console.log('🎯 Creating demo profile...\n');

  const demoProfile = {
    id: randomUUID(),
    full_name: 'Islakayd Demo Owner',
    bio: 'Demo account showcasing premium equipment rentals',
    location: 'Los Angeles, CA',
    is_verified: true,
    rating: 4.9,
    total_reviews: 127,
    account_status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  try {
    const { error } = await supabase
      .from('profiles')
      .insert([demoProfile])
      .select()
      .single();

    if (error) {
      throw error;
    }

    console.log('✅ Demo profile created successfully!');
    console.log(`   Name: ${demoProfile.full_name}`);
    console.log(`   Location: ${demoProfile.location}`);
    console.log(`   User ID: ${demoProfile.id}\n`);

    return demoProfile.id;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Error creating demo profile:', errorMessage);
    console.error('   Details:', error);
    process.exit(1);
  }
}

// Run the script
createDemoProfile().then((userId) => {
  if (userId) {
    console.log('🎉 Ready to seed equipment!');
    console.log('   Run: npm run seed:equipment\n');
  }
  process.exit(0);
});
