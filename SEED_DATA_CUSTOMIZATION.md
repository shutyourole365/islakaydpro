# 🎨 Seed Data Customization Guide

Quick guide to customize equipment data for your local market!

---

## 🚀 Quick Start

The seed script is in: `scripts/seed-equipment.ts`

**Run it:**
```bash
npm run seed:equipment
```

**What it does:**
- Creates 15 professional equipment listings
- Assigns them to first user in your database
- Uses realistic prices and descriptions
- Adds proper categories and locations

---

## 📍 Customize Locations

### Find Your Coordinates

Use: https://www.latlong.net/

**Example:** For New York City
```typescript
location: 'New York, NY',
latitude: 40.7128,
longitude: -74.0060,
```

### Update All Locations

Search for `latitude:` in the file and update each location:

```typescript
// Find these lines and update:
location: 'Los Angeles, CA',
latitude: 34.0522,
longitude: -118.2437,

// Change to your city:
location: 'Your City, ST',
latitude: YOUR_LAT,
longitude: YOUR_LNG,
```

**Pro Tip:** Use Find & Replace:
- Find: `Los Angeles, CA`
- Replace: `Your City, ST`

Then update all latitude/longitude values.

---

## 💰 Adjust Pricing for Your Market

### Research Local Rates

Check competitors:
- **BigRentz.com** - Construction equipment
- **SharGrid.com** - Tool rentals
- **BorrowLenses.com** - Camera equipment
- **Local rental stores** - Call for quotes

### Update Prices

Search for `daily_rate:` in the file:

```typescript
// Current (example):
daily_rate: 450,
weekly_rate: 2800,
monthly_rate: 9500,

// Adjust based on your market research:
daily_rate: 375,      // Your competitive rate
weekly_rate: 2300,    // Usually 5x daily
monthly_rate: 8000,   // Usually 18x daily
```

**Pricing Formula:**
- Weekly = Daily × 5 (30% discount)
- Monthly = Daily × 18 (40% discount)

---

## 🏷️ Change Equipment Types

### Focus on Your Niche

If you're targeting a specific market:

**Photography Only:**
```typescript
// Keep only camera-related equipment
// Remove: Construction, landscaping equipment
// Add more: Lenses, lighting, video gear
```

**Construction Only:**
```typescript
// Keep only construction equipment
// Remove: Cameras, event equipment
// Add more: Excavators, loaders, compactors
```

**Events Only:**
```typescript
// Keep only event equipment
// Remove: Construction, cameras
// Add more: Tents, tables, chairs, decorations
```

### Add New Equipment

Copy this template and modify:

```typescript
{
  title: 'YOUR EQUIPMENT NAME',
  description: 'Detailed description here. Include what makes it special, condition, and what\'s included.',
  category: 'Category Name',  // Must match category in database
  brand: 'Brand Name',
  model: 'Model Number',
  condition: 'excellent', // 'excellent' | 'good' | 'fair'
  daily_rate: 100,
  weekly_rate: 500,
  monthly_rate: 1500,
  deposit_amount: 300,
  location: 'Your City, ST',
  latitude: 40.7128,
  longitude: -74.0060,
  features: ['Feature 1', 'Feature 2', 'Feature 3'],
  specifications: { 
    key1: 'value1', 
    key2: 'value2' 
  },
  min_rental_days: 1,
  max_rental_days: 30,
  is_featured: false,
},
```

---

## 📸 Add Real Images

### Current Setup (Placeholder)

