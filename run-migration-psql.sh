#!/bin/bash

echo "🔧 Running Database Migration"
echo "=============================="
echo ""

# Install postgres client if needed
if ! command -v psql &> /dev/null; then
    echo "📦 Installing PostgreSQL client..."
    sudo apt-get update -qq && sudo apt-get install -y postgresql-client -qq
fi

# Connection string for Supabase using service role
# Format: postgresql://postgres:[SERVICE_ROLE_KEY]@db.[PROJECT_REF].supabase.co:5432/postgres
PGPASSWORD="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhbHhseWt5c2JxeWllamVwemt4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTE0NjY4OCwiZXhwIjoyMDg0NzIyNjg4fQ.RpReLoatOcBOEMYADx4Cq29oHB12xMLODvM9ji2g-nY"

echo "📝 Executing migration SQL..."
export PGPASSWORD

psql "postgresql://postgres.ialxlykysbqyiejepzkx:${PGPASSWORD}@aws-0-us-west-1.pooler.supabase.com:6543/postgres" \
  -f supabase/migrations/20260203000000_auto_create_profiles.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migration completed successfully!"
    echo ""
    echo "🎉 Your database is now configured!"
    echo ""
    echo "What was fixed:"
    echo "  ✓ Auto-create user profiles on signup"
    echo "  ✓ Database trigger installed"
    echo "  ✓ RLS policies updated"
    echo ""
    echo "🧪 Test it now:"
    echo "  Visit: https://www.islakayd.com"
    echo "  Try creating a new user account!"
    echo ""
else
    echo ""
    echo "⚠️  Migration failed!"
    echo ""
    echo "Please run manually:"
    echo "1. Open: https://supabase.com/dashboard/project/ialxlykysbqyiejepzkx/sql/new"
    echo "2. Copy SQL from: supabase/migrations/20260203000000_auto_create_profiles.sql"
    echo "3. Click RUN"
    echo ""
fi
