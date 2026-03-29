#!/bin/bash

echo "🔧 Running Database Migration"
echo "=============================="
echo ""

# Install postgres client if needed
if ! command -v psql &> /dev/null; then
    echo "📦 Installing PostgreSQL client..."
    sudo apt-get update -qq && sudo apt-get install -y postgresql-client -qq
fi

# Require env vars
if [ -z "$SUPABASE_DATABASE_URL" ]; then
  echo "❌ Error: SUPABASE_DATABASE_URL environment variable is not set"
  echo "   export SUPABASE_DATABASE_URL='postgresql://postgres.your-project:your-password@aws-0-us-west-1.pooler.supabase.com:6543/postgres'"
  exit 1
fi

echo "📝 Executing migration SQL..."

psql "$SUPABASE_DATABASE_URL" \
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
    echo "Please run manually in the Supabase SQL Editor."
    echo ""
fi
