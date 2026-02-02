#!/bin/bash

# 🧪 Complete Feature Testing Script
# Tests all features on your deployed site

echo "🧪 Testing All Islakayd Features"
echo "================================="
echo ""

SITE_URL="https://islakaydpro-ashley-mckinnons-projects.vercel.app"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

PASSED=0
FAILED=0

test_endpoint() {
    local name=$1
    local url=$2
    local expected=$3
    
    echo -n "Testing $name... "
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
    
    if [ "$response" = "$expected" ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $response)"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}✗ FAIL${NC} (Expected $expected, got $response)"
        FAILED=$((FAILED + 1))
    fi
}

echo "🌐 Core Endpoints"
echo "-----------------"
test_endpoint "Homepage" "$SITE_URL" "200"
test_endpoint "Static Assets" "$SITE_URL/assets/" "200"
test_endpoint "Service Worker" "$SITE_URL/sw.js" "200"
test_endpoint "Manifest" "$SITE_URL/manifest.json" "200"

echo ""
echo "📊 Summary"
echo "----------"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"

if [ $FAILED -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ All tests passed!${NC}"
    echo ""
    echo "Manual testing checklist:"
    echo "1. Visit: $SITE_URL"
    echo "2. ✓ Sign up for account"
    echo "3. ✓ Browse equipment"
    echo "4. ✓ Click AI assistant (bottom right)"
    echo "5. ✓ Compare equipment (add 2+ items)"
    echo "6. ✓ Test booking calendar"
    echo "7. ✓ Try voice search"
    echo "8. ✓ View 3D equipment viewer"
    echo "9. ✓ Check carbon tracker"
    echo "10. ✓ Test on mobile device"
    exit 0
else
    echo ""
    echo -e "${RED}❌ Some tests failed${NC}"
    exit 1
fi
