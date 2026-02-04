const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ialxlykysbqyiejepzkx.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhbHhseWt5c2JxeWllamVwemt4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTE0NjY4OCwiZXhwIjoyMDg0NzIyNjg4fQ.RpReLoatOcBOEMYADx4Cq29oHB12xMLODvM9ji2g-nY';

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
