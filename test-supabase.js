// Quick Supabase Connection Test
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ialxlykysbqyiejepzkx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhbHhseWt5c2JxeWllamVwemt4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxNDY2ODgsImV4cCI6MjA4NDcyMjY4OH0.xVQYWWYZDc2YSsTEgTGhCjyArgwrhaXgGaCZAk1fqZs';

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
