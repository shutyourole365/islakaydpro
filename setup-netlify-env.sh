#!/bin/bash

echo "🔧 Setting up Netlify environment variables..."
echo ""

# Set environment variables for Netlify deployment
# IMPORTANT: Replace placeholder values with your actual keys before running
# Or set them as environment variables first:
#   export VITE_SUPABASE_URL="https://your-project.supabase.co"
#   export VITE_SUPABASE_ANON_KEY="your-anon-key"

if [ -z "$VITE_SUPABASE_URL" ] || [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
  echo "❌ Error: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set as environment variables"
  echo "   export VITE_SUPABASE_URL='https://your-project.supabase.co'"
  echo "   export VITE_SUPABASE_ANON_KEY='your-anon-key'"
  exit 1
fi

netlify env:set VITE_SUPABASE_URL "$VITE_SUPABASE_URL"
netlify env:set VITE_SUPABASE_ANON_KEY "$VITE_SUPABASE_ANON_KEY"
netlify env:set VITE_APP_URL "https://islakayd.com"
netlify env:set VITE_GA_MEASUREMENT_ID "G-XXXXXXXXXX"
netlify env:set VITE_ENABLE_ANALYTICS "false"
netlify env:set VITE_ENABLE_AI_CHAT "true"
netlify env:set VITE_ENABLE_AR_PREVIEW "false"
netlify env:set VITE_ENABLE_BIOMETRIC_AUTH "false"

echo "✅ Environment variables set!"
echo ""
echo "Now run: ./deploy-netlify.sh"
