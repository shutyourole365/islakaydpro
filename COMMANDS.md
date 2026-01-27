# 📋 Quick Command Reference

Copy and paste these commands one at a time into your terminal.

---

## 🔧 Initial Setup

```bash
# 1. Install all dependencies
npm install

# 2. Install Supabase CLI globally (needed for database setup)
npm install -g supabase
```

---

## 🗄️ Database Setup

```bash
# Link to your Supabase project (you'll need your project ref)
supabase link --project-ref YOUR_PROJECT_REF_HERE

# Push database schema (creates all tables)
supabase db push
```

**Note:** Replace `YOUR_PROJECT_REF_HERE` with your actual project reference from Supabase.

---

## ✅ Validation Commands

```bash
# Check for TypeScript errors
npm run typecheck

# Check code quality
npm run lint

# Run all tests
npm run test:run

# Run tests with UI (opens browser)
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

---

## 🚀 Development Commands

```bash
# Start development server (default port 5173)
npm run dev

# Start on different port
npm run dev -- --port 3000

# Start with network access (access from other devices)
npm run dev -- --host
```

---

## 🏗️ Build Commands

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview

# Build and preview in one go
npm run build && npm run preview
```

---

## 🌐 Deployment Commands

### Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy to preview
netlify deploy

# Deploy to production
netlify deploy --prod
```

---

## 🐛 Troubleshooting Commands

```bash
# Clear npm cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Check what's running on port 5173
lsof -i:5173

# View npm logs
npm run dev --verbose
```

---

## 📊 Git Commands (if you want to commit your changes)

```bash
# Check status
git status

# Stage all changes
git add .

# Commit with message
git commit -m "feat: complete setup with all enhancements"

# Push to GitHub
git push origin main

# Create new branch for features
git checkout -b feature/my-feature-name
```

---

## 🔍 Useful Inspection Commands

```bash
# List all npm scripts
npm run

# Check installed packages
npm list --depth=0

# Check for outdated packages
npm outdated

# View project structure
tree -L 2 -I 'node_modules|dist'

# Count lines of code
find src -name '*.tsx' -o -name '*.ts' | xargs wc -l
```

---

## 🧹 Maintenance Commands

```bash
# Update all packages (careful - might break things)
npm update

# Update specific package
npm update package-name

# Clean build artifacts
rm -rf dist

# Clean everything and start fresh
rm -rf node_modules dist .vite package-lock.json
npm install
```

---

## 📦 Useful Supabase Commands

```bash
# Check Supabase CLI status
supabase status

# Generate TypeScript types from your database
supabase gen types typescript --local > src/types/supabase.ts

# View local Supabase logs
supabase logs

# Reset local database (careful!)
supabase db reset

# Stop local Supabase
supabase stop
```

---

## 🎯 The Essential Flow (What You'll Use Most)

```bash
# Morning routine - start working on the project
npm run dev

# Before committing - make sure everything works
npm run typecheck && npm run lint && npm run test:run

# Afternoon routine - test production build
npm run build && npm run preview

# Evening routine - deploy
vercel --prod  # or netlify deploy --prod
```

---

## 🆘 Emergency Commands (If Something Goes Wrong)

```bash
# 1. Nuclear option - delete everything and reinstall
rm -rf node_modules package-lock.json dist .vite
npm install

# 2. Force kill all node processes
killall node

# 3. Clear Vite cache
rm -rf node_modules/.vite

# 4. Reset git if you messed up
git reset --hard HEAD
git clean -fd

# 5. Restore from last commit
git checkout .
```

---

## 📝 Notes

- Always run `npm run typecheck` before committing
- Use `npm run test:run` to verify tests pass
- Keep your `.env.local` file secure (never commit it!)
- Use `--` to pass arguments to npm scripts (e.g., `npm run dev -- --port 3000`)
- Ctrl+C to stop the dev server
- Most commands should be run from the project root directory

---

## 🎓 Learning Resources

```bash
# View package.json scripts
cat package.json | grep -A 20 "scripts"

# View environment example
cat .env.example

# View TypeScript config
cat tsconfig.json
```

---

**Tip:** Bookmark this file! You'll reference it often during development. 📌
