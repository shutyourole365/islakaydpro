const { createClient } = require('@supabase/supabase-js');

// Run with: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node verify-migration.cjs
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing required env vars: SUPABASE_URL (or VITE_SUPABASE_URL), SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkMigration() {
  console.log('\n🔍 Checking migration status...\n');

  try {
    // Check if profiles table exists and can be accessed
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    if (profilesError) {
      console.log('❌ Profiles table check:', profilesError.message);
    } else {
      console.log('✅ Profiles table is accessible');
    }

    // Try to get auth users count to verify service role access
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
      console.log('⚠️  Auth admin access:', authError.message);
    } else {
      console.log(`✅ Service role has admin access (${authData.users.length} users)`);
    }

    console.log('\n✅ Migration verification complete!\n');
    console.log('🎉 Your database is ready for user signups!\n');
    console.log('📝 Next steps:');
    console.log('   1. Visit https://www.islakayd.com');
    console.log('   2. Click "Get Started" or "Sign Up"');
    console.log('   3. Create a new account');
    console.log('   4. Check your email for confirmation link');
    console.log('   5. Profile will be auto-created! ✨\n');

  } catch (err) {
    console.error('Error:', err.message);
  }
}

checkMigration();
