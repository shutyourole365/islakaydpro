#!/bin/bash

# Get Vercel token from environment variable
VERCEL_TOKEN="${VERCEL_TOKEN:-}"

if [ -z "$VERCEL_TOKEN" ]; then
  echo "❌ Error: VERCEL_TOKEN environment variable is not set"
  echo "Please set your Vercel token: export VERCEL_TOKEN='your_token_here'"
  exit 1
fi

echo ""
echo "🔍 Verifying Domain Configuration"
echo "=================================="
echo ""

# Get all domains for the project
echo "📋 Fetching domain status..."
DOMAINS=$(curl -s "https://api.vercel.com/v9/projects/islakaydpro/domains" \
  -H "Authorization: Bearer ${VERCEL_TOKEN}")

echo ""
if command -v jq &> /dev/null; then
  echo "$DOMAINS" | jq -r '.domains[] | "Domain: \(.name)\nStatus: \(.verified ? "✅ Verified & Active" : "⏳ Awaiting DNS Configuration")\nSSL: \(.verified ? "🔒 Enabled" : "⏳ Pending")\n"'
else
  echo "$DOMAINS"
fi

echo ""
echo "════════════════════════════════════════"
echo ""
echo "To complete setup, add these DNS records:"
echo ""
echo "🌐 www.islakayd.com"
echo "   Type: CNAME"
echo "   Name: www"  
echo "   Value: cname.vercel-dns.com"
echo ""
echo "🌐 islakayd.com (root)"
echo "   Type: A"
echo "   Name: @ (or blank)"
echo "   Value: 76.76.21.21"
echo ""
echo "Where to add these:"
echo "• Go to your domain registrar (where you bought islakayd.com)"
echo "• Find DNS settings / DNS management"
echo "• Add the records above"
echo "• Save changes"
echo ""
echo "⏱️  Wait 10-60 minutes for DNS propagation"
echo ""
