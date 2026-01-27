#!/bin/bash
# ================================================
# PRODUCTION DEPLOYMENT SCRIPT
# ================================================
# This script prepares and validates your app for deployment

set -e

echo "🚀 Islakayd Production Deployment Preparation"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Environment Check
echo "📋 Step 1: Checking environment variables..."
if node check-env.cjs; then
    echo -e "${GREEN}✅ Environment variables OK${NC}"
else
    echo -e "${RED}❌ Environment check failed${NC}"
    echo "Please fix environment variables and try again"
    exit 1
fi
echo ""

# Step 2: Run Tests
echo "🧪 Step 2: Running tests..."
if npm test -- --run; then
    echo -e "${GREEN}✅ Tests passed${NC}"
else
    echo -e "${RED}❌ Tests failed${NC}"
    exit 1
fi
echo ""

# Step 3: TypeScript Check
echo "📝 Step 3: TypeScript validation..."
if npm run typecheck; then
    echo -e "${GREEN}✅ TypeScript check passed${NC}"
else
    echo -e "${RED}❌ TypeScript errors found${NC}"
    exit 1
fi
echo ""

# Step 4: Lint Check
echo "🔍 Step 4: Linting code..."
if npm run lint; then
    echo -e "${GREEN}✅ Lint check passed${NC}"
else
    echo -e "${YELLOW}⚠️  Lint warnings found (non-blocking)${NC}"
fi
echo ""

# Step 5: Production Build
echo "🔨 Step 5: Building for production..."
if npm run build; then
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi
echo ""

# Step 6: Bundle Size Check
echo "📦 Step 6: Checking bundle size..."
MAIN_BUNDLE=$(ls -lh dist/assets/index-*.js | awk '{print $5}')
echo "Main bundle size: $MAIN_BUNDLE"
if [[ "$MAIN_BUNDLE" == *"M"* ]]; then
    echo -e "${YELLOW}⚠️  Bundle is larger than 1MB${NC}"
    echo "Consider running Priority #5: Bundle Optimization"
else
    echo -e "${GREEN}✅ Bundle size acceptable${NC}"
fi
echo ""

# Summary
echo "=============================================="
echo -e "${GREEN}🎉 Deployment Preparation Complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Choose deployment platform:"
echo "   - Vercel: https://vercel.com/new"
echo "   - Netlify: https://app.netlify.com/start"
echo ""
echo "2. Import repository: shutyourole365/islakaydpro"
echo ""
echo "3. Add environment variables (from .env.local)"
echo ""
echo "4. Deploy and enjoy! 🚀"
echo ""
echo "📖 Full guide: See DEPLOYMENT.md"
echo "=============================================="
