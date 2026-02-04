const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

// Note: We need the service_role key to run migrations, not anon key
console.log('⚠️  Note: The anon key cannot run migrations.');
console.log('📝 You need the SERVICE_ROLE key from Supabase Dashboard.');
console.log('');
console.log('To get it:');
console.log('1. Go to: https://supabase.com/dashboard/project/ialxlykysbqyiejepzkx/settings/api');
console.log('2. Copy the "service_role" key (NOT the anon key)');
console.log('3. Add it to .env.local as VITE_SUPABASE_SERVICE_KEY');
console.log('');
console.log('Or run the SQL directly in Supabase SQL Editor:');
console.log('https://supabase.com/dashboard/project/ialxlykysbqyiejepzkx/sql/new');
console.log('');

// Read the migration file
const migrationPath = path.join(__dirname, 'supabase/migrations/20260203000000_auto_create_profiles.sql');
const sql = fs.readFileSync(migrationPath, 'utf8');

console.log('📄 Migration SQL to run:');
console.log('═'.repeat(80));
console.log(sql);
console.log('═'.repeat(80));
