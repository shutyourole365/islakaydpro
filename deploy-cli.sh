#!/bin/bash

echo "🚀 Deploying Islakayd to Netlify via CLI..."
echo ""

# Build the project first
echo "📦 Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build successful!"
echo ""

# Login to Netlify (if not already logged in)
echo "🔐 Checking Netlify login..."
if ! netlify status &> /dev/null; then
    echo "Please run: netlify login"
    echo "Then come back and run this script again."
    exit 1
fi

echo "✅ Logged in to Netlify"
echo ""

# Deploy to Netlify
echo "🌐 Deploying to Netlify..."
echo "This will create a new site and deploy your app."
echo ""

netlify deploy --prod --dir=dist --build

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "1. Copy the deployment URL shown above"
echo "2. Go to https://app.netlify.com"
echo "3. Find your new site"
echo "4. Go to Site settings → Domain management"
echo "5. Add custom domain: islakayd.com"
echo "6. Transfer the domain from your old site"