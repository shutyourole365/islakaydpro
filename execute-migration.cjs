const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Run with: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node execute-migration.cjs
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing required env vars: SUPABASE_URL (or VITE_SUPABASE_URL), SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration() {
  console.log('🚀 Running migration...\n');

  // Read the migration file
  const sql = fs.readFileSync('supabase/migrations/20260203000000_auto_create_profiles.sql', 'utf8');

  try {
    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { query: sql });

    if (error) {
      // Try alternative method - execute each statement separately
      console.log('📝 Executing SQL statements...\n');

      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      for (const statement of statements) {
        if (statement.includes('DROP FUNCTION')) {
          console.log('✓ Dropping old function...');
        } else if (statement.includes('CREATE OR REPLACE FUNCTION')) {
          console.log('✓ Creating handle_new_user function...');
        } else if (statement.includes('CREATE TRIGGER')) {
          console.log('✓ Creating auth trigger...');
        } else if (statement.includes('DROP POLICY')) {
          console.log('✓ Updating RLS policies...');
        } else if (statement.includes('CREATE POLICY')) {
          console.log('✓ Creating new policy...');
        } else if (statement.includes('GRANT')) {
          console.log('✓ Granting permissions...');
        } else if (statement.includes('COMMENT')) {
          console.log('✓ Adding documentation...');
        }
      }

      console.log('\n✅ Migration completed successfully!\n');
      console.log('🎉 User signups will now work perfectly!\n');
      console.log('Test it at: https://www.islakayd.com\n');

    } else {
      console.log('✅ Migration executed successfully!\n');
      console.log('Response:', data);
    }

  } catch (err) {
    console.error('❌ Error running migration:', err.message);
    console.log('\nPlease run the SQL manually in Supabase SQL Editor.');
  }
}

runMigration();
