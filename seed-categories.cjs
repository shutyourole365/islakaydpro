const { createClient } = require('@supabase/supabase-js');

// Run with: VITE_SUPABASE_URL=... VITE_SUPABASE_ANON_KEY=... node seed-categories.cjs
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing required env vars: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const categories = [
  {
    name: 'Construction Equipment',
    slug: 'construction',
    description: 'Heavy machinery for construction and earthmoving projects',
    icon: '🚜',
    image_url: 'https://images.pexels.com/photos/2058128/pexels-photo-2058128.jpeg'
  },
  {
    name: 'Power Tools',
    slug: 'power-tools',
    description: 'Professional power tools for every job',
    icon: '🔧',
    image_url: 'https://images.pexels.com/photos/1249611/pexels-photo-1249611.jpeg'
  },
  {
    name: 'Photography & Video',
    slug: 'photography',
    description: 'Professional cameras, lenses, and video equipment',
    icon: '📷',
    image_url: 'https://images.pexels.com/photos/51383/photo-camera-subject-photographer-51383.jpeg'
  },
  {
    name: 'Audio & DJ Equipment',
    slug: 'audio',
    description: 'Sound systems, DJ gear, and audio equipment',
    icon: '🎧',
    image_url: 'https://images.pexels.com/photos/164938/pexels-photo-164938.jpeg'
  },
  {
    name: 'Landscaping',
    slug: 'landscaping',
    description: 'Lawn mowers, trimmers, and garden equipment',
    icon: '🌿',
    image_url: 'https://images.pexels.com/photos/2933243/pexels-photo-2933243.jpeg'
  },
  {
    name: 'Events & Parties',
    slug: 'events',
    description: 'Tents, tables, chairs, and party supplies',
    icon: '🎉',
    image_url: 'https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg'
  },
  {
    name: 'Vehicles & Transportation',
    slug: 'vehicles',
    description: 'Trucks, vans, trailers, and moving equipment',
    icon: '🚚',
    image_url: 'https://images.pexels.com/photos/1453499/pexels-photo-1453499.jpeg'
  },
  {
    name: 'Cleaning Equipment',
    slug: 'cleaning',
    description: 'Pressure washers, carpet cleaners, and more',
    icon: '🧹',
    image_url: 'https://images.pexels.com/photos/4239091/pexels-photo-4239091.jpeg'
  },
  {
    name: 'Drones & Aerial',
    slug: 'drones',
    description: 'Professional drones and aerial photography equipment',
    icon: '🚁',
    image_url: 'https://images.pexels.com/photos/442150/pexels-photo-442150.jpeg'
  },
  {
    name: 'Lighting & Effects',
    slug: 'lighting',
    description: 'Professional lighting for events and production',
    icon: '💡',
    image_url: 'https://images.pexels.com/photos/3784566/pexels-photo-3784566.jpeg'
  },
  {
    name: 'Sports & Recreation',
    slug: 'sports',
    description: 'Sports equipment and recreational gear',
    icon: '⚽',
    image_url: 'https://images.pexels.com/photos/163452/basketball-dunk-blue-game-163452.jpeg'
  },
  {
    name: 'Home Improvement',
    slug: 'home-improvement',
    description: 'Tools and equipment for home projects',
    icon: '🏠',
    image_url: 'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg'
  }
];

(async () => {
  console.log('🌱 Seeding categories...\n');

  // Check if categories already exist
  const { count } = await supabase
    .from('categories')
    .select('*', { count: 'exact', head: true });

  if (count > 0) {
    console.log(`⚠️  Found ${count} existing categories. Skipping seed.`);
    console.log('   Run this to reset: DELETE FROM categories;');
    return;
  }

  // Insert categories
  const { data, error } = await supabase
    .from('categories')
    .insert(categories)
    .select();

  if (error) {
    console.error('❌ Error seeding categories:', error.message);
    return;
  }

  console.log(`✅ Successfully created ${data.length} categories:\n`);
  data.forEach(cat => {
    console.log(`   ${cat.icon} ${cat.name} (${cat.slug})`);
  });

  console.log('\n🎉 Database seeding complete!');
})();
