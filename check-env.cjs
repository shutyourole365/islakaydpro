const fs = require('fs');
const path = require('path');

console.log('🔍 Checking Environment Variables...\n');

// Read .env.local
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('❌ .env.local not found!');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf-8');

// Parse variables
const vars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([A-Z_]+)=(.*)$/);
  if (match) {
    vars[match[1]] = match[2];
  }
});

console.log('📋 Environment Variables Status:\n');

const checks = [
  { name: 'VITE_SUPABASE_URL', required: true, current: vars.VITE_SUPABASE_URL },
  { name: 'VITE_SUPABASE_ANON_KEY', required: true, current: vars.VITE_SUPABASE_ANON_KEY },
  { name: 'VITE_APP_URL', required: false, current: vars.VITE_APP_URL },
  { name: 'VITE_STRIPE_PUBLISHABLE_KEY', required: false, current: vars.VITE_STRIPE_PUBLISHABLE_KEY },
  { name: 'VITE_GA_MEASUREMENT_ID', required: false, current: vars.VITE_GA_MEASUREMENT_ID },
  { name: 'VITE_ENABLE_ANALYTICS', required: false, current: vars.VITE_ENABLE_ANALYTICS },
  { name: 'VITE_SENTRY_DSN', required: false, current: vars.VITE_SENTRY_DSN },
  { name: 'VITE_ENABLE_AI_CHAT', required: false, current: vars.VITE_ENABLE_AI_CHAT },
  { name: 'VITE_ENABLE_AR_PREVIEW', required: false, current: vars.VITE_ENABLE_AR_PREVIEW },
  { name: 'VITE_ENABLE_BIOMETRIC_AUTH', required: false, current: vars.VITE_ENABLE_BIOMETRIC_AUTH },
];

let missingRequired = 0;
let missingOptional = 0;

checks.forEach(check => {
  const hasValue = check.current && check.current.length > 0;
  const status = hasValue ? '✅' : (check.required ? '❌' : '⚠️ ');
  const type = check.required ? '[REQUIRED]' : '[OPTIONAL]';
  
  console.log(`${status} ${check.name.padEnd(35)} ${type.padEnd(12)}`);
  
  if (hasValue) {
    const displayValue = check.current.length > 60 
      ? check.current.substring(0, 57) + '...' 
      : check.current;
    console.log(`   ${displayValue}`);
  } else {
    console.log('   NOT SET');
  }
  console.log();
  
  if (!hasValue && check.required) missingRequired++;
  if (!hasValue && !check.required) missingOptional++;
});

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

if (missingRequired > 0) {
  console.log(`❌ Missing ${missingRequired} required variable(s)`);
  console.log('   Application will NOT work without these!\n');
  process.exit(1);
} else {
  console.log('✅ All required variables configured!');
}

if (missingOptional > 0) {
  console.log(`⚠️  ${missingOptional} optional variable(s) not configured`);
  console.log('   Features may be limited but app will function.\n');
}

console.log('\n📊 Summary:');
console.log(`   Required: ${checks.filter(c => c.required && c.current).length}/${checks.filter(c => c.required).length} configured`);
console.log(`   Optional: ${checks.filter(c => !c.required && c.current).length}/${checks.filter(c => !c.required).length} configured`);
console.log(`   Total: ${checks.filter(c => c.current).length}/${checks.length} configured\n`);
