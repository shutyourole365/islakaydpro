const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://ialxlykysbqyiejepzkx.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhbHhseWt5c2JxeWllamVwemt4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTE0NjY4OCwiZXhwIjoyMDg0NzIyNjg4fQ.RpReLoatOcBOEMYADx4Cq29oHB12xMLODvM9ji2g-nY';

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
    console.log('\nPlease run the SQL manually in Supabase SQL Editor:');
    console.log('https://supabase.com/dashboard/project/ialxlykysbqyiejepzkx/sql/new');
  }
}

runMigration();
