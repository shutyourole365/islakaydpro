#!/bin/bash

echo "🔧 Setting up Netlify environment variables..."
echo ""

# Set environment variables for Netlify deployment
netlify env:set VITE_SUPABASE_URL "https://ialxlykysbqyiejepzkx.supabase.co"
netlify env:set VITE_SUPABASE_ANON_KEY "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhbHhseWt5c2JxeWllamVwemt4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxNDY2ODgsImV4cCI6MjA4NDcyMjY4OH0.xVQYWWYZDc2YSsTEgTGhCjyArgwrhaXgGaCZAk1fqZs"
netlify env:set VITE_APP_URL "https://islakayd.com"
netlify env:set VITE_GA_MEASUREMENT_ID "G-XXXXXXXXXX"
netlify env:set VITE_ENABLE_ANALYTICS "false"
netlify env:set VITE_ENABLE_AI_CHAT "true"
netlify env:set VITE_ENABLE_AR_PREVIEW "false"
netlify env:set VITE_ENABLE_BIOMETRIC_AUTH "false"

echo "✅ Environment variables set!"
echo ""
echo "Now run: ./deploy-netlify.sh"