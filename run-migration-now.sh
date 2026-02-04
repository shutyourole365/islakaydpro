#!/bin/bash

echo "🚀 Executing database migration..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhbHhseWt5c2JxeWllamVwemt4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTE0NjY4OCwiZXhwIjoyMDg0NzIyNjg4fQ.RpReLoatOcBOEMYADx4Cq29oHB12xMLODvM9ji2g-nY"
SUPABASE_URL="https://ialxlykysbqyiejepzkx.supabase.co"

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
  -H "apikey: ${SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
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
  echo "1. Open: https://supabase.com/dashboard/project/ialxlykysbqyiejepzkx/sql/new"
  echo "2. Copy the SQL from: $SQL_FILE"
  echo "3. Click RUN"
fi
