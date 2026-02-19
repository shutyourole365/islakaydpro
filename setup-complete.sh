#!/bin/bash
# Complete setup: Create user and seed equipment in one command

echo "🚀 ISLAKAYD - Complete Auto-Setup"
echo "=================================="
echo ""

# Step 1: Create user
echo "📝 Step 1: Creating demo user account..."
node create-user.cjs

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ User created successfully!"
  echo ""
  
  # Step 2: Wait a moment
  echo "⏳ Waiting 2 seconds for profile setup..."
  sleep 2
  
  # Step 3: Seed equipment
  echo ""
  echo "📦 Step 2: Seeding equipment database..."
  npm run seed:equipment
  
  if [ $? -eq 0 ]; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🎉 SUCCESS! Your marketplace is ready!"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "📧 Demo Account:"
    echo "   Email: demo@islakayd.com"
    echo "   Password: Demo123456!"
    echo ""
    echo "🌐 View your site:"
    echo "   Local: http://localhost:5173"
    echo "   Live: https://islakayd.com"
    echo ""
    echo "📊 You now have:"
    echo "   ✅ 15 professional equipment listings"
    echo "   ✅ Multiple categories"
    echo "   ✅ Realistic pricing"
    echo "   ✅ Professional descriptions"
    echo ""
    echo "🚀 Next steps:"
    echo "   1. Visit http://localhost:5173"
    echo "   2. Sign in with demo account"
    echo "   3. Browse your equipment"
    echo "   4. Follow START_HERE_NOW.md for launch"
    echo ""
  else
    echo "❌ Seeding failed"
    exit 1
  fi
else
  echo "❌ User creation failed"
  exit 1
fi