```typescript
images: [
  `https://images.unsplash.com/photo-xxx?w=800`,
  `https://images.unsplash.com/photo-yyy?w=800`,
],
```

### Option 1: Find Better Unsplash Images

1. Go to: https://unsplash.com
2. Search for your equipment
3. Click photo → Copy link
4. Use the "Download" URL

**Example:**
```typescript
images: [
  'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=800',
  'https://images.unsplash.com/photo-1581092918484-8313e1f7e8c7?w=800',
],
```

### Option 2: Use Your Own Photos

1. Upload to Supabase Storage:
```bash
# In Supabase Dashboard:
Storage → equipment-images → Upload
```

2. Get public URL:
```
https://[your-project].supabase.co/storage/v1/object/public/equipment-images/excavator-1.jpg
```

3. Use in seed data:
```typescript
images: [
  'https://[your-project].supabase.co/storage/v1/object/public/equipment-images/excavator-1.jpg',
  'https://[your-project].supabase.co/storage/v1/object/public/equipment-images/excavator-2.jpg',
],
```

---

## 🎯 Features & Specifications

### Make Them Specific

**Generic (❌):**
```typescript
features: ['Good condition', 'Works well', 'Nice equipment'],
```

**Specific (✅):**
```typescript
features: [
  'GPS Navigation System',
  'Climate-Controlled Cabin',
  'Low Hours (850 hours)',
  'Recent Service (Jan 2026)',
  'Backup Camera',
  'LED Work Lights'
],
```

### Specifications That Matter

Different equipment needs different specs:

**Construction Equipment:**
```typescript
specifications: {
  weight: '20 tons',
  engine: 'CAT C4.4 Diesel',
  power: '162 HP',
  reach: '32 ft',
  bucket_capacity: '1.2 cubic yards',
  max_dig_depth: '21 ft'
}
```

**Cameras:**
```typescript
specifications: {
  sensor: '33MP Full Frame',
  video: '4K 60fps',
  battery_life: '580 shots',
  weight: '659g',
  iso_range: '100-51200',
  autofocus_points: '693'
}
```

**Power Tools:**
```typescript
specifications: {
  voltage: '20V MAX',
  battery: '5.0Ah Lithium-ion',
  max_torque: '1,200 in-lbs',
  weight: '4.6 lbs',
  chuck_size: '1/2 inch',
  warranty: '3 years'
}
```

---

## 🏆 Pro Tips

### 1. Start Small
- Begin with 5-10 items
- Test that they show up correctly
- Then add more

### 2. Match Real Inventory
- If you have actual equipment to list, add it here
- Use real photos from your equipment
- Set realistic prices you'd actually charge

### 3. Vary the Data
- Different price points (budget to premium)
- Different locations (if multi-city)
- Different conditions (excellent to good)
- Featured vs. non-featured items

### 4. Test Categories First
- Make sure categories exist in database
- Run: `SELECT name FROM categories;` in Supabase
- Match category names exactly

### 5. Make It Realistic
- Use real brand names
- Actual model numbers
- Market-rate pricing
- Honest condition descriptions

---

## 🔧 Common Customizations

### Scenario 1: Local Photography Rental Business

```typescript
// Focus on cameras and photo gear
// Locations: Your studio address
// Prices: 20-30% below local rental shops
// Add: Lenses, lighting, backdrops, props

{
  title: 'Sony A7IV + 24-70mm f/2.8 GM Lens',
  description: 'Professional wedding photography kit...',
  category: 'Photography',
  daily_rate: 125,  // vs. $180 at local shop
  location: 'Your Studio, Your City',
  // ... rest
}
```

### Scenario 2: Construction Equipment Marketplace

```typescript
// Focus on heavy equipment
// Locations: Multiple job sites
// Prices: 30-40% below big rental companies
// Add: Excavators, loaders, lifts, tools

{
  title: 'JCB Excavator - 5 Ton Mini',
  description: 'Perfect for residential projects...',
  category: 'Construction Equipment',
  daily_rate: 250,  // vs. $400 at United Rentals
  location: 'Available for delivery within 50 miles',
  // ... rest
}
```

### Scenario 3: Multi-Category Platform

```typescript
// Diverse equipment types
// Multiple locations across city
// Competitive pricing across all categories
// Build marketplace feel

// Mix construction, photography, events, landscaping
// Show variety and availability
```

---

## ✅ Customization Checklist

Before running seed script:

- [ ] Updated all locations to your target market
- [ ] Adjusted prices based on local research
- [ ] Changed equipment to match your inventory
- [ ] Updated features to be specific and accurate
- [ ] Modified specifications to be relevant
- [ ] Replaced placeholder images (optional)
- [ ] Verified category names match database
- [ ] Set realistic min/max rental days
- [ ] Marked appropriate items as featured
- [ ] Set appropriate deposit amounts

---

## 🚀 Ready to Seed?

```bash
# Install dependencies (if haven't already)
npm install -D tsx

# Run the seed script
npm run seed:equipment

# You should see:
# ✅ Created: [Equipment name]
# ✅ Created: [Equipment name]
# ...
# 📊 Seed Summary: X equipment successfully created
```

**Next Steps:**
1. Visit your app
2. Browse the equipment
3. Verify everything looks correct
4. Make adjustments if needed
5. Re-run seed script after changes

---

## 🐛 Troubleshooting

### "No profiles found"
**Solution:** Sign up for an account first, then run seed script.

### "Category not found"
**Solution:** Make sure category names match exactly:
```sql
-- Check categories in Supabase:
SELECT name FROM categories;

-- Make sure seed data uses exact names
```

### Equipment not showing
**Solution:** Check `is_active` is `true` in database:
```sql
UPDATE equipment SET is_active = true;
```

### Wrong owner
**Solution:** Update owner_id in seed script or reassign in database:
```sql
UPDATE equipment SET owner_id = 'YOUR_USER_ID';
```

---

## 📚 Resources

- **Find Coordinates:** https://www.latlong.net/
- **Free Stock Photos:** https://unsplash.com (search: excavator, camera, tools)
- **Pricing Research:**
  - BigRentz.com (construction)
  - BorrowLenses.com (photography)
  - HomeDepot.com/toolrental (tools)
- **Equipment Specs:** Manufacturer websites

---

🎉 **Your seed data is now customized for your market! Run the script and watch your marketplace come to life!**
