// Quick Supabase Connection Test
// Run with: VITE_SUPABASE_URL=... VITE_SUPABASE_ANON_KEY=... node test-supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing required env vars: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 Testing Supabase Connection...\n');

// Test connection by fetching categories
const { data, error } = await supabase
  .from('categories')
  .select('*')
  .limit(5);

if (error) {
  console.error('❌ Connection Error:', error.message);
} else {
  console.log('✅ Supabase Connected Successfully!');
  console.log(`📊 Found ${data.length} categories:`);
  data.forEach(cat => console.log(`   - ${cat.name}`));
}
