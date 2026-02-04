#!/usr/bin/env tsx
/**
 * Seed Equipment Data Script
 * Populates the database with sample equipment listings for testing and demo
 * 
 * Usage:
 *   npm run seed:equipment
 *   or
 *   npx tsx scripts/seed-equipment.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ialxlykysbqyiejepzkx.supabase.co';
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// ============================================
// 🎨 CUSTOMIZE THIS SECTION FOR YOUR MARKET
// ============================================
// 
// To customize for your location/market:
// 1. Update location coordinates (latitude/longitude)
// 2. Adjust prices based on local market rates
// 3. Change equipment brands/models popular in your area
// 4. Update features to match local preferences
// 5. Replace image URLs with actual photos
//
// Quick Location Finder: https://www.latlong.net/
// ============================================

// Sample equipment data with real-world details
const equipmentData = [
  // Construction Equipment
  {
    title: 'CAT 320 Excavator - 20 Ton Heavy Duty',
    description: 'Professional-grade excavator ideal for large construction projects, demolition, and earthmoving. Features GPS navigation, climate-controlled cabin, and low operating hours. Recently serviced with all maintenance records available. Perfect for contractors and construction companies.',
    category: 'Construction Equipment',
    brand: 'Caterpillar',
    model: '320 GC',
    condition: 'excellent',
    daily_rate: 450,
    weekly_rate: 2800,
    monthly_rate: 9500,
    deposit_amount: 2000,
    location: 'Los Angeles, CA',
    latitude: 34.0522,
    longitude: -118.2437,
    features: ['GPS Navigation', 'AC Cabin', 'Low Hours (850)', 'Recent Service', 'Fuel Efficient'],
    specifications: { weight: '20 tons', engine: 'CAT C4.4', power: '162 HP', reach: '32 ft', bucket: '1.2 cubic yards' },
    min_rental_days: 1,
    max_rental_days: 90,
    is_featured: true,
  },
  {
    title: 'JCB 3CX Backhoe Loader with 4WD',
    description: 'Versatile backhoe loader perfect for digging, loading, and material handling. 4WD ensures excellent traction on all terrains. Ideal for utility work, landscaping, and small construction projects. Includes operator manual and safety gear.',
    category: 'Construction Equipment',
    brand: 'JCB',
    model: '3CX',
    condition: 'excellent',
    daily_rate: 325,
    weekly_rate: 1950,
    monthly_rate: 6800,
    deposit_amount: 1500,
    location: 'Houston, TX',
    latitude: 29.7604,
    longitude: -95.3698,
    features: ['4WD', 'Extendable Arm', 'Quick Coupler', 'LED Work Lights', 'Comfortable Seat'],
    specifications: { weight: '8.5 tons', engine: 'JCB EcoMAX', power: '109 HP', dig_depth: '14.5 ft' },
    min_rental_days: 1,
    max_rental_days: 60,
    is_featured: true,
  },
  {
    title: 'Bobcat S650 Skid Steer Loader',
    description: 'Compact and powerful skid steer loader for landscaping, construction, and material handling. Easy to operate with joystick controls. Comes with bucket attachment, forks available for additional fee. Perfect for tight spaces and versatile tasks.',
    category: 'Construction Equipment',
    brand: 'Bobcat',
    model: 'S650',
    condition: 'good',
    daily_rate: 275,
    weekly_rate: 1600,
    monthly_rate: 5500,
    deposit_amount: 1000,
    location: 'Phoenix, AZ',
    latitude: 33.4484,
    longitude: -112.0740,
    features: ['Joystick Controls', 'Quick Attach', 'Enclosed Cab', 'Auxiliary Hydraulics', 'Backup Camera'],
    specifications: { weight: '8,660 lbs', engine: 'Bobcat 2.4L', power: '74 HP', lift_capacity: '2,300 lbs' },
    min_rental_days: 1,
    max_rental_days: 90,
    is_featured: false,
  },

  // Power Tools
  {
    title: 'DeWalt 20V MAX Combo Kit - 15 Piece Professional Set',
    description: 'Complete professional power tool kit including drill, impact driver, circular saw, reciprocating saw, oscillating tool, grinder, flashlight, and more. Includes 4 batteries (5.0Ah), fast charger, and rugged carrying case. Perfect for contractors and serious DIYers.',
    category: 'Power Tools',
    brand: 'DeWalt',
    model: 'DCK1500P4',
    condition: 'excellent',
    daily_rate: 75,
    weekly_rate: 400,
    monthly_rate: 1200,
    deposit_amount: 300,
    location: 'Austin, TX',
    latitude: 30.2672,
    longitude: -97.7431,
    features: ['15 Tools', '4 Batteries (5.0Ah)', 'Fast Charger', 'Hard Case', 'Brushless Motors'],
    specifications: { voltage: '20V MAX', battery: '5.0Ah Lithium', tools: '15 pieces', warranty: '3 years' },
    min_rental_days: 1,
    max_rental_days: 30,
    is_featured: true,
  },
  {
    title: 'Milwaukee M18 FUEL Cordless Hammer Drill & Impact Driver',
    description: 'High-performance brushless hammer drill and impact driver combo. Incredible power and runtime for professional applications. Includes 2 batteries, charger, and contractor bag. Industry-leading warranty and reliability.',
    category: 'Power Tools',
    brand: 'Milwaukee',
    model: 'M18 FUEL 2997-22',
    condition: 'excellent',
    daily_rate: 45,
    weekly_rate: 240,
    monthly_rate: 750,
    deposit_amount: 200,
    location: 'Chicago, IL',
    latitude: 41.8781,
    longitude: -87.6298,
    features: ['Brushless Motors', 'REDLITHIUM Batteries', 'LED Lights', 'Metal Belt Clips', '5-Year Warranty'],
    specifications: { voltage: '18V', torque_drill: '1,200 in-lbs', torque_impact: '2,000 in-lbs', weight: '4.6 lbs' },
    min_rental_days: 1,
    max_rental_days: 30,
    is_featured: false,
  },

  // Photography Equipment
  {
    title: 'Sony A7IV Full Frame Camera - Complete Wedding Kit',
    description: 'Professional mirrorless camera package perfect for weddings, events, and commercial photography. Includes Sony A7IV body, 24-70mm f/2.8 GM lens, 70-200mm f/2.8 GM lens, Godox flash system, light stands, and camera bags. Insurance included.',
    category: 'Photography',
    brand: 'Sony',
    model: 'A7IV Kit',
    condition: 'excellent',
    daily_rate: 125,
    weekly_rate: 700,
    monthly_rate: 2200,
    deposit_amount: 500,
    location: 'San Francisco, CA',
    latitude: 37.7749,
    longitude: -122.4194,
    features: ['33MP Sensor', '4K 60fps Video', 'Fast Autofocus', 'Dual Card Slots', 'Premium Lenses', 'Flash Kit'],
    specifications: { sensor: '33MP Full Frame', video: '4K 60fps', battery: '580 shots', weight: '659g', iso: '100-51200' },
    min_rental_days: 1,
    max_rental_days: 30,
    is_featured: true,
  },
  {
    title: 'Canon EOS R5 with RF 24-70mm f/2.8L - 8K Cinema Kit',
    description: 'Top-tier cinema camera for professional videography. Shoots stunning 8K RAW video with incredible detail. Includes stabilized RF lens, extra batteries, CFexpress cards, and professional video rig. Perfect for commercial shoots and high-end productions.',
    category: 'Photography',
    brand: 'Canon',
    model: 'EOS R5',
    condition: 'excellent',
    daily_rate: 175,
    weekly_rate: 950,
    monthly_rate: 3000,
    deposit_amount: 800,
    location: 'New York, NY',
    latitude: 40.7128,
    longitude: -74.0060,
    features: ['45MP Sensor', '8K RAW Video', 'In-Body Stabilization', 'RF Mount', 'Dual Card Slots', 'Video Rig'],
    specifications: { sensor: '45MP Full Frame', video: '8K 30fps', battery: '490 shots', weight: '738g', autofocus: 'Dual Pixel CMOS AF II' },
    min_rental_days: 1,
    max_rental_days: 14,
    is_featured: true,
  },
  {
    title: 'DJI Ronin RS3 Pro - Professional Gimbal Stabilizer',
    description: 'Advanced 3-axis gimbal for smooth professional video. Supports cameras up to 10 lbs with automated axis locks and LiDAR focus system. Includes briefcase-style case, multiple battery plates, and accessories. Perfect for weddings, commercials, and documentaries.',
    category: 'Photography',
    brand: 'DJI',
    model: 'Ronin RS3 Pro',
    condition: 'excellent',
    daily_rate: 85,
    weekly_rate: 450,
    monthly_rate: 1400,
    deposit_amount: 400,
    location: 'Los Angeles, CA',
    latitude: 34.0522,
    longitude: -118.2437,
    features: ['10 lb Payload', 'LiDAR Focus', 'Automated Axis Locks', 'Carbon Fiber', 'Touch Screen', 'Multiple Modes'],
    specifications: { payload: '10 lbs', battery: '12 hours', weight: '3.3 lbs', stabilization: '3-axis' },
    min_rental_days: 1,
    max_rental_days: 21,
    is_featured: false,
  },

  // Event Equipment
  {
    title: '20x40 Premium Wedding Tent - White Frame Tent Package',
    description: 'Elegant frame tent for outdoor weddings and upscale events. Includes professional installation, string lighting, sidewalls, and weighted bases. Accommodates 80 guests seated or 120 standing. Weather-resistant and beautiful for any occasion.',
    category: 'Events',
    brand: 'Anchor Industries',
    model: 'Century Frame 20x40',
    condition: 'excellent',
    daily_rate: 495,
    weekly_rate: 2500,
    monthly_rate: null,
    deposit_amount: 800,
    location: 'Nashville, TN',
    latitude: 36.1627,
    longitude: -86.7816,
    features: ['800 sq ft', 'String Lighting', 'Sidewalls', 'Professional Setup', 'Climate Control Ready', 'Weighted Bases'],
    specifications: { size: '20x40 ft', capacity_seated: '80', capacity_standing: '120', height: '10 ft', material: 'Commercial Vinyl' },
    min_rental_days: 1,
    max_rental_days: 7,
    is_featured: true,
  },
  {
    title: 'Professional DJ Equipment Package - Complete Sound System',
    description: 'Complete DJ setup for weddings, corporate events, and parties. Includes Pioneer DDJ-1000 controller, QSC K12.2 powered speakers, KS112 subwoofer, wireless mics, LED lighting package, and all necessary cables. Setup assistance available.',
    category: 'Events',
    brand: 'Pioneer',
    model: 'Complete DJ Package',
    condition: 'excellent',
    daily_rate: 295,
    weekly_rate: 1500,
    monthly_rate: 4500,
    deposit_amount: 1000,
    location: 'Miami, FL',
    latitude: 25.7617,
    longitude: -80.1918,
    features: ['Pro DJ Controller', '4000W Speakers', 'Subwoofer', 'LED Lighting', '2 Wireless Mics', 'Setup Included'],
    specifications: { controller: 'DDJ-1000', speakers: '2x K12.2 (2000W each)', subwoofer: 'KS112 (1000W)', coverage: '200-300 people' },
    min_rental_days: 1,
    max_rental_days: 14,
    is_featured: true,
  },

  // Landscaping Equipment
  {
    title: 'John Deere 1025R Compact Tractor with Front Loader',
    description: 'Versatile compact utility tractor perfect for property maintenance, landscaping, and light construction. Hydrostatic transmission makes it easy to operate. Comes with front loader bucket, 4WD, and power steering. Ideal for homeowners and landscapers.',
    category: 'Landscaping',
    brand: 'John Deere',
    model: '1025R',
    condition: 'excellent',
    daily_rate: 225,
    weekly_rate: 1200,
    monthly_rate: 3800,
    deposit_amount: 1500,
    location: 'Denver, CO',
    latitude: 39.7392,
    longitude: -104.9903,
    features: ['Front Loader', 'Hydrostatic Drive', '4WD', 'Power Steering', 'Diesel Engine', 'Turf Tires'],
    specifications: { engine: '24.2 HP Diesel', transmission: 'Hydrostatic', lift_capacity: '681 lbs', pto: '18 HP', weight: '1,565 lbs' },
    min_rental_days: 1,
    max_rental_days: 60,
    is_featured: true,
  },
  {
    title: 'Commercial Zero-Turn Mower - 60 inch Deck',
    description: 'Professional-grade zero-turn mower for large properties and commercial use. 60-inch cutting deck covers 5+ acres per hour. Comfortable suspension seat, powerful Kawasaki engine, and striping kit included. Perfect for landscaping businesses.',
    category: 'Landscaping',
    brand: 'Scag',
    model: 'Turf Tiger II',
    condition: 'excellent',
    daily_rate: 150,
    weekly_rate: 750,
    monthly_rate: 2400,
    deposit_amount: 500,
    location: 'Atlanta, GA',
    latitude: 33.7490,
    longitude: -84.3880,
    features: ['60" Deck', 'Suspension Seat', 'Striping Kit', 'Kawasaki Engine', 'Zero-Turn', 'Commercial Grade'],
    specifications: { engine: '31 HP Kawasaki', deck: '60 inches', speed: '12 mph', fuel: '12 gallons', cutting_height: '1.5-5 inches' },
    min_rental_days: 1,
    max_rental_days: 30,
    is_featured: false,
  },

  // Specialty Equipment
  {
    title: 'DJI Mavic 3 Pro Drone - Professional Aerial Photography',
    description: 'Premium drone with Hasselblad camera and 4/3 CMOS sensor. 46-minute flight time, obstacle avoidance, and 5.1K video capability. FAA Part 107 compliant. Includes extra batteries, ND filters, hard case, and comprehensive insurance. Pilot services available.',
    category: 'Photography',
    brand: 'DJI',
    model: 'Mavic 3 Pro',
    condition: 'excellent',
    daily_rate: 150,
    weekly_rate: 800,
    monthly_rate: 2400,
    deposit_amount: 600,
    location: 'Seattle, WA',
    latitude: 47.6062,
    longitude: -122.3321,
    features: ['Hasselblad Camera', '46min Flight', '5.1K Video', 'Obstacle Sensing', 'Pro Controller', '3x Batteries'],
    specifications: { sensor: '4/3 CMOS 20MP', video: '5.1K 50fps', range: '15km', flight_time: '46 min', weight: '895g' },
    min_rental_days: 1,
    max_rental_days: 14,
    is_featured: true,
  },
  {
    title: 'Commercial Pressure Washer - 4000 PSI Gas Powered',
    description: 'Heavy-duty gas-powered pressure washer for commercial cleaning jobs. 4000 PSI and 4.0 GPM for fast, efficient cleaning. Includes surface cleaner attachment, multiple nozzle tips, and 50-foot hose. Perfect for driveways, decks, and building exteriors.',
    category: 'Power Tools',
    brand: 'Simpson',
    model: 'PS4240',
    condition: 'excellent',
    daily_rate: 95,
    weekly_rate: 450,
    monthly_rate: 1400,
    deposit_amount: 250,
    location: 'Phoenix, AZ',
    latitude: 33.4484,
    longitude: -112.0740,
    features: ['4000 PSI', 'Honda Engine', 'Surface Cleaner', '50ft Hose', 'Multiple Tips', 'Large Wheels'],
    specifications: { pressure: '4000 PSI', flow: '4.0 GPM', engine: 'Honda GX390', hose: '50 ft', weight: '85 lbs' },
    min_rental_days: 1,
    max_rental_days: 30,
    is_featured: false,
  },
];

async function seedEquipment() {
  console.log('🌱 Starting equipment seed process...\n');

  try {
    // Get or create a demo owner
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name')
      .limit(1);

    if (profileError) {
      console.error('❌ Error fetching profiles:', profileError.message);
      return;
    }

    let ownerId: string;
    
    if (profiles && profiles.length > 0) {
      ownerId = profiles[0].id;
      console.log(`✅ Using existing profile: ${profiles[0].full_name || 'Owner'} (${ownerId.substring(0, 8)}...)`);
    } else {
      console.log('⚠️  No profiles found.\n');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📝 QUICK SETUP: Create a user account first!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      console.log('🎯 EASIEST METHOD - Supabase Dashboard (30 seconds):');
      console.log('   1. Open: https://supabase.com/dashboard/project/ialxlykysbqyiejepzkx/auth/users');
      console.log('   2. Click green "Add User" button');
      console.log('   3. Fill in:');
      console.log('      • Email: demo@islakayd.com');
      console.log('      • Password: Demo123456!');
      console.log('      • ✅ Check "Auto Confirm User"');
      console.log('   4. Click "Create User"');
      console.log('   5. Wait 2 seconds\n');
      console.log('   Then run: npm run seed:equipment\n');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      console.log('Alternative - Via Your Website:');
      console.log('   1. Visit: http://localhost:5173');
      console.log('   2. Click "Get Started" → Sign up');
      console.log('   3. Use any email/password\n');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      return;
    }

    // Get category IDs
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('id, name, slug');

    if (catError) {
      console.error('❌ Error fetching categories:', catError.message);
      return;
    }

    if (!categories || categories.length === 0) {
      console.log('⚠️  No categories found. Creating default categories...');
      // Create default categories would go here
      return;
    }

    console.log(`✅ Found ${categories.length} categories\n`);

    // Map category names to IDs
    const categoryMap = new Map(
      categories.map(cat => [cat.name, cat.id])
    );

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    // Insert equipment
    for (const equipment of equipmentData) {
      const categoryId = categoryMap.get(equipment.category);
      
      if (!categoryId) {
        console.log(`⏭️  Skipping "${equipment.title}" - category not found: ${equipment.category}`);
        skipCount++;
        continue;
      }

      const equipmentRecord = {
        owner_id: ownerId,
        category_id: categoryId,
        title: equipment.title,
        description: equipment.description,
        brand: equipment.brand,
        model: equipment.model,
        condition: equipment.condition,
        daily_rate: equipment.daily_rate,
        weekly_rate: equipment.weekly_rate,
        monthly_rate: equipment.monthly_rate,
        deposit_amount: equipment.deposit_amount,
        location: equipment.location,
        latitude: equipment.latitude,
        longitude: equipment.longitude,
        images: [
          `https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=800`,
          `https://images.unsplash.com/photo-1581092918484-8313e1f7e8c7?w=800`,
        ],
        features: equipment.features,
        specifications: equipment.specifications,
        availability_status: 'available',
        min_rental_days: equipment.min_rental_days,
        max_rental_days: equipment.max_rental_days,
        is_featured: equipment.is_featured,
        is_active: true,
      };

      const { error: insertError } = await supabase
        .from('equipment')
        .insert(equipmentRecord);

      if (insertError) {
        console.log(`❌ Error inserting "${equipment.title}":`, insertError.message);
        errorCount++;
      } else {
        console.log(`✅ Created: ${equipment.title}`);
        successCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 Seed Summary:');
    console.log(`   ✅ Successfully created: ${successCount} equipment`);
    console.log(`   ⏭️  Skipped: ${skipCount} equipment`);
    console.log(`   ❌ Errors: ${errorCount} equipment`);
    console.log('='.repeat(60) + '\n');

    if (successCount > 0) {
      console.log('🎉 Equipment seeding completed successfully!');
      console.log('   Visit your app to see the new listings.\n');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

// Run the seed function
seedEquipment();
