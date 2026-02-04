const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function verifySetup() {
  console.log('\n🔍 Verifying Setup...\n');
  
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
  );

  // Check profiles
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .limit(5);

  if (profileError) {
    console.log('❌ Profile check failed:', profileError.message);
  } else {
    console.log(`✅ Profiles: ${profiles.length} found`);
    if (profiles.length > 0) {
      profiles.forEach(p => console.log(`   - ${p.full_name || p.id}`));
    }
  }

  // Check equipment
  const { data: equipment, error: equipmentError } = await supabase
    .from('equipment')
    .select('id, title, daily_rate')
    .limit(10);

  if (equipmentError) {
    console.log('❌ Equipment check failed:', equipmentError.message);
  } else {
    console.log(`\n✅ Equipment: ${equipment.length} listings found`);
    if (equipment.length > 0) {
      equipment.forEach(e => console.log(`   - ${e.title} ($${e.daily_rate}/day)`));
    }
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  if (profiles?.length > 0 && equipment?.length > 0) {
    console.log('✅ SUCCESS! Setup is complete!');
    console.log('\n📝 Demo Credentials:');
    console.log('   Email: demo@islakayd.com');
    console.log('   Password: Demo123456!');
    console.log('\n🌐 Visit: http://localhost:5173');
    console.log('   Browse equipment: http://localhost:5173/browse');
  } else if (profiles?.length > 0) {
    console.log('⚠️  User created but no equipment yet');
    console.log('   Run: npm run seed:equipment');
  } else {
    console.log('⚠️  Setup incomplete - run: npm run setup');
  }
  console.log('='.repeat(50) + '\n');
}

verifySetup();
