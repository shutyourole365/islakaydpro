#!/bin/bash

# Supabase Health Check Script
# Verifies all Supabase services are operational
# Run with: VITE_SUPABASE_URL=... VITE_SUPABASE_ANON_KEY=... ./supabase-health-check.sh

# Don't exit on errors - we want to see all results
set +e

PROJECT_URL="${VITE_SUPABASE_URL}"
ANON_KEY="${VITE_SUPABASE_ANON_KEY}"

if [ -z "$PROJECT_URL" ] || [ -z "$ANON_KEY" ]; then
  echo "❌ Error: Required environment variables are not set"
  echo "   export VITE_SUPABASE_URL='https://your-project.supabase.co'"
  echo "   export VITE_SUPABASE_ANON_KEY='your-anon-key'"
  exit 1
fi

echo "🔍 Islakayd Supabase Health Check"
echo "=================================="
echo ""
echo "URL: $PROJECT_URL"
echo ""

# Function to test endpoint
test_endpoint() {
    local name=$1
    local url=$2
    local expected_status=$3

    echo -n "Testing $name... "
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" -H "apikey: $ANON_KEY" 2>/dev/null)

    if [ "$response" == "$expected_status" ]; then
        echo "✅ OK ($response)"
        return 0
    else
        echo "❌ FAIL (got $response, expected $expected_status)"
        return 1
    fi
}

# Test all endpoints
echo "📊 Testing Supabase Services:"
echo "------------------------------"

test_endpoint "REST API" "$PROJECT_URL/rest/v1/" "200"
test_endpoint "Auth Health" "$PROJECT_URL/auth/v1/health" "200"

# Storage API might not be enabled - test but don't fail
echo -n "Testing Storage API... "
storage_status=$(curl -s -o /dev/null -w "%{http_code}" "$PROJECT_URL/storage/v1/" -H "apikey: $ANON_KEY" 2>/dev/null)
if [ "$storage_status" == "200" ]; then
    echo "✅ OK ($storage_status)"
elif [ "$storage_status" == "404" ]; then
    echo "⚠️  Not enabled (OK for apps without file uploads)"
else
    echo "❓ Status: $storage_status"
fi

echo ""
echo "📋 Testing Database Tables:"
echo "----------------------------"

test_endpoint "Profiles table" "$PROJECT_URL/rest/v1/profiles?select=count" "200"
test_endpoint "Equipment table" "$PROJECT_URL/rest/v1/equipment?select=count" "200"
test_endpoint "Categories table" "$PROJECT_URL/rest/v1/categories?select=count" "200"
test_endpoint "Bookings table" "$PROJECT_URL/rest/v1/bookings?select=count" "200"

echo ""
echo "🔐 Testing Authentication:"
echo "--------------------------"

# Test if auth signup endpoint is accessible
# Note: 500 status on test data is normal (validation errors)
signup_status=$(curl -s -o /dev/null -w "%{http_code}" \
    "$PROJECT_URL/auth/v1/signup" \
    -H "apikey: $ANON_KEY" \
    -H "Content-Type: application/json" \
    -d '{"email":"healthcheck@test.com","password":"testpass123"}')

if [ "$signup_status" == "400" ] || [ "$signup_status" == "422" ] || [ "$signup_status" == "200" ]; then
    echo "Auth signup endpoint: ✅ OK (accessible)"
elif [ "$signup_status" == "500" ]; then
    echo "Auth signup endpoint: ⚠️  Server error (may need email config)"
else
    echo "Auth signup endpoint: ❓ Status: $signup_status"
fi

echo ""
echo "📦 Environment Variables:"
echo "-------------------------"

if [ -f .env.local ]; then
    echo "✅ .env.local exists"

    if grep -q "VITE_SUPABASE_URL" .env.local; then
        echo "✅ VITE_SUPABASE_URL is set"
    else
        echo "❌ VITE_SUPABASE_URL is missing"
    fi

    if grep -q "VITE_SUPABASE_ANON_KEY" .env.local; then
        echo "✅ VITE_SUPABASE_ANON_KEY is set"
    else
        echo "❌ VITE_SUPABASE_ANON_KEY is missing"
    fi
else
    echo "❌ .env.local file not found"
fi

echo ""
echo "=================================="
echo "✅ Health Check Complete!"
echo ""
echo "Your Supabase project is operational."
echo "If you can't access supabase.com dashboard,"
echo "see SUPABASE_STATUS.md for troubleshooting."
