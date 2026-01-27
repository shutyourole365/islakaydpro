#!/bin/bash

# Islakayd Quick Start Script
# This script helps you set up the project quickly

echo "🏗️  Islakayd Equipment Rental Platform - Quick Start"
echo "=================================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node --version) detected"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi

echo "✅ npm $(npm --version) detected"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"
echo ""

# Copy environment file if it doesn't exist
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file..."
    cp .env.example .env.local
    echo "✅ .env.local created from .env.example"
    echo "⚠️  IMPORTANT: Edit .env.local with your Supabase credentials!"
    echo ""
else
    echo "✅ .env.local already exists"
    echo ""
fi

# Run type check
echo "🔍 Running type check..."
npm run typecheck

if [ $? -ne 0 ]; then
    echo "⚠️  Type check found some issues, but continuing..."
else
    echo "✅ Type check passed"
fi
echo ""

# Run linter
echo "🧹 Running linter..."
npm run lint

if [ $? -ne 0 ]; then
    echo "⚠️  Linting found some issues, but continuing..."
else
    echo "✅ Linting passed"
fi
echo ""

# Run tests
echo "🧪 Running tests..."
npm run test:run

if [ $? -ne 0 ]; then
    echo "⚠️  Some tests failed, but continuing..."
else
    echo "✅ All tests passed"
fi
echo ""

echo "=================================================="
echo "🎉 Setup Complete!"
echo "=================================================="
echo ""
echo "Next steps:"
echo ""
echo "1. Configure your environment:"
echo "   Edit .env.local with your Supabase credentials"
echo ""
echo "2. Start the development server:"
echo "   npm run dev"
echo ""
echo "3. Open your browser:"
echo "   http://localhost:5173"
echo ""
echo "4. Read the documentation:"
echo "   - README.md - Project overview"
echo "   - DEPLOYMENT.md - Deployment guide"
echo "   - CONTRIBUTING.md - How to contribute"
echo ""
echo "Need help? Check PROJECT_STATUS.md for complete details."
echo ""
echo "Happy coding! 🚀"
