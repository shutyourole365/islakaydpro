# 🌐 Custom Domain Setup Guide

## Quick Setup (5 minutes)

### Step 1: Choose Your Domain

If you don't have a domain yet, get one from:
- **Namecheap**: https://www.namecheap.com (~$10/year)
- **Google Domains**: https://domains.google
- **GoDaddy**: https://www.godaddy.com

### Step 2: Add Domain to Vercel

1. **Go to Vercel Domains**:
   ```
   https://vercel.com/ashley-mckinnons-projects/islakaydpro/settings/domains
   ```

2. **Click "Add Domain"**

3. **Enter your domain** (e.g., `islakayd.com`)

4. **Vercel will show DNS records** you need to add

### Step 3: Configure DNS

#### Option A: Using Vercel Nameservers (Recommended - Easiest)

1. Vercel will provide nameservers like:
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ```

2. Go to your domain registrar's dashboard

3. Find "Nameservers" or "DNS Settings"

4. Replace existing nameservers with Vercel's

5. Save (propagation takes 24-48 hours, usually faster)

#### Option B: Using Your Registrar's DNS (More Control)

Add these records to your DNS:

**For root domain (islakayd.com):**
```
Type: A
Name: @
Value: 76.76.21.21
TTL: 3600
```

**For www subdomain (www.islakayd.com):**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

### Step 4: Verify & Wait

1. Click "Verify" in Vercel dashboard
2. Wait for DNS propagation (usually 5-60 minutes)
3. Vercel will automatically provision SSL certificate

### Step 5: Test Your Domain

```bash
# Check DNS propagation
dig islakayd.com +short

# Test HTTPS
curl -I https://islakayd.com
```

---

## Advanced Configuration

### Redirect www to root domain

In Vercel dashboard → Domains → Click your www domain → Redirect to root domain

### Add Subdomain

Add these records:
```
Type: CNAME
Name: app (or any subdomain)
Value: cname.vercel-dns.com
TTL: 3600
```

Then add `app.yourdomain.com` in Vercel domains.

### Multiple Domains

You can add multiple domains and set one as primary:
- islakayd.com (primary)
- www.islakayd.com (redirect)
- app.islakayd.com (app)
- api.islakayd.com (API)

---

## Troubleshooting

### Domain not verifying?

```bash
# Check DNS propagation
nslookup islakayd.com

# Check with different DNS servers
nslookup islakayd.com 8.8.8.8
```

### SSL certificate issues?

- Wait 24 hours for full propagation
- Vercel auto-renews Let's Encrypt certificates
- Check: https://vercel.com/ashley-mckinnons-projects/islakaydpro/settings/domains

### Still showing old site?

- Clear browser cache (Ctrl+Shift+Delete)
- Try incognito mode
- Flush DNS: `ipconfig /flushdns` (Windows) or `sudo dscacheutil -flushcache` (Mac)

---

## Environment Variable Update

After setting custom domain, update:

```bash
vercel env add VITE_APP_URL production
# Enter: https://yourdomain.com

vercel --prod
```

---

## DNS Propagation Time

- **Nameserver changes**: 24-48 hours (usually 2-4 hours)
- **A/CNAME records**: 5-60 minutes
- **SSL certificate**: Automatic after DNS resolves

Check propagation: https://dnschecker.org

---

## Popular Registrar Guides

### Namecheap
1. Dashboard → Domain List → Manage
2. Advanced DNS tab
3. Add records as shown above

### GoDaddy
1. My Products → DNS
2. Add records

### Google Domains
1. DNS → Custom records
2. Add records

### Cloudflare
1. DNS tab
2. Add records
3. Set SSL/TLS to "Full"

---

## Security Best Practices

After domain setup:

1. **Enable HSTS**: Already configured in vercel.json
2. **Set up CAA records**: Optional, prevents unauthorized SSL
3. **Enable Domain Lock**: Prevent unauthorized transfers
4. **Use Vercel's CDN**: Automatic with custom domain

---

## Cost Estimate

- Domain: $10-15/year
- Vercel hosting: FREE (or $20/month for Pro)
- SSL certificate: FREE (Let's Encrypt)
- **Total**: ~$10-15/year for domain only

---

## Example Complete Setup

For domain `islakayd.com`:

```
# DNS Records
A     @       76.76.21.21           3600
CNAME www     cname.vercel-dns.com  3600

# Result
https://islakayd.com         → Main site
https://www.islakayd.com     → Redirects to main
```

---

**Ready to set up?** Run: `./setup-all-services.sh` to configure everything!
