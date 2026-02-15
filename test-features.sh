#!/bin/bash

# 🧪 Features Configuration Test Script
# Tests all configured features and services

echo "🧪 Testing Islakayd Features Configuration"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0
TOTAL=0

# Function to test feature
test_feature() {
    local name=$1
    local env_var=$2
    local optional=$3
    
    TOTAL=$((TOTAL + 1))
    
    echo -n "Testing $name... "
    
    if [ -z "$env_var" ]; then
        value=$(grep "^VITE_" .env.local 2>/dev/null | grep "$name" | cut -d'=' -f2)
    else
        value=$(grep "^$env_var=" .env.local 2>/dev/null | cut -d'=' -f2)
    fi
    
    if [ -n "$value" ] && [ "$value" != "your-" ] && [ "$value" != "pk_test_" ]; then
        echo -e "${GREEN}✓ CONFIGURED${NC}"
        PASSED=$((PASSED + 1))
        return 0
    else
        if [ "$optional" = "optional" ]; then
            echo -e "${YELLOW}⚠ NOT SET (Optional)${NC}"
            PASSED=$((PASSED + 1))
        else
            echo -e "${RED}✗ NOT CONFIGURED${NC}"
            FAILED=$((FAILED + 1))
        fi
        return 1
    fi
}

echo -e "${BLUE}📋 Required Features${NC}"
echo "-------------------"
test_feature "Supabase URL" "VITE_SUPABASE_URL" "required"
test_feature "Supabase Anon Key" "VITE_SUPABASE_ANON_KEY" "required"
echo ""

echo -e "${BLUE}🎯 Core Features${NC}"
echo "----------------"
test_feature "PWA Support" "VITE_ENABLE_PWA" "optional"
test_feature "AI Assistant" "VITE_ENABLE_AI_ASSISTANT" "optional"
test_feature "Analytics" "VITE_ENABLE_ANALYTICS" "optional"
test_feature "App URL" "VITE_APP_URL" "optional"
echo ""

echo -e "${BLUE}🔧 Optional Integrations${NC}"
echo "-----------------------"
test_feature "Google Analytics" "VITE_GA_MEASUREMENT_ID" "optional"
test_feature "Sentry Error Tracking" "VITE_SENTRY_DSN" "optional"
test_feature "Stripe Payments" "VITE_STRIPE_PUBLISHABLE_KEY" "optional"
echo ""

# Check if build passes
echo -e "${BLUE}🏗️  Build Verification${NC}"
echo "--------------------"
echo "Running production build..."

if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Build successful${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}✗ Build failed${NC}"
    FAILED=$((FAILED + 1))
fi
TOTAL=$((TOTAL + 1))
echo ""

# Check service worker
echo -e "${BLUE}🔄 Service Worker${NC}"
echo "----------------"
if [ -f "public/sw.js" ]; then
    echo -e "${GREEN}✓ Service worker exists${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "${YELLOW}⚠ Service worker not found${NC}"
    PASSED=$((PASSED + 1))
fi
TOTAL=$((TOTAL + 1))
echo ""

# Summary
echo "=========================================="
echo -e "${BLUE}📊 Test Summary${NC}"
echo "=========================================="
echo -e "Total Tests: $TOTAL"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed!${NC}"
    echo ""
    echo "Your Islakayd platform is ready for production!"
    echo ""
    echo "Next steps:"
    echo "1. Deploy: vercel --prod"
    echo "2. Visit your app and test features"
    echo "3. Configure optional services (see ADDITIONAL_FEATURES_SETUP.md)"
    exit 0
else
    echo -e "${RED}❌ Some tests failed${NC}"
    echo ""
    echo "Please fix the failed configurations before deploying."
    echo "See ADDITIONAL_FEATURES_SETUP.md for setup instructions."
    exit 1
fi
