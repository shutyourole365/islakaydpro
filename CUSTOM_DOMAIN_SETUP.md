# Custom Domain Setup Guide

## 🌐 Setting Up Your Custom Domain

This guide will help you connect your custom domain to the Islakayd platform deployed on Vercel or Netlify.

---

## Prerequisites

- Custom domain name (e.g., `yourdomain.com`)
- Access to your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.)
- Deployed Islakayd app on Vercel or Netlify

---

## Option 1: Vercel Custom Domain Setup

### Step 1: Add Domain in Vercel

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your **islakaydpro** project
3. Navigate to **Settings** → **Domains**
4. Click **Add Domain**
5. Enter your custom domain: `yourdomain.com`
6. Click **Add**

### Step 2: Configure DNS Records

Vercel will provide DNS records. Add these to your domain registrar:

**For root domain (`yourdomain.com`):**
```
Type: A
Name: @
Value: 76.76.21.21
```

**For www subdomain:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**Alternative (if A record doesn't work):**
```
Type: CNAME
Name: @
Value: cname.vercel-dns.com
```

### Step 3: Verify Domain

1. Wait 24-48 hours for DNS propagation (usually faster)
2. Vercel will automatically verify and issue SSL certificate
3. Your site will be live at `yourdomain.com`

---

## Option 2: Netlify Custom Domain Setup

### Step 1: Add Domain in Netlify

1. Go to your Netlify dashboard: https://app.netlify.com
2. Select your **islakaydpro** site
3. Navigate to **Domain settings**
4. Click **Add custom domain**
5. Enter your custom domain: `yourdomain.com`
6. Click **Verify** and **Add domain**

### Step 2: Configure DNS Records

**Option A: Use Netlify DNS (Recommended)**

1. In Domain settings, click **Set up Netlify DNS**
2. Netlify will provide nameservers (e.g., `dns1.p01.nsone.net`)
3. Go to your domain registrar
4. Replace existing nameservers with Netlify's nameservers
5. Wait 24-48 hours for propagation

**Option B: External DNS**

Add these records to your domain registrar:

**For root domain (`yourdomain.com`):**
```
Type: A
Name: @
Value: 75.2.60.5
```

**For www subdomain:**
```
Type: CNAME
Name: www
Value: [your-site].netlify.app
```

### Step 3: Enable HTTPS

1. Netlify automatically provisions SSL certificate
2. Wait 5-10 minutes for certificate issuance
3. Enable **Force HTTPS** in Domain settings

---

## Common Domain Registrars Configuration

### GoDaddy

1. Log in to GoDaddy
2. Go to **My Products** → **DNS**
3. Click **Manage DNS** for your domain
4. Add/Edit DNS records as specified above
5. Set TTL to 600 (10 minutes) for faster propagation

### Namecheap

1. Log in to Namecheap
2. Go to **Domain List** → Select your domain
3. Click **Manage** → **Advanced DNS**
4. Add/Edit DNS records
5. Remove parking page records if present

### Cloudflare

1. Log in to Cloudflare
2. Select your domain
3. Go to **DNS** → **Records**
4. Add DNS records
5. Set proxy status to **DNS only** (grey cloud) initially
6. After verification, enable proxy (orange cloud) for CDN benefits

### Google Domains

1. Log in to Google Domains
2. Select your domain → **DNS**
3. Scroll to **Custom resource records**
4. Add DNS records as specified
5. Save changes

---

## Post-Configuration Steps

### 1. Update Supabase Allowed URLs

Add your custom domain to Supabase:

1. Go to https://app.supabase.co/project/ialxlykysbqyiejepzkx
2. Navigate to **Authentication** → **URL Configuration**
3. Add to **Redirect URLs**:
   ```
   https://yourdomain.com/**
   https://www.yourdomain.com/**
   ```
4. Update **Site URL** to: `https://yourdomain.com`
5. Click **Save**

### 2. Update Environment Variables

If using platform environment variables, update:

```bash
VITE_APP_URL=https://yourdomain.com
```

### 3. Configure CORS (if needed)

In your Supabase project settings, add custom domain to allowed origins:

```
https://yourdomain.com
https://www.yourdomain.com
```

### 4. Update Analytics

If using Google Analytics, update property settings:

1. Go to Google Analytics
2. Admin → Property Settings
3. Update **Default URL** to your custom domain

---

## Troubleshooting

### DNS Not Propagating

**Issue**: Domain not resolving after 24 hours

**Solutions**:
- Clear DNS cache: `ipconfig /flushdns` (Windows) or `sudo dscacheutil -flushcache` (Mac)
- Check DNS propagation: https://dnschecker.org
- Verify DNS records are correct in registrar
- Wait up to 48 hours for full global propagation

### SSL Certificate Issues

**Issue**: "Not Secure" or SSL errors

**Solutions**:
- Vercel: Wait 5-10 minutes, SSL auto-provisions
- Netlify: Check Domain Settings → HTTPS → Verify DNS configuration
- Ensure both `@` and `www` records point correctly
- Try removing and re-adding domain

### Redirect Loop

**Issue**: Page keeps redirecting

**Solutions**:
- Check for conflicting redirect rules in `vercel.json` or `netlify.toml`
- Ensure Cloudflare proxy is set to "DNS only" initially
- Verify SSL/TLS mode in Cloudflare is "Full (strict)"

### 404 Errors on Refresh

**Issue**: Direct URL navigation returns 404

**Solutions**:
- Already configured in `vercel.json` and `netlify.toml`
- Verify SPA redirect rules are in place
- Check build output directory is `dist`

### Mixed Content Warnings

**Issue**: Browser blocking HTTP content on HTTPS site

**Solutions**:
- Ensure all API calls use HTTPS
- Update image URLs to HTTPS
- Check external script sources

---

## Switching from Another Repository

If you're moving a domain from another project:

### 1. Remove Domain from Old Project

**Vercel**:
1. Go to old project → Settings → Domains
2. Click **Remove** next to your domain
3. Confirm removal

**Netlify**:
1. Go to old site → Domain settings
2. Click domain → **Options** → **Remove domain**
3. Confirm removal

### 2. Add Domain to This Project

Follow the setup steps above for your platform

### 3. Update DNS (if needed)

- If using same platform (Vercel→Vercel or Netlify→Netlify), DNS may not need changes
- Wait 5-10 minutes for platform to recognize domain transfer
- Test at your custom domain

---

## Verification Checklist

After setup, verify:

- ✅ Domain resolves to your site
- ✅ HTTPS works (green padlock)
- ✅ www redirects to non-www (or vice versa)
- ✅ Authentication works
- ✅ API calls succeed
- ✅ No console errors
- ✅ All pages load correctly
- ✅ Direct URL navigation works

---

## DNS Record Examples

### Example 1: Root Domain Only

```
Type: A
Name: @
Value: 76.76.21.21 (Vercel) or 75.2.60.5 (Netlify)

Type: CNAME
Name: www
Value: yourdomain.com
```

### Example 2: Subdomain (app.yourdomain.com)

```
Type: CNAME
Name: app
Value: cname.vercel-dns.com (Vercel)
        or [your-site].netlify.app (Netlify)
```

### Example 3: Multiple Subdomains

```
Type: CNAME
Name: app
Value: cname.vercel-dns.com

Type: CNAME  
Name: api
Value: another-project.vercel.app

Type: CNAME
Name: docs
Value: docs-site.netlify.app
```

---

## Best Practices

1. **Use HTTPS**: Always enforce HTTPS in production
2. **Enable CDN**: Use Cloudflare proxy for global CDN
3. **Set up monitoring**: Use UptimeRobot to monitor domain uptime
4. **Configure redirects**: Redirect www → non-www (or vice versa)
5. **Update sitemap**: Submit new domain to Google Search Console
6. **301 redirects**: Set up redirects from old domain if applicable
7. **Test thoroughly**: Test all pages and features after domain change

---

## Support Resources

- **Vercel Domains**: https://vercel.com/docs/concepts/projects/domains
- **Netlify Domains**: https://docs.netlify.com/domains-https/custom-domains/
- **DNS Checker**: https://dnschecker.org
- **SSL Checker**: https://www.sslshopper.com/ssl-checker.html
- **Supabase Auth**: https://supabase.com/docs/guides/auth

---

## Need Help?

If you're still experiencing issues:

1. Check GitHub Actions workflows for CI/CD errors
2. Review deployment logs in Vercel/Netlify dashboard
3. Test DNS with `nslookup yourdomain.com`
4. Check browser console for JavaScript errors
5. Verify Supabase connection is working

Your custom domain should be live within 24-48 hours! 🚀
