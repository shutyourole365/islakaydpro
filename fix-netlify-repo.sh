#!/bin/bash

echo "🔧 Fixing Netlify Repository Link..."
echo ""

# Check if netlify CLI is available
if ! command -v netlify &> /dev/null; then
    echo "📦 Installing Netlify CLI..."
    npm install -g netlify-cli
fi

# Login to Netlify (if not already logged in)
echo "🔐 Checking Netlify login..."
if ! netlify status &> /dev/null; then
    echo "Please login to Netlify:"
    netlify login
fi

# List sites to find the correct one
echo "📋 Your Netlify sites:"
netlify sites:list

echo ""
echo "🔍 Find your site in the list above (look for islakaydpro or similar)"
echo "📝 Copy the SITE ID from the list"
echo ""
read -p "Enter your SITE ID: " SITE_ID

if [ -z "$SITE_ID" ]; then
    echo "❌ No SITE ID provided. Exiting."
    exit 1
fi

# Update repository link
echo "🔗 Updating repository link to: https://github.com/shutyourole365/islakaydpro"
netlify api updateSite --data "{\"repo\":{\"url\":\"https://github.com/shutyourole365/islakaydpro\",\"provider\":\"github\",\"branch\":\"main\"}}" "$SITE_ID"

# Trigger a new deploy
echo "🚀 Triggering new deployment..."
netlify api createDeploy --data "{\"site_id\":\"$SITE_ID\"}"

echo ""
echo "✅ Repository link updated!"
echo "🌐 Check your Netlify dashboard for the new deployment"
echo ""
echo "📝 Next steps:"
echo "1. Go to https://app.netlify.com"
echo "2. Find your site and check the deployment status"
echo "3. Add the custom domain: islakayd.com"
echo "   - Go to Site settings > Domain management"
echo "   - Click 'Add custom domain'"
echo "   - Enter: islakayd.com"
echo "4. Configure DNS records at your registrar:"
echo "   - A record: @ -> 75.2.60.5"
echo "   - CNAME: www -> [your-site].netlify.app"