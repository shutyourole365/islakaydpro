#!/bin/bash

echo "🚀 Local Netlify Deployment for Islakayd"
echo "=========================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "netlify.toml" ]; then
    echo "❌ Error: Please run this script from your islakaydpro project directory"
    echo "   cd /path/to/your/islakaydpro/folder"
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo ""
echo "🔧 Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please check the errors above."
    exit 1
fi

echo ""
echo "✅ Build successful!"
echo ""

echo "🔐 Checking Netlify CLI..."
if ! command -v netlify &> /dev/null; then
    echo "📥 Installing Netlify CLI..."
    npm install -g netlify-cli
fi

echo ""
echo "🌐 Please login to Netlify (this will open your browser):"
echo "   Run: netlify login"
echo "   Complete the login in your browser, then press Enter here"
read -p "Press Enter after you've logged in to Netlify..."

echo ""
echo "🚀 Deploying to Netlify..."
netlify deploy --prod --dir=dist --build

if [ $? -ne 0 ]; then
    echo "❌ Deployment failed! Please check the errors above."
    exit 1
fi

echo ""
echo "🎉 Deployment successful!"
echo ""
echo "📝 Next steps:"
echo "1. Copy the deployment URL shown above"
echo "2. Go to https://app.netlify.com"
echo "3. Find your new site"
echo "4. Go to Site settings → Domain management"
echo "5. Add custom domain: islakayd.com"