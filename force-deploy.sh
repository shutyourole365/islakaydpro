#!/bin/bash

echo ""
echo "🚀 FORCING DEPLOYMENT TO PRODUCTION"
echo "===================================="
echo ""

# Check if vercel CLI is installed
if command -v vercel &> /dev/null; then
    echo "📦 Using Vercel for deployment..."
    echo ""
    vercel --prod --yes
    echo ""
    echo "✅ Vercel deployment triggered!"
elif command -v netlify &> /dev/null; then
    echo "📦 Using Netlify for deployment..."
    echo ""
    netlify deploy --prod
    echo ""
    echo "✅ Netlify deployment triggered!"
else
    echo "⚠️  No deployment CLI found"
    echo ""
    echo "Your changes have been pushed to GitHub."
    echo "The deployment should auto-trigger in 1-2 minutes."
    echo ""
    echo "If it doesn't update:"
    echo "1. Go to your hosting dashboard (Vercel/Netlify)"
    echo "2. Click 'Redeploy' or 'Trigger Deploy'"
    echo "3. Wait 2-3 minutes for build to complete"
    echo ""
    echo "Or try clearing your browser cache:"
    echo "  • Chrome/Edge: Ctrl+Shift+R (Cmd+Shift+R on Mac)"
    echo "  • Firefox: Ctrl+F5 (Cmd+Shift+R on Mac)"
    echo "  • Safari: Cmd+Option+R"
    echo ""
fi

echo "🌐 Your site: https://www.islakayd.com"
echo ""
echo "⏱️  Deployment usually takes 2-3 minutes"
echo "💡 Try hard refresh (Ctrl+Shift+R) after deployment"
echo ""
