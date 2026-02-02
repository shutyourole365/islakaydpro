#!/bin/bash

# 🚀 Complete Setup Script - All Features
# This script will guide you through setting up ALL optional services

echo "🚀 Islakayd Complete Setup - All Features"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}This will set up:${NC}"
echo "1. Google Analytics 4"
echo "2. Sentry Error Tracking"
echo "3. Stripe Payments"
echo "4. Email Service (Resend)"
echo "5. Image Optimization (Cloudinary)"
echo "6. Push Notifications (OneSignal)"
echo "7. Advanced Search (Algolia)"
echo ""

read -p "Continue? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 0
fi

echo ""
echo -e "${GREEN}=== 1. Google Analytics 4 ===${NC}"
echo "1. Go to: https://analytics.google.com"
echo "2. Create new property"
echo "3. Copy your Measurement ID (G-XXXXXXXXXX)"
echo ""
read -p "Enter your GA4 Measurement ID: " GA_ID
if [ -n "$GA_ID" ]; then
    vercel env add VITE_GA_MEASUREMENT_ID production <<< "$GA_ID"
    echo -e "${GREEN}✓ Google Analytics configured${NC}"
else
    echo -e "${YELLOW}⊘ Skipped${NC}"
fi

echo ""
echo -e "${GREEN}=== 2. Sentry Error Tracking ===${NC}"
echo "1. Go to: https://sentry.io"
echo "2. Create React project"
echo "3. Copy your DSN"
echo ""
read -p "Enter your Sentry DSN: " SENTRY_DSN
if [ -n "$SENTRY_DSN" ]; then
    vercel env add VITE_SENTRY_DSN production <<< "$SENTRY_DSN"
    echo -e "${GREEN}✓ Sentry configured${NC}"
else
    echo -e "${YELLOW}⊘ Skipped${NC}"
fi

echo ""
echo -e "${GREEN}=== 3. Stripe Payments ===${NC}"
echo "1. Go to: https://dashboard.stripe.com"
echo "2. Get publishable key (pk_live_...)"
echo ""
read -p "Enter your Stripe Publishable Key: " STRIPE_KEY
if [ -n "$STRIPE_KEY" ]; then
    vercel env add VITE_STRIPE_PUBLISHABLE_KEY production <<< "$STRIPE_KEY"
    echo -e "${GREEN}✓ Stripe configured${NC}"
else
    echo -e "${YELLOW}⊘ Skipped${NC}"
fi

echo ""
echo -e "${GREEN}=== 4. Email Service (Resend) ===${NC}"
echo "1. Go to: https://resend.com"
echo "2. Create API key"
echo ""
read -p "Enter your Resend API Key: " RESEND_KEY
if [ -n "$RESEND_KEY" ]; then
    vercel env add RESEND_API_KEY production <<< "$RESEND_KEY"
    echo -e "${GREEN}✓ Resend configured${NC}"
else
    echo -e "${YELLOW}⊘ Skipped${NC}"
fi

echo ""
echo -e "${GREEN}=== 5. Cloudinary ===${NC}"
echo "1. Go to: https://cloudinary.com"
echo "2. Get your Cloud Name"
echo ""
read -p "Enter your Cloudinary Cloud Name: " CLOUD_NAME
if [ -n "$CLOUD_NAME" ]; then
    vercel env add VITE_CLOUDINARY_CLOUD_NAME production <<< "$CLOUD_NAME"
    echo -e "${GREEN}✓ Cloudinary configured${NC}"
else
    echo -e "${YELLOW}⊘ Skipped${NC}"
fi

echo ""
echo -e "${GREEN}=== 6. OneSignal Push Notifications ===${NC}"
echo "1. Go to: https://onesignal.com"
echo "2. Create Web Push app"
echo "3. Copy App ID"
echo ""
read -p "Enter your OneSignal App ID: " ONESIGNAL_ID
if [ -n "$ONESIGNAL_ID" ]; then
    vercel env add VITE_ONESIGNAL_APP_ID production <<< "$ONESIGNAL_ID"
    echo -e "${GREEN}✓ OneSignal configured${NC}"
else
    echo -e "${YELLOW}⊘ Skipped${NC}"
fi

echo ""
echo -e "${GREEN}=== 7. Algolia Search ===${NC}"
echo "1. Go to: https://algolia.com"
echo "2. Get Application ID and Search-Only API Key"
echo ""
read -p "Enter your Algolia App ID: " ALGOLIA_APP
read -p "Enter your Algolia Search Key: " ALGOLIA_KEY
if [ -n "$ALGOLIA_APP" ] && [ -n "$ALGOLIA_KEY" ]; then
    vercel env add VITE_ALGOLIA_APP_ID production <<< "$ALGOLIA_APP"
    vercel env add VITE_ALGOLIA_SEARCH_KEY production <<< "$ALGOLIA_KEY"
    echo -e "${GREEN}✓ Algolia configured${NC}"
else
    echo -e "${YELLOW}⊘ Skipped${NC}"
fi

echo ""
echo -e "${GREEN}=========================================="
echo "🎉 Configuration Complete!"
echo "==========================================${NC}"
echo ""
echo "Redeploying with new configuration..."
vercel --prod

echo ""
echo -e "${GREEN}✓ All done!${NC}"
echo ""
echo "Your site: https://islakaydpro-ashley-mckinnons-projects.vercel.app"
echo ""
