# 🏗️ Islakayd - AI-Powered Equipment Rental Marketplace

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-blue)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-green)](https://supabase.com/)

> The world's most advanced equipment rental marketplace. Rent anything, anywhere, powered by AI.

**Islakayd** is a full-stack TypeScript/React equipment rental platform featuring real-time bookings, AI-powered recommendations, dynamic pricing, user verification, and comprehensive analytics. Built for scalability, security, and exceptional user experience.

---

## 🎯 **NEW? START HERE!** 👉 [START_HERE.md](START_HERE.md) 👈

**Everything you need to get started in one place!**

---

## 📚 Complete Documentation Guide

**Choose your path:**

### 🔰 First Time Setup
1. **[START_HERE.md](START_HERE.md)** ⭐ **Read this first!**
2. **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Detailed setup walkthrough
3. **[PROGRESS_TRACKER.md](PROGRESS_TRACKER.md)** - Track your setup progress
4. **[YOU_ARE_READY.md](YOU_ARE_READY.md)** - Motivational start guide

### ⚡ Quick Reference
- **[COMMANDS.md](COMMANDS.md)** - All commands you'll need
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - How everything works
- **[FILE_GUIDE.md](FILE_GUIDE.md)** - Navigate the codebase
- **[FLOWCHART.md](FLOWCHART.md)** - Visual guide to user flows

### 🚀 Production & Operations
- **[PRODUCTION_CHECKLIST.md](PRODUCTION_CHECKLIST.md)** 🎯 - Pre-launch checklist
- **[MONITORING.md](MONITORING.md)** - Monitoring & scaling guide
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Common issues & fixes
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Deploy to production

### 📖 Additional Resources
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Contribute to the project
- **[SECURITY.md](SECURITY.md)** - Security best practices
- **[CHANGELOG.md](CHANGELOG.md)** - Version history
- **[PROJECT_STATUS.md](PROJECT_STATUS.md)** - Current status
- **[INDEX.md](INDEX.md)** - Complete documentation index

**Already set up?** Jump to [Development](#-development) section below.

---

## ✨ Features

### 🎯 Core Functionality
- **🔍 Smart Search** - AI-powered search with natural language queries and filters
- **📅 Advanced Booking System** - Calendar-based rentals with availability management
- **💳 Secure Payments** - Stripe integration with automatic payouts
- **⭐ Reviews & Ratings** - Comprehensive review system for equipment and users
- **🗺️ Interactive Maps** - Leaflet-based location search and visualization
- **📱 Real-time Messaging** - In-app chat between renters and owners

### 🤖 AI-Powered Features
- **AI Assistant (Kayd)** - Contextual help, recommendations, and search assistance
- **Smart Recommendations** - Personalized equipment suggestions
- **Dynamic Pricing** - AI-optimized pricing based on demand and market trends
- **Predictive Analytics** - Usage patterns and revenue forecasting

### 🔐 Security & Compliance
- **Row-Level Security (RLS)** - Supabase database security
- **User Verification** - Multi-level verification system (ID, phone, business)
- **Two-Factor Authentication** - Optional 2FA for enhanced security
- **Audit Logging** - Complete activity tracking for compliance
- **Session Management** - Device tracking and security monitoring

### 📊 Business Intelligence
- **Analytics Dashboard** - Comprehensive insights for users and admins
- **Revenue Tracking** - Detailed financial reporting
- **Performance Metrics** - Equipment popularity, conversion rates
- **User Analytics** - Behavior patterns and engagement metrics

### 🎨 User Experience
- **Progressive Web App (PWA)** - Installable, works offline
- **Responsive Design** - Mobile-first approach
- **Accessibility** - WCAG 2.1 AA compliant
- **Multi-language Ready** - i18n infrastructure in place
- **Dark Mode Support** - (Coming soon)

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Supabase Account** - [Sign up here](https://supabase.com)
- **Stripe Account** - [Sign up here](https://stripe.com) (for payments)

### Installation

```bash
# Clone the repository
git clone https://github.com/shutyourole365/islakaydpro.git
cd islakaydpro

# Install dependencies
npm install

# Copy environment variables template
cp .env.example .env.local

# Configure your environment variables (see below)
nano .env.local
```

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Stripe Configuration (Optional for development)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

# App Configuration
VITE_APP_URL=http://localhost:5173
VITE_API_URL=https://your-project.supabase.co/functions/v1
```

### Database Setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com)

2. **Run migrations** in the Supabase SQL Editor:
   ```bash
   # Navigate to SQL Editor in Supabase Dashboard
   # Run migrations in order from supabase/migrations/
   ```

3. **Or use Supabase CLI**:
   ```bash
   # Install Supabase CLI
   npm install -g supabase

   # Login and link project
   supabase login
   supabase link --project-ref your-project-ref

   # Push migrations
   supabase db push
   ```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📁 Project Structure

```
islakaydpro/
├── public/                    # Static assets
│   ├── manifest.json         # PWA manifest
│   ├── sw.js                 # Service worker
│   └── icons/                # App icons
├── src/
│   ├── components/           # React components
│   │   ├── admin/           # Admin panel
│   │   ├── ai/              # AI assistant
│   │   ├── auth/            # Authentication
│   │   ├── booking/         # Booking system
│   │   ├── dashboard/       # User dashboard
│   │   ├── equipment/       # Equipment listings
│   │   ├── layout/          # Layout components
│   │   ├── map/             # Map integration
│   │   ├── payments/        # Payment processing
│   │   ├── security/        # Security features
│   │   └── ...              # Other components
│   ├── contexts/            # React contexts
│   │   └── AuthContext.tsx  # Authentication state
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # External integrations
│   │   └── supabase.ts      # Supabase client
│   ├── services/            # Business logic
│   │   ├── database.ts      # Database queries
│   │   ├── ai.ts            # AI services
│   │   ├── payments.ts      # Payment services
│   │   └── email.ts         # Email services
│   ├── types/               # TypeScript types
│   │   └── index.ts         # Type definitions
│   ├── utils/               # Utility functions
│   │   ├── validation.ts    # Input validation
│   │   └── formatters.ts    # Data formatting
│   ├── App.tsx              # Main app component
│   └── main.tsx             # Entry point
├── supabase/
│   ├── functions/           # Edge functions
│   │   ├── ai-chat/         # AI chat endpoint
│   │   ├── create-checkout/ # Stripe checkout
│   │   ├── stripe-webhook/  # Payment webhooks
│   │   └── ...              # Other functions
│   └── migrations/          # Database migrations
└── ...
```

---

## 🗄️ Database Schema

### Core Tables

- **profiles** - User profiles with verification status
- **equipment** - Equipment listings with specifications
- **bookings** - Rental bookings and transactions
- **categories** - Equipment categories
- **reviews** - User and equipment reviews
- **favorites** - Saved equipment
- **messages** - In-app messaging
- **notifications** - User notifications

### Security Tables

- **audit_logs** - Security audit trail
- **user_sessions** - Active session tracking
- **verification_requests** - User verification workflow

### Analytics Tables

- **user_analytics** - User engagement metrics
- **equipment_analytics** - Equipment performance
- **platform_settings** - System configuration

See [supabase/migrations/](./supabase/migrations/) for complete schema.

---

## 🔒 Security Features

### Authentication
- Email/password authentication via Supabase Auth
- Social OAuth (Google, Facebook, GitHub) ready
- Two-factor authentication (2FA)
- Session management with device tracking

### Authorization
- Row-Level Security (RLS) policies on all tables
- Role-based access control (RBAC)
- Admin panel with granular permissions

### Data Protection
- Input sanitization and validation
- SQL injection prevention via parameterized queries
- XSS protection
- CSRF tokens
- Rate limiting on API endpoints

### Compliance
- GDPR-ready data handling
- Audit logging for all sensitive operations
- Data retention policies
- Right to be forgotten implementation

---

## 📱 PWA Features

The app is a Progressive Web App with:

- **Offline Support** - Service worker caching
- **Installable** - Add to home screen
- **Push Notifications** - Booking updates and messages
- **Background Sync** - Sync data when online
- **Responsive** - Mobile-first design

---

## 🧪 Testing

```bash
# Run type checking
npm run typecheck

# Run linter
npm run lint

# Run tests (when configured)
npm test

# Build for production
npm run build

# Preview production build
npm run preview
```

### Testing Strategy

- **Unit Tests** - Utilities, validation, formatters
- **Integration Tests** - Database operations, API calls
- **E2E Tests** - Critical user flows (booking, payments)
- **Accessibility Tests** - WCAG compliance

---

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy

# Deploy to production
netlify deploy --prod
```

### Environment Variables

Make sure to set the following in your deployment platform:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_STRIPE_PUBLISHABLE_KEY`
- `VITE_APP_URL`

---

## 🛠️ Development Workflow

### Branch Strategy

- `main` - Production-ready code
- `develop` - Development branch
- `feature/*` - Feature branches
- `hotfix/*` - Emergency fixes

### Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new booking feature
fix: resolve payment processing bug
docs: update README
style: format code
refactor: restructure auth service
test: add booking tests
chore: update dependencies
```

### Code Style

- **TypeScript** strict mode enabled
- **ESLint** for linting
- **Prettier** for formatting (recommended)
- Follow React best practices

---

## 📊 Performance Optimization

### Current Optimizations

- **Code Splitting** - Lazy loading for heavy components
- **Image Optimization** - CDN-ready with lazy loading
- **Bundle Size** - Tree-shaking and minification
- **Caching** - Service worker caching strategy
- **Database** - Indexed foreign keys, optimized queries

### Performance Targets

- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Lighthouse Score: > 90

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your changes** (`git commit -m 'feat: add amazing feature'`)
4. **Push to the branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

### Development Guidelines

- Write clean, maintainable code
- Add tests for new features
- Update documentation
- Follow the existing code style
- Test thoroughly before submitting PR

---

## 🐛 Known Issues & Roadmap

### Known Issues

- Demo mode uses sample data when Supabase not configured

### Roadmap

- [ ] Mobile app (React Native)
- [ ] Multi-language support (i18n)
- [ ] Dark mode
- [ ] Advanced analytics dashboard
- [ ] Blockchain-based contracts
- [ ] AR equipment preview
- [ ] Video chat for equipment inspection
- [ ] Insurance integration
- [ ] Maintenance tracking system

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 💬 Support

- **Documentation**: [Copilot Instructions](.github/copilot-instructions.md)
- **Issues**: [GitHub Issues](https://github.com/shutyourole365/islakaydpro/issues)
- **Discussions**: [GitHub Discussions](https://github.com/shutyourole365/islakaydpro/discussions)

---

## 🙏 Acknowledgments

- Built with [React](https://reactjs.org/) + [TypeScript](https://www.typescriptlang.org/)
- Backend powered by [Supabase](https://supabase.com/)
- Payments via [Stripe](https://stripe.com/)
- Maps by [Leaflet](https://leafletjs.com/)
- Icons from [Lucide](https://lucide.dev/)
- UI inspiration from modern design systems

---

## 📈 Stats

![GitHub stars](https://img.shields.io/github/stars/shutyourole365/islakaydpro?style=social)
![GitHub forks](https://img.shields.io/github/forks/shutyourole365/islakaydpro?style=social)
![GitHub issues](https://img.shields.io/github/issues/shutyourole365/islakaydpro)
![GitHub pull requests](https://img.shields.io/github/issues-pr/shutyourole365/islakaydpro)

---

Made with ❤️ by the Islakayd Team
