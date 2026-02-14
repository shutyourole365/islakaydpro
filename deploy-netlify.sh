#!/bin/bash#!/bin/bash

































echo "5. Transfer the domain from your old site"echo "4. Add custom domain: islakayd.com"echo "3. Go to Site settings → Domain management"echo "2. Find your new site"echo "1. Go to https://app.netlify.com"echo "📝 Next steps:"echo "🎉 Deployment complete!"echo ""netlify deploy --prod --dir=distecho "🌐 Deploying to Netlify..."# Deploy to Netlifyecho "✅ Build successful!"fi    exit 1    echo "❌ Build failed!"if [ $? -ne 0 ]; thennpm run buildecho "📦 Building project..."# Build the projectfi    npm install -g netlify-cli    echo "❌ Netlify CLI not found. Installing..."if ! command -v netlify &> /dev/null; then# Check if netlify CLI is installedecho ""echo "🚀 Deploying Islakayd to Netlify..."
echo "🚀 Deploying Islakayd to Netlify..."
echo ""

# Check if netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "📦 Installing Netlify CLI..."
    npm install -g netlify-cli
fi

# Check if logged in
if ! netlify status &> /dev/null; then
    echo "🔐 Please login to Netlify:"
    netlify login
fi

# Deploy the site
echo "🏗️  Building and deploying..."
netlify deploy --prod --dir=dist --build

echo ""
echo "✅ Deployment complete!"
echo "🌐 Your site should be live at the URL shown above"
echo ""
echo "Next steps:"
echo "1. Copy the deployment URL"
echo "2. Go to Netlify dashboard → Site settings → Domain management"
echo "3. Add custom domain: islakayd.com"
echo "4. Transfer the domain from your old site"