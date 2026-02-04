#!/bin/bash
set -e

echo "🚀 Running Supabase Migration..."
echo ""

# Load environment
source .env.local 2>/dev/null || true

PROJECT_REF="ialxlykysbqyiejepzkx"
SQL_FILE="supabase/migrations/20260203000000_auto_create_profiles.sql"

# Read SQL file
SQL_CONTENT=$(cat "$SQL_FILE")

echo "📋 Migration file: $SQL_FILE"
echo ""

# Check if we have service role key
if [ -z "$VITE_SUPABASE_SERVICE_KEY" ]; then
    echo "⚠️  Missing SERVICE_ROLE key!"
    echo ""
    echo "To run migrations, you need the service_role key:"
    echo ""
    echo "1️⃣  Get your service_role key:"
    echo "   https://supabase.com/dashboard/project/$PROJECT_REF/settings/api"
    echo ""
    echo "2️⃣  Add it to .env.local:"
    echo "   VITE_SUPABASE_SERVICE_KEY=your_service_role_key_here"
    echo ""
    echo "3️⃣  Run this script again:"
    echo "   ./run-migration-direct.sh"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "📝 OR run this SQL directly in Supabase SQL Editor:"
    echo "   https://supabase.com/dashboard/project/$PROJECT_REF/sql/new"
    echo ""
    cat "$SQL_FILE"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    exit 1
fi

echo "✅ Found service_role key"
echo "🔄 Executing migration..."
echo ""

# Execute SQL via Supabase API
RESPONSE=$(curl -s -X POST \
  "https://${PROJECT_REF}.supabase.co/rest/v1/rpc/exec_sql" \
  -H "apikey: $VITE_SUPABASE_SERVICE_KEY" \
  -H "Authorization: Bearer $VITE_SUPABASE_SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"query\": $(echo "$SQL_CONTENT" | jq -Rs .)}")

if [ $? -eq 0 ]; then
    echo "✅ Migration executed successfully!"
    echo ""
    echo "Response: $RESPONSE"
else
    echo "❌ Migration failed!"
    echo "Response: $RESPONSE"
    exit 1
fi
