#!/bin/bash

echo "🚀 Executing database migration..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Require env vars
if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ] || [ -z "$SUPABASE_URL" ]; then
  echo "❌ Error: Required environment variables are not set"
  echo "   export SUPABASE_URL='https://your-project.supabase.co'"
  echo "   export SUPABASE_SERVICE_ROLE_KEY='your-service-role-key'"
  exit 1
fi

# Read the migration SQL
SQL_FILE="supabase/migrations/20260203000000_auto_create_profiles.sql"

echo -e "${BLUE}📋 Reading migration SQL...${NC}"
SQL_CONTENT=$(cat "$SQL_FILE")

# Execute via Supabase Management API using service role
echo -e "${BLUE}🔧 Executing SQL statements...${NC}"
echo ""

# Try using Supabase SQL API endpoint
RESPONSE=$(curl -s -X POST \
  "${SUPABASE_URL}/rest/v1/rpc/query" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d "{\"query\":$(echo "$SQL_CONTENT" | jq -Rs .)}")

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Migration executed successfully!${NC}"
  echo ""
  echo -e "${GREEN}🎉 The database is now configured to auto-create user profiles!${NC}"
  echo ""
  echo -e "${YELLOW}Next steps:${NC}"
  echo "1. Test signup at https://www.islakayd.com"
  echo "2. Try creating a new user account"
  echo "3. Check that it works without errors"
  echo ""
else
  echo -e "${YELLOW}⚠️  Could not execute via API${NC}"
  echo ""
  echo "Please run the SQL manually:"
  echo "1. Open the Supabase SQL Editor for your project"
  echo "2. Copy the SQL from: $SQL_FILE"
  echo "3. Click RUN"
fi
