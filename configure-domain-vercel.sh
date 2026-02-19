#!/bin/bash

# Get Vercel token from environment variable
VERCEL_TOKEN="${VERCEL_TOKEN:-}"

if [ -z "$VERCEL_TOKEN" ]; then
  echo "❌ Error: VERCEL_TOKEN environment variable is not set"
  echo "Please set your Vercel token: export VERCEL_TOKEN='your_token_here'"
  exit 1
fi

echo ""
echo "🚀 Setting up www.islakayd.com on Vercel..."
echo "=========================================="
echo ""

# Step 1: Get project information
echo "📋 Step 1: Finding your Vercel project..."
PROJECT_INFO=$(curl -s "https://api.vercel.com/v9/projects/islakaydpro" \
  -H "Authorization: Bearer ${VERCEL_TOKEN}")

if echo "$PROJECT_INFO" | grep -q "error"; then
  echo "⚠️  Project not found with name 'islakaydpro'"
  echo "Let me search for your project..."
  
  # List all projects
  ALL_PROJECTS=$(curl -s "https://api.vercel.com/v9/projects" \
    -H "Authorization: Bearer ${VERCEL_TOKEN}")
  
  echo "$ALL_PROJECTS" | jq -r '.projects[] | "\(.name) - \(.id)"' 2>/dev/null || echo "$ALL_PROJECTS"
else
  PROJECT_ID=$(echo "$PROJECT_INFO" | jq -r '.id' 2>/dev/null)
  echo "✅ Found project: islakaydpro"
  echo "   Project ID: $PROJECT_ID"
fi

echo ""
echo "📋 Step 2: Adding www.islakayd.com..."

# Add www.islakayd.com
RESPONSE_WWW=$(curl -s -X POST "https://api.vercel.com/v10/projects/islakaydpro/domains" \
  -H "Authorization: Bearer ${VERCEL_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "www.islakayd.com"
  }')

if echo "$RESPONSE_WWW" | grep -q '"name":"www.islakayd.com"'; then
  echo "✅ www.islakayd.com added successfully!"
elif echo "$RESPONSE_WWW" | grep -q "already exists"; then
  echo "ℹ️  www.islakayd.com already configured"
else
  echo "Response: $RESPONSE_WWW"
fi

echo ""
echo "📋 Step 3: Adding root domain islakayd.com (for redirect)..."

# Add root domain
RESPONSE_ROOT=$(curl -s -X POST "https://api.vercel.com/v10/projects/islakaydpro/domains" \
  -H "Authorization: Bearer ${VERCEL_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "islakayd.com",
    "redirect": "www.islakayd.com"
  }')

if echo "$RESPONSE_ROOT" | grep -q '"name":"islakayd.com"'; then
  echo "✅ islakayd.com added successfully (redirects to www)"
elif echo "$RESPONSE_ROOT" | grep -q "already exists"; then
  echo "ℹ️  islakayd.com already configured"
else
  echo "Response: $RESPONSE_ROOT"
fi

echo ""
echo "📋 Step 4: Checking domain configuration..."

# Get domain info
DOMAINS=$(curl -s "https://api.vercel.com/v9/projects/islakaydpro/domains" \
  -H "Authorization: Bearer ${VERCEL_TOKEN}")

echo ""
echo "Current domains:"
echo "$DOMAINS" | jq -r '.domains[] | "  • \(.name) - \(.verified ? "✅ Verified" : "⏳ Pending verification")"' 2>/dev/null || echo "$DOMAINS"

echo ""
echo "════════════════════════════════════════"
echo ""
echo "✅ Domain configuration complete!"
echo ""
echo "📝 NEXT STEPS - DNS Configuration:"
echo ""
echo "You need to add these DNS records at your domain registrar:"
echo ""
echo "For www.islakayd.com:"
echo "  Type: CNAME"
echo "  Name: www"
echo "  Value: cname.vercel-dns.com"
echo ""
echo "For islakayd.com (root):"
echo "  Type: A"
echo "  Name: @"
echo "  Value: 76.76.21.21"
echo ""
echo "🔍 Check DNS propagation:"
echo "  https://www.whatsmydns.net/#CNAME/www.islakayd.com"
echo ""
echo "⏱️  DNS changes take 10-60 minutes to propagate"
echo "🔒 SSL will auto-configure after DNS is verified"
echo ""
echo "Your site will be live at: https://www.islakayd.com"
echo ""
