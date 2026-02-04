#!/bin/bash

# Apply the auto-create profiles migration to Supabase
# This fixes the "Database error saving new user" issue

set -e

echo "🔧 Applying profile auto-creation migration to Supabase..."
echo ""

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Installing..."
    npm install -g supabase
fi

# Get Supabase credentials from .env.local
if [ -f .env.local ]; then
    source .env.local
else
    echo "❌ .env.local file not found!"
    exit 1
fi

# Extract project ref from SUPABASE_URL
PROJECT_REF=$(echo $VITE_SUPABASE_URL | sed 's/https:\/\/\(.*\)\.supabase\.co/\1/')

echo "📦 Project: $PROJECT_REF"
echo ""

# Option 1: Run migration via SQL
echo "🚀 Applying migration..."
echo ""
echo "Please run this SQL in your Supabase SQL Editor:"
echo "https://supabase.com/dashboard/project/$PROJECT_REF/sql/new"
echo ""
cat supabase/migrations/20260203000000_auto_create_profiles.sql
echo ""
echo ""
echo "✅ After running the SQL above, user signups will work automatically!"
echo ""
echo "Alternative: You can also run this with the Supabase CLI:"
echo "supabase db push --project-ref $PROJECT_REF"
