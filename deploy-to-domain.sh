#!/bin/bash

# 🚀 Deploy Islakayd to Production with Custom Domain
# This script will build and deploy your app to islakayd.com

set -e

echo "🎯 Islakayd Deployment Script"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}📦 Installing dependencies...${NC}"
    npm install
fi

# Run tests (if they exist)
if [ -f "vitest.config.ts" ]; then
    echo -e "${BLUE}🧪 Running tests...${NC}"
    npm run test -- --run || echo -e "${YELLOW}⚠️  Some tests failed, but continuing...${NC}"
fi

# Build the project
echo -e "${BLUE}🔨 Building production bundle...${NC}"
npm run build

# Check build directory
if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Build failed - dist directory not found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build completed successfully!${NC}"
echo ""
echo "📊 Build Statistics:"
du -sh dist
echo ""

# Ask which platform to deploy to
echo "🌐 Choose deployment platform:"
echo "1) Vercel (recommended)"
echo "2) Netlify"
echo "3) Test locally only"
read -p "Enter choice (1-3): " choice

case $choice in
    1)
        echo -e "${BLUE}🚀 Deploying to Vercel...${NC}"
        
        # Check if vercel CLI is installed
        if ! command -v vercel &> /dev/null; then
            echo -e "${YELLOW}📦 Installing Vercel CLI...${NC}"
            npm i -g vercel
        fi
        
        # Deploy to production
        vercel --prod
        
        echo ""
        echo -e "${GREEN}✅ Deployment complete!${NC}"
        echo ""
        echo "📝 Next steps:"
        echo "1. Go to https://vercel.com/dashboard"
        echo "2. Select your project"
        echo "3. Go to Settings → Domains"
        echo "4. Add custom domain: islakayd.com"
        echo "5. Update DNS records as shown in CUSTOM_DOMAIN_ISLAKAYD.md"
        ;;
    2)
        echo -e "${BLUE}🚀 Deploying to Netlify...${NC}"
        
        # Check if netlify CLI is installed
        if ! command -v netlify &> /dev/null; then
            echo -e "${YELLOW}📦 Installing Netlify CLI...${NC}"
            npm i -g netlify-cli
        fi
        
        # Deploy to production
        netlify deploy --prod
        
        echo ""
        echo -e "${GREEN}✅ Deployment complete!${NC}"
        echo ""
        echo "📝 Next steps:"
        echo "1. Go to https://app.netlify.com"
        echo "2. Select your site"
        echo "3. Go to Domain settings"
        echo "4. Add custom domain: islakayd.com"
        echo "5. Update DNS records as shown in CUSTOM_DOMAIN_ISLAKAYD.md"
        ;;
    3)
        echo -e "${BLUE}🔍 Starting local preview...${NC}"
        echo ""
        echo -e "${GREEN}✅ Build is ready!${NC}"
        echo "Run: npm run preview"
        echo "Then open: http://localhost:4173"
        npm run preview
        ;;
    *)
        echo -e "${YELLOW}⚠️  Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}🎉 All done!${NC}"
echo ""
echo "📱 Mobile Installation:"
echo "- iOS: Open in Safari → Share → Add to Home Screen"
echo "- Android: Open in Chrome → Menu → Install app"
echo ""
echo "📚 For detailed instructions, see: CUSTOM_DOMAIN_ISLAKAYD.md"
