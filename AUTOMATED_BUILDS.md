# Automated App Store Builds with GitHub Actions

This guide will help you set up **automatic** builds and publishing to both app stores whenever you push code.

## How It Works

1. You push code to GitHub
2. GitHub Actions automatically builds the apps
3. Apps are uploaded to the stores (if configured)
4. You approve the release in the store consoles

## Quick Setup (10 minutes)

### Step 1: Add Basic Secrets

Go to your GitHub repository:
1. Click **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add these secrets:

| Secret Name | Value |
|-------------|-------|
| `VITE_SUPABASE_URL` | `https://ialxlykysbqyiejepzkx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key |

### Step 2: Trigger a Build

1. Go to **Actions** tab in your GitHub repo
2. Click **Build Android APK/AAB** (left sidebar)
3. Click **Run workflow** (right side)
4. Select **aab** and click **Run workflow**

The build will complete in ~10 minutes. Download the AAB from the artifacts!

---

## Full Setup: Auto-Publish to Google Play

### Prerequisites
- Google Play Developer Account ($25): https://play.google.com/console
- App already created in Play Console (just the listing, no APK needed yet)

### Step 1: Create Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (or use existing)
3. Go to **IAM & Admin** → **Service Accounts**
4. Click **Create Service Account**
   - Name: `github-play-publisher`
   - Click **Create and Continue**
   - Skip roles, click **Done**
5. Click on your new service account
6. Go to **Keys** tab → **Add Key** → **Create new key**
7. Select **JSON** → **Create**
8. Save the downloaded JSON file

### Step 2: Link to Play Console

1. Go to [Google Play Console](https://play.google.com/console)
2. Click **Settings** (gear icon) → **API access**
3. Click **Link** next to your Google Cloud project
4. Under Service Accounts, find your account
5. Click **Grant access**
6. Select **Admin** role → **Invite user**
7. Accept the invitation in your email

### Step 3: Create Android Keystore

On your local machine:
```bash
keytool -genkey -v -keystore islakayd.jks -keyalg RSA -keysize 2048 -validity 10000 -alias islakayd
```

Fill in the prompts and **SAVE YOUR PASSWORDS!**

Convert to base64:
```bash
base64 -i islakayd.jks | tr -d '\n' > keystore-base64.txt
```

### Step 4: Add GitHub Secrets

Add these secrets in GitHub:

| Secret Name | Value |
|-------------|-------|
| `ANDROID_KEYSTORE_BASE64` | Contents of keystore-base64.txt |
| `ANDROID_KEYSTORE_PASSWORD` | Your keystore password |
| `ANDROID_KEY_ALIAS` | `islakayd` |
| `ANDROID_KEY_PASSWORD` | Your key password |
| `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` | Contents of the JSON file from Step 1 |

### Step 5: Test It

1. Push any change to GitHub
2. Watch the Actions tab
3. App will be uploaded to Internal Testing track in Play Console!

---

## Full Setup: Auto-Publish to App Store

### Prerequisites
- Apple Developer Account ($99/year): https://developer.apple.com
- App already created in App Store Connect

### Step 1: Create App Store Connect API Key

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Click **Users and Access** → **Keys** tab
3. Click **+** to generate a new key
   - Name: `GitHub Actions`
   - Access: **Admin**
4. Click **Generate**
5. Download the `.p8` file (you can only download once!)
6. Note the **Key ID** and **Issuer ID**

### Step 2: Export Signing Certificate

On your Mac:

1. Open **Keychain Access**
2. Find your Apple Distribution certificate
3. Right-click → **Export**
4. Save as `.p12` file with a password
5. Convert to base64:
   ```bash
   base64 -i certificate.p12 | tr -d '\n' > cert-base64.txt
   ```

### Step 3: Get Provisioning Profile

1. Go to [Apple Developer Portal](https://developer.apple.com/account/resources/profiles/)
2. Create or download your App Store provisioning profile
3. Convert to base64:
   ```bash
   base64 -i profile.mobileprovision | tr -d '\n' > profile-base64.txt
   ```

### Step 4: Add GitHub Secrets

| Secret Name | Value |
|-------------|-------|
| `IOS_CERTIFICATE_BASE64` | Contents of cert-base64.txt |
| `IOS_CERTIFICATE_PASSWORD` | Your .p12 export password |
| `IOS_PROVISIONING_PROFILE_BASE64` | Contents of profile-base64.txt |
| `IOS_KEYCHAIN_PASSWORD` | Any random password |
| `APPLE_TEAM_ID` | Your Apple Team ID (found in Developer Portal) |
| `APP_STORE_CONNECT_API_KEY` | Contents of the .p8 file |
| `APP_STORE_CONNECT_API_KEY_ID` | Key ID from Step 1 |
| `APP_STORE_CONNECT_API_ISSUER_ID` | Issuer ID from Step 1 |

### Step 5: Test It

1. Push any change to GitHub
2. Watch the Actions tab
3. App will be uploaded to App Store Connect!

---

## Manual Build Download

If you just want to download the built apps without auto-publishing:

1. Go to your repo's **Actions** tab
2. Click on a completed workflow run
3. Scroll down to **Artifacts**
4. Download `android-aab` or `ios-ipa`

You can then manually upload these to the stores.

---

## Troubleshooting

### Android Build Fails
- Check that Supabase secrets are set correctly
- Verify keystore base64 encoding (no line breaks)

### iOS Build Fails
- Ensure certificate hasn't expired
- Check provisioning profile matches bundle ID `com.islakayd.app`
- Verify Team ID is correct

### Upload Fails
- For Android: Check service account has Admin access in Play Console
- For iOS: Check API key has Admin access in App Store Connect

---

## Cost

- **GitHub Actions**: Free for public repos, 2000 min/month for private
- macOS runners use 10x minutes (so 200 min/month effectively for iOS builds)
- Each iOS build takes ~15 minutes = 150 minutes used

For heavy usage, consider:
- Making repo public
- Using self-hosted runners
- [Codemagic](https://codemagic.io) - 500 min/month free, better for mobile

---

## Alternative: Use Codemagic (Easier)

[Codemagic](https://codemagic.io) is specifically designed for mobile apps:

1. Sign up with GitHub
2. Select your repo
3. It auto-detects Capacitor
4. Add your signing credentials in their UI
5. Click Build!

Benefits:
- Better mobile-specific tooling
- Easier credential management  
- 500 free build minutes/month
- Simpler than GitHub Actions for mobile
