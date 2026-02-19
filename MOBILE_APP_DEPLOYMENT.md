# Mobile App Store Deployment Guide

## Overview

Islakayd is configured with Capacitor for native iOS and Android apps. This guide covers the steps to publish to Apple App Store and Google Play Store.

## Prerequisites

### For iOS (App Store)
- macOS computer with Xcode 15+
- Apple Developer Account ($99/year): https://developer.apple.com
- Valid Apple ID with two-factor authentication

### For Android (Play Store)  
- Android Studio (any OS)
- Google Play Developer Account ($25 one-time): https://play.google.com/console
- JDK 17+

## Quick Start Commands

```bash
# Sync web build with native projects
npm run mobile:sync

# Open iOS project in Xcode (macOS only)
npm run mobile:ios

# Open Android project in Android Studio
npm run mobile:android
```

## iOS App Store Deployment

### Step 1: Configure iOS Project

1. Open Xcode:
   ```bash
   npm run mobile:ios
   ```

2. In Xcode, select the "App" target and configure:
   - **Bundle Identifier**: `com.islakayd.app`
   - **Display Name**: `Islakayd`
   - **Version**: `1.0.0`
   - **Build**: `1`

3. Set up signing:
   - Go to "Signing & Capabilities"
   - Select your Team
   - Enable "Automatically manage signing"

### Step 2: App Icons & Launch Screen

1. Replace icons in `ios/App/App/Assets.xcassets/AppIcon.appiconset/`:
   - Create icons in sizes: 20, 29, 40, 58, 60, 76, 80, 87, 120, 152, 167, 180, 1024px

2. Configure launch screen colors in `ios/App/App/Base.lproj/LaunchScreen.storyboard`

### Step 3: Create iOS Archive

1. In Xcode: Product → Archive
2. When complete, Organizer window opens
3. Click "Distribute App"
4. Select "App Store Connect"
5. Follow prompts to upload

### Step 4: App Store Connect Setup

1. Go to https://appstoreconnect.apple.com
2. Create new app:
   - **Name**: Islakayd - Equipment Rental
   - **Primary Language**: English
   - **Bundle ID**: com.islakayd.app
   - **SKU**: islakayd-001

3. Fill in required information:
   - **Description**: AI-powered equipment rental marketplace
   - **Keywords**: equipment rental, tools, construction, AI
   - **Support URL**: https://islakayd.com/support
   - **Privacy Policy**: https://islakayd.com/privacy

4. Upload screenshots (required sizes):
   - 6.7" (1290 x 2796)
   - 6.5" (1284 x 2778)
   - 5.5" (1242 x 2208)
   - iPad Pro 12.9" (2048 x 2732)

5. Submit for review

## Android Play Store Deployment

### Step 1: Configure Android Project

1. Open Android Studio:
   ```bash
   npm run mobile:android
   ```

2. Update `android/app/build.gradle`:
   ```groovy
   android {
       defaultConfig {
           applicationId "com.islakayd.app"
           versionCode 1
           versionName "1.0.0"
       }
   }
   ```

### Step 2: App Icons

Replace icons in `android/app/src/main/res/`:
- `mipmap-mdpi/ic_launcher.png` (48x48)
- `mipmap-hdpi/ic_launcher.png` (72x72)
- `mipmap-xhdpi/ic_launcher.png` (96x96)
- `mipmap-xxhdpi/ic_launcher.png` (144x144)
- `mipmap-xxxhdpi/ic_launcher.png` (192x192)

### Step 3: Create Signed APK/AAB

1. In Android Studio: Build → Generate Signed Bundle / APK
2. Select "Android App Bundle" (recommended for Play Store)
3. Create new keystore:
   - **Key store path**: `android/keystore/islakayd.jks`
   - **Password**: (secure password)
   - **Alias**: islakayd
   - **Validity**: 25 years

4. Fill in certificate details
5. Select "release" build variant
6. Click "Finish"

**Important**: Save your keystore file and passwords securely. You'll need them for all future updates.

### Step 4: Play Console Setup

1. Go to https://play.google.com/console
2. Create new app:
   - **App name**: Islakayd - Equipment Rental
   - **Default language**: English
   - **App or game**: App
   - **Free or paid**: Free

3. Complete store listing:
   - **Short description** (80 chars): AI-powered equipment rental marketplace
   - **Full description** (4000 chars): Full app description
   - **App icon** (512x512)
   - **Feature graphic** (1024x500)
   - **Screenshots**: Phone (2-8), Tablet (optional)

4. Complete content declarations:
   - Content rating questionnaire
   - Target audience
   - Data safety section

5. Upload AAB to Production track (or Internal testing first)

6. Submit for review

## App Store Listing Content

### App Name
**Islakayd - Equipment Rental**

### Short Description
Rent any equipment, anywhere with AI-powered pricing and instant booking.

### Full Description
```
Islakayd is the modern way to rent equipment. Whether you need construction tools, cameras, or party supplies, find and book equipment from verified owners near you.

🤖 AI-POWERED FEATURES
• Smart price negotiation - Let AI get you the best deal
• Intelligent scheduling - Find the cheapest booking times
• Voice search - Just say what you need
• AI damage detection - Fair and transparent returns

📱 EASY BOOKING
• Browse thousands of equipment listings
• Instant booking with secure payments
• QR code check-in/out
• Real-time GPS tracking

💰 SAVE MONEY
• Compare prices across owners
• Split payments with friends
• Instant insurance quotes
• Loyalty rewards program

🔒 TRUST & SAFETY
• Verified equipment owners
• Secure blockchain contracts
• 24/7 customer support
• Damage protection included

Perfect for contractors, event planners, photographers, DIY homeowners, and small businesses.

Download now and start renting smarter!
```

### Keywords
equipment rental, tool rental, construction equipment, camera rental, party supplies, AI marketplace, peer to peer rental, rent tools, equipment sharing

### Categories
- **iOS Primary**: Utilities
- **iOS Secondary**: Lifestyle
- **Android Category**: Business

## Testing Before Submission

### TestFlight (iOS)
1. Archive and upload to App Store Connect
2. Go to TestFlight tab
3. Add internal testers (up to 100)
4. Distribute build to testers

### Internal Testing (Android)
1. Create internal testing track
2. Add testers via email
3. Upload AAB
4. Testers get Play Store link

## Post-Launch Checklist

- [ ] Monitor crash reports (Firebase Crashlytics / Sentry)
- [ ] Respond to user reviews within 24 hours
- [ ] Set up App Store / Play Store notifications
- [ ] Plan regular update schedule
- [ ] Track key metrics (downloads, retention, DAU)

## Updating the App

```bash
# 1. Update version in package.json
# 2. Build and sync
npm run mobile:sync

# 3. Open native project and increment version/build numbers
npm run mobile:ios    # or mobile:android

# 4. Create new archive and submit
```

## Troubleshooting

### iOS Common Issues
- **Signing error**: Check Xcode signing & capabilities
- **Missing icons**: Ensure all required sizes are present
- **Rejection**: Review App Store guidelines

### Android Common Issues
- **Build fails**: Check Gradle and SDK versions
- **APK too large**: Enable ProGuard/R8 minification
- **Signing error**: Verify keystore password and alias

## Resources

- [Apple App Store Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Policies](https://play.google.com/about/developer-content-policy/)
- [Capacitor iOS Documentation](https://capacitorjs.com/docs/ios)
- [Capacitor Android Documentation](https://capacitorjs.com/docs/android)
