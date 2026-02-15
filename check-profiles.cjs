const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkProfiles() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name')
    .limit(5);
  
  if (error) {
    console.log('Error:', error.message);
    return;
  }
  
  console.log('Existing profiles:', data?.length || 0);
  if (data && data.length > 0) {
    data.forEach(p => console.log(`  - ${p.full_name || 'Unnamed'} (ID: ${p.id.substring(0, 8)}...)`));
  } else {
    console.log('\n⚠️  No profiles found.');
    console.log('\n📝 Creating a demo owner account for you...');
  }
  
  return data && data.length > 0;
}

checkProfiles();
