#!/bin/bash

# 🚀 Islakayd Quick Start Helper
# This script will guide you through the setup

echo "═══════════════════════════════════════════════════════════"
echo "🚀 ISLAKAYD QUICK START"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ .env.local not found!"
    echo "Creating from template..."
    cp .env.example .env.local
    echo "✅ Created .env.local"
    echo ""
fi

# Check if Supabase credentials are configured
if grep -q "your-project-id" .env.local || grep -q "your-anon-key-here" .env.local; then
    echo "⚠️  CREDENTIALS NEEDED"
    echo "───────────────────────────────────────────────────────────"
    echo ""
    echo "Your .env.local file has placeholder values."
    echo "You need to add your REAL Supabase credentials."
    echo ""
    echo "📋 HERE'S WHAT TO DO (Takes 5 minutes):"
    echo ""
    echo "1. Open a new browser tab:"
    echo "   👉 https://supabase.com/"
    echo ""
    echo "2. Sign up (free - no credit card needed)"
    echo ""
    echo "3. Click 'New Project'"
    echo "   - Name: islakayd"
    echo "   - Database Password: (choose a strong password)"
    echo "   - Region: (closest to you)"
    echo "   - Wait ~2 minutes for setup"
    echo ""
    echo "4. Once ready, go to: Settings → API"
    echo ""
    echo "5. Copy these TWO values:"
    echo "   ✅ Project URL (starts with https://)"
    echo "   ✅ Project API Key (anon public) - long string starting with 'eyJ'"
    echo ""
    echo "6. Open .env.local and paste them:"
    echo "   📝 code .env.local"
    echo ""
    echo "   Replace these lines:"
    echo "   VITE_SUPABASE_URL=https://YOUR-ACTUAL-PROJECT-ID.supabase.co"
    echo "   VITE_SUPABASE_ANON_KEY=eyJYOUR-ACTUAL-KEY-HERE"
    echo ""
    echo "7. Save the file"
    echo ""
    echo "8. Come back here and run: ./quick-start.sh"
    echo ""
    echo "═══════════════════════════════════════════════════════════"
    exit 0
fi

# If we get here, credentials are configured
echo "✅ Supabase credentials configured!"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed!"
    echo ""
fi

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "📥 Installing Supabase CLI..."
    npm install -g supabase
    echo "✅ Supabase CLI installed!"
    echo ""
fi

# Extract project ID from URL
SUPABASE_URL=$(grep VITE_SUPABASE_URL .env.local | cut -d '=' -f 2 | tr -d ' ')
PROJECT_ID=$(echo $SUPABASE_URL | sed 's|https://||' | sed 's/.supabase.co//')

echo "🗄️  Setting up database..."
echo ""
echo "This will create all tables, security policies, and indexes."
echo ""
read -p "Press Enter to continue or Ctrl+C to cancel..."

# Link to Supabase project
echo ""
echo "🔗 Linking to your Supabase project..."
supabase link --project-ref $PROJECT_ID

# Push database migrations
echo ""
echo "📤 Pushing database schema..."
supabase db push

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "✅ SETUP COMPLETE!"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "🎉 Your platform is ready to run!"
echo ""
echo "Start the development server:"
echo "  👉 npm run dev"
echo ""
echo "Then open in your browser:"
echo "  👉 http://localhost:5173"
echo ""
echo "First-time setup checklist:"
echo "  ✅ Create a test account"
echo "  ✅ Add some equipment listings"
echo "  ✅ Test the booking flow"
echo "  ✅ Explore all features"
echo ""
echo "📚 Next steps:"
echo "  📖 Read: READY_TO_LAUNCH.md (your roadmap)"
echo "  🎯 Review: PRODUCTION_CHECKLIST.md (before launch)"
echo "  🔧 Keep: TROUBLESHOOTING.md (handy reference)"
echo ""
echo "💪 You're building something amazing for your daughter!"
echo "═══════════════════════════════════════════════════════════"
