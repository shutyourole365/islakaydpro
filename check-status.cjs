const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function checkStatus() {
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY
  );

  console.log('\n🔍 Checking Database Status...\n');

  // Check profiles
  const { data: profiles, error: pError } = await supabase
    .from('profiles')
    .select('*')
    .limit(3);

  console.log('PROFILES:', profiles?.length || 0);
  if (pError) console.log('Profile Error:', pError.message);

  // Check equipment
  const { data: equipment, error: eError } = await supabase
    .from('equipment')
    .select('*')
    .limit(3);

  console.log('EQUIPMENT:', equipment?.length || 0);
  if (eError) console.log('Equipment Error:', eError.message);

  // Write status to file
  const fs = require('fs');
  fs.writeFileSync('status.txt', 
    `Profiles: ${profiles?.length || 0}\nEquipment: ${equipment?.length || 0}\n${pError ? 'Profile Error: ' + pError.message : ''}\n${eError ? 'Equipment Error: ' + eError.message : ''}`
  );
  
  console.log('\nStatus written to status.txt');
}

checkStatus();
