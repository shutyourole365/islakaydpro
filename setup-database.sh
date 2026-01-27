#!/bin/bash
# ========================================
# ISLAKAYD DATABASE SETUP SCRIPT
# ========================================

set -e

echo "🚀 Starting Islakayd Database Setup..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

PROJECT_REF="ialxlykysbqyiejepzkx"
DB_PASSWORD="${SUPABASE_DB_PASSWORD:-your-db-password}"

echo "📋 Project Reference: $PROJECT_REF"
echo ""

# Step 1: Check if Supabase CLI is installed
echo "1️⃣ Checking Supabase CLI..."
if ! command -v supabase &> /dev/null; then
    echo -e "${YELLOW}⚠️  Supabase CLI not found. Installing...${NC}"
    npm install -g supabase
    echo -e "${GREEN}✅ Supabase CLI installed${NC}"
else
    echo -e "${GREEN}✅ Supabase CLI already installed${NC}"
fi
echo ""

# Step 2: Link project
echo "2️⃣ Linking to Supabase project..."
if supabase link --project-ref $PROJECT_REF 2>&1; then
    echo -e "${GREEN}✅ Project linked successfully${NC}"
else
    echo -e "${RED}❌ Failed to link project${NC}"
    echo "Please run manually: supabase link --project-ref $PROJECT_REF"
fi
echo ""

# Step 3: Check migrations
echo "3️⃣ Checking migrations..."
MIGRATION_COUNT=$(ls -1 supabase/migrations/*.sql 2>/dev/null | wc -l)
echo "Found $MIGRATION_COUNT migration files"
echo ""

# Step 4: Push migrations to Supabase
echo "4️⃣ Applying database migrations..."
echo -e "${YELLOW}This will create all tables, RLS policies, and functions...${NC}"
if supabase db push; then
    echo -e "${GREEN}✅ Migrations applied successfully${NC}"
else
    echo -e "${RED}❌ Migration failed${NC}"
    echo "You can also run migrations directly in Supabase SQL Editor:"
    echo "https://app.supabase.com/project/$PROJECT_REF/editor"
fi
echo ""

# Step 5: Seed data
echo "5️⃣ Adding seed data..."
echo "Please run the seed script in your Supabase SQL Editor:"
echo "👉 https://app.supabase.com/project/$PROJECT_REF/editor"
echo "📄 Copy contents from: ./setup-database.sql"
echo ""

# Step 6: Verify
echo "6️⃣ Verification..."
echo "Visit your Supabase dashboard to verify:"
echo "📊 Tables: https://app.supabase.com/project/$PROJECT_REF/editor"
echo "🔐 Auth: https://app.supabase.com/project/$PROJECT_REF/auth/users"
echo ""

echo -e "${GREEN}✨ Setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Run: npm run dev"
echo "2. Sign up for a test account"
echo "3. Create your first equipment listing"
echo ""
