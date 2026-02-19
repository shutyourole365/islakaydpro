# Islakayd App Store Publishing Checklist

Print this out and check off each step as you complete it.

---

## PART 1: ACCOUNTS (Do This First - Takes 24-48 hours for approval)

### Google Play Store Account
- [ ] Go to https://play.google.com/console
- [ ] Sign in with your Google account
- [ ] Pay $25 one-time registration fee
- [ ] Complete identity verification
- [ ] Wait for approval (usually 24-48 hours)

### Apple Developer Account (Skip if Android only)
- [ ] Go to https://developer.apple.com/programs/enroll/
- [ ] Sign in with your Apple ID (create one if needed)
- [ ] Pay $99/year fee
- [ ] Complete identity verification
- [ ] Wait for approval (usually 24-48 hours)

---

## PART 2: SOFTWARE SETUP

### Required Software
- [ ] **Git**: https://git-scm.com/downloads
- [ ] **Node.js 18+**: https://nodejs.org (LTS version)
- [ ] **Android Studio**: https://developer.android.com/studio
- [ ] **Xcode** (Mac only): App Store → Search "Xcode" → Install

### Clone and Setup Project
```bash
# Open Terminal (Mac/Linux) or Command Prompt (Windows)

# Clone the repository
git clone https://github.com/shutyourole365/islakaydpro.git

# Navigate to project
cd islakaydpro

# Install dependencies
npm install

# Build and prepare mobile apps
npm run mobile:sync
```

---

## PART 3: ANDROID PLAY STORE (Easier - Do This First)

### Step 3.1: Open in Android Studio
```bash
npm run mobile:android
```
Wait for Gradle sync to complete (may take 5-10 minutes first time)

