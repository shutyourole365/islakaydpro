#!/bin/bash
# =============================================================================
# ISLAKAYD MOBILE APP BUILD SCRIPT
# =============================================================================
# Run this script on your local machine (Mac for iOS, any OS for Android)
# This will guide you through building and preparing the app for the stores
# =============================================================================

set -e

echo "============================================="
echo "  ISLAKAYD MOBILE APP BUILD SCRIPT"
echo "============================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the islakaydpro directory"
    echo "   cd islakaydpro && ./build-mobile.sh"
    exit 1
fi

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed"
    echo "   Install from: https://nodejs.org"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Build the web app
echo ""
echo "🔨 Building web application..."
npm run build

# Sync with native platforms
echo ""
echo "📱 Syncing with native platforms..."
npx cap sync

echo ""
echo "============================================="
echo "  BUILD COMPLETE!"
echo "============================================="
echo ""

# Detect OS and provide instructions
OS=$(uname -s)

if [ "$OS" = "Darwin" ]; then
    echo "🍎 macOS detected - You can build for both iOS and Android"
    echo ""
    echo "Choose an option:"
    echo "  1) Open iOS project in Xcode"
    echo "  2) Open Android project in Android Studio"
    echo "  3) Both"
    echo "  4) Exit"
    echo ""
    read -p "Enter choice [1-4]: " choice
    
    case $choice in
        1)
            echo "Opening Xcode..."
            npx cap open ios
            ;;
        2)
            echo "Opening Android Studio..."
            npx cap open android
            ;;
        3)
            echo "Opening both..."
            npx cap open ios
            npx cap open android
            ;;
        4)
            echo "Done!"
            ;;
        *)
            echo "Invalid choice"
            ;;
    esac
else
    echo "🤖 Linux/Windows detected - You can build for Android"
    echo ""
    read -p "Open Android project in Android Studio? [y/N]: " choice
    
    if [ "$choice" = "y" ] || [ "$choice" = "Y" ]; then
        npx cap open android
    fi
fi

echo ""
echo "============================================="
echo "  NEXT STEPS"
echo "============================================="
echo ""
echo "📖 See MOBILE_APP_DEPLOYMENT.md for full instructions"
echo ""
echo "iOS App Store:"
echo "  1. In Xcode: Product → Archive"
echo "  2. Click 'Distribute App' → 'App Store Connect'"
echo "  3. Upload and submit in App Store Connect"
echo ""
echo "Google Play Store:"
echo "  1. In Android Studio: Build → Generate Signed Bundle"
echo "  2. Select 'Android App Bundle'"
echo "  3. Upload AAB to Google Play Console"
echo ""
