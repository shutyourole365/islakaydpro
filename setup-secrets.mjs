// Run with:
// SUPABASE_ACCESS_TOKEN=... STRIPE_SECRET_KEY=sk_test_... STRIPE_PUBLISHABLE_KEY=pk_test_... node setup-secrets.mjs

const SUPABASE_ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const PROJECT_REF = process.env.SUPABASE_PROJECT_REF || 'purmabjcvznntttvtseb';
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY;

if (!SUPABASE_ACCESS_TOKEN) {
  console.error('❌ Missing SUPABASE_ACCESS_TOKEN env var');
  process.exit(1);
}

if (!STRIPE_SECRET_KEY) {
  console.error('❌ Missing STRIPE_SECRET_KEY env var');
  console.error('Run with: SUPABASE_ACCESS_TOKEN=... STRIPE_SECRET_KEY=sk_test_... STRIPE_PUBLISHABLE_KEY=pk_test_... node setup-secrets.mjs');
  process.exit(1);
}

if (!STRIPE_PUBLISHABLE_KEY) {
  console.error('❌ Missing STRIPE_PUBLISHABLE_KEY env var');
  process.exit(1);
}

console.log('Setting Supabase Edge Function secrets...\n');

// Step 1: Set STRIPE_SECRET_KEY + STRIPE_PUBLISHABLE_KEY
const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/secrets`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify([
    { name: 'STRIPE_SECRET_KEY', value: STRIPE_SECRET_KEY },
    { name: 'STRIPE_PUBLISHABLE_KEY', value: STRIPE_PUBLISHABLE_KEY },
  ]),
});

if (res.ok) {
  console.log('✅ STRIPE_SECRET_KEY set successfully');
  console.log('✅ STRIPE_PUBLISHABLE_KEY set successfully');
} else {
  const err = await res.text();
  console.error('❌ Failed to set secrets:', err);
  process.exit(1);
}

// Step 2: Create Stripe webhook
console.log('\nCreating Stripe webhook endpoint...');

const params = new URLSearchParams();
params.append('url', `https://${PROJECT_REF}.supabase.co/functions/v1/stripe-webhook`);
params.append('enabled_events[]', 'checkout.session.completed');
params.append('enabled_events[]', 'payment_intent.succeeded');
params.append('enabled_events[]', 'payment_intent.payment_failed');
params.append('description', 'IslaKayd Pro webhook');

const webhookRes = await fetch('https://api.stripe.com/v1/webhook_endpoints', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  body: params,
});

const webhook = await webhookRes.json();

if (webhookRes.ok) {
  console.log('✅ Stripe webhook created');
  console.log(`   Webhook ID: ${webhook.id}`);

  // Step 3: Save webhook secret to Supabase
  const secretRes = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/secrets`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([
      { name: 'STRIPE_WEBHOOK_SECRET', value: webhook.secret },
    ]),
  });

  if (secretRes.ok) {
    console.log('✅ STRIPE_WEBHOOK_SECRET set in Supabase');
  } else {
    const err = await secretRes.text();
    console.error('❌ Failed to set webhook secret:', err);
  }
} else {
  if (webhook.error?.code === 'resource_already_exists') {
    console.log('ℹ️  Webhook endpoint already exists — skipping');
  } else {
    console.error('❌ Failed to create webhook:', webhook.error?.message);
  }
}

console.log('\n✅ All done! Stripe + Supabase are fully connected.');