### Step 3.2: Create Signing Key
1. [ ] Menu: **Build → Generate Signed Bundle / APK**
2. [ ] Select **Android App Bundle**
3. [ ] Click **Create new...** for Key store
4. [ ] Fill in:
   - **Key store path**: Choose a SAFE location (you'll need this forever!)
   - **Password**: Create a STRONG password (WRITE IT DOWN!)
   - **Alias**: `islakayd`
   - **Password**: Same as above or different
   - **Validity**: 25 years
   - **First and Last Name**: Your name
   - **Organization**: Islakayd
   - **City/State/Country**: Your location
5. [ ] Click **OK**
6. [ ] Click **Next**
7. [ ] Select **release**
8. [ ] Click **Create**

⚠️ **IMPORTANT**: Save your keystore file and passwords somewhere safe! You need them for ALL future updates.

### Step 3.3: Upload to Play Console
1. [ ] Go to https://play.google.com/console
2. [ ] Click **Create app**
3. [ ] Fill in:
   - **App name**: `Islakayd - Equipment Rental`
   - **Default language**: English (United States)
   - **App or game**: App
   - **Free or paid**: Free
4. [ ] Accept declarations and click **Create app**

### Step 3.4: Complete Store Listing
1. [ ] Go to **Main store listing**
2. [ ] Add **App icon** (512x512 PNG) - Create at https://www.canva.com
3. [ ] Add **Feature graphic** (1024x500 PNG)
4. [ ] Add **Screenshots** (at least 2 phone screenshots)
   - Take screenshots from your phone running the web app
   - Or use Android Studio emulator
5. [ ] Fill in:
   - **Short description**: `Rent any equipment, anywhere with AI-powered pricing`
   - **Full description**: (Copy from MOBILE_APP_DEPLOYMENT.md)
6. [ ] Click **Save**

### Step 3.5: Complete Content Rating
1. [ ] Go to **Content rating**
2. [ ] Click **Start questionnaire**
3. [ ] Answer questions honestly (the app has no violent/adult content)
4. [ ] Click **Save** → **Calculate rating** → **Apply**

### Step 3.6: Set Up Pricing
1. [ ] Go to **Countries / regions**
2. [ ] Select countries where you want to publish
3. [ ] Click **Save**

### Step 3.7: Upload Your App
1. [ ] Go to **Production** (left sidebar)
2. [ ] Click **Create new release**
3. [ ] Upload the `.aab` file from:
   ```
   android/app/release/app-release.aab
   ```
4. [ ] Add release notes: `Initial release of Islakayd Equipment Rental`
5. [ ] Click **Save** → **Review release** → **Start rollout to Production**

### Step 3.8: Submit for Review
- [ ] Google will review your app (usually 1-7 days)
- [ ] You'll get an email when approved or if changes needed

---

## PART 4: iOS APP STORE (Mac Required)

### Step 4.1: Open in Xcode
```bash
npm run mobile:ios
```

### Step 4.2: Configure Signing
1. [ ] Click on **App** in the left sidebar
2. [ ] Select **App** target
3. [ ] Go to **Signing & Capabilities** tab
4. [ ] Check **Automatically manage signing**
5. [ ] Select your **Team** (your Apple Developer account)
6. [ ] Bundle Identifier should be: `com.islakayd.app`

### Step 4.3: Add App Icons
1. [ ] In Xcode, open **Assets.xcassets → AppIcon**
2. [ ] Add your app icon in all required sizes
   - Use https://appicon.co to generate all sizes from one image

### Step 4.4: Build Archive
1. [ ] Select **Any iOS Device** as build target (top bar)
2. [ ] Menu: **Product → Archive**
3. [ ] Wait for build to complete
4. [ ] **Organizer** window opens automatically

### Step 4.5: Upload to App Store Connect
1. [ ] In Organizer, select your archive
2. [ ] Click **Distribute App**
3. [ ] Select **App Store Connect**
4. [ ] Click **Next** through the prompts
5. [ ] Click **Upload**
6. [ ] Wait for upload to complete

### Step 4.6: Configure in App Store Connect
1. [ ] Go to https://appstoreconnect.apple.com
2. [ ] Click **My Apps** → **+** → **New App**
3. [ ] Fill in:
   - **Name**: `Islakayd - Equipment Rental`
   - **Primary Language**: English (U.S.)
   - **Bundle ID**: `com.islakayd.app`
   - **SKU**: `islakayd-001`
4. [ ] Click **Create**

### Step 4.7: Complete App Information
1. [ ] Add **Screenshots** for:
   - [ ] 6.7" Display (iPhone 14 Pro Max)
   - [ ] 6.5" Display (iPhone 11 Pro Max)
   - [ ] 5.5" Display (iPhone 8 Plus)
2. [ ] Add **App Preview** (optional video)
3. [ ] Fill in **Description** (copy from MOBILE_APP_DEPLOYMENT.md)
4. [ ] Add **Keywords**: equipment rental, tools, AI, marketplace
5. [ ] Add **Support URL**: Your website or email
6. [ ] Add **Privacy Policy URL**: Create one at https://getterms.io

### Step 4.8: Submit for Review
1. [ ] Go to your app's page
2. [ ] Select the build you uploaded
3. [ ] Click **Add for Review**
4. [ ] Answer the export compliance questions
5. [ ] Click **Submit for Review**

### Step 4.9: Wait for Approval
- [ ] Apple reviews usually take 1-3 days
- [ ] You'll get an email when approved or if changes needed

---

## PART 5: POST-LAUNCH

### After Approval
- [ ] Download your app from the stores to verify it works
- [ ] Share the store links on social media
- [ ] Add store badges to your website

### Store Links (After Approval)
- Android: `https://play.google.com/store/apps/details?id=com.islakayd.app`
- iOS: `https://apps.apple.com/app/islakayd/id[YOUR_APP_ID]`

---

## NEED HELP?

- **Android Issues**: https://developer.android.com/support
- **iOS Issues**: https://developer.apple.com/support/
- **Capacitor**: https://capacitorjs.com/docs

---

## QUICK COMMANDS REFERENCE

```bash
# Build and sync
npm run mobile:sync

# Open iOS project
npm run mobile:ios

# Open Android project
npm run mobile:android

# Just build web app
npm run build
```

---

Good luck! 🚀
