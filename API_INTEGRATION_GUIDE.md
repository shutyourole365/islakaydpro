# API Integration Guide - Part C Implementation

## 🎯 Overview

This guide provides step-by-step instructions to connect all 6 balanced approach components to real APIs. After completing these integrations, the platform will have production-ready features with actual data processing.

---

## 1️⃣ Stripe Payment Integration (MultiPaymentSystem)

### Installation
```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

### Environment Variables
Add to `.env.local`:
```bash
VITE_STRIPE_PUBLIC_KEY=pk_test_your_key_here
```

### Backend Setup (Supabase Edge Function)
Create `supabase/functions/create-payment-intent/index.ts`:
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@13.4.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

serve(async (req) => {
  const { amount, currency = 'usd', bookingId } = await req.json();
  
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata: { bookingId },
    });
    
    return new Response(
      JSON.stringify({ clientSecret: paymentIntent.client_secret }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
```

Deploy function:
```bash
supabase functions deploy create-payment-intent --no-verify-jwt
```

### Frontend Integration
Update `src/components/payments/MultiPaymentSystem.tsx`:

```tsx
import { useState, useEffect } from 'react';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { supabase } from '../../lib/supabase';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// Card payment component
function CardPaymentForm({ amount, onSuccess, onError }: CardPaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) return;
    
    setIsProcessing(true);
    
    try {
      // Get client secret from backend
      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: { amount, currency: 'usd' }
      });
      
      if (error) throw error;
      
      // Confirm card payment
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        data.clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement)!,
            billing_details: {
              // Add billing details from form
            }
          }
        }
      );
      
      if (stripeError) {
        throw stripeError;
      }
      
      if (paymentIntent.status === 'succeeded') {
        onSuccess({
          method: 'card',
          transactionId: paymentIntent.id,
          amount: paymentIntent.amount / 100,
        });
      }
    } catch (error) {
      onError(error.message);
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <CardElement
        options={{
          style: {
            base: {
              fontSize: '16px',
              color: '#424770',
              '::placeholder': { color: '#aab7c4' },
            },
            invalid: { color: '#9e2146' },
          },
        }}
      />
      <button 
        type="submit" 
        disabled={!stripe || isProcessing}
        className="mt-4 w-full py-3 bg-teal-500 text-white rounded-xl"
      >
        {isProcessing ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
      </button>
    </form>
  );
}

// Main component wrapper
export default function MultiPaymentSystem(props: MultiPaymentSystemProps) {
  return (
    <Elements stripe={stripePromise}>
      <MultiPaymentSystemContent {...props} />
    </Elements>
  );
}
```

### Database Tracking
Create payment records table:
```sql
CREATE TABLE payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  payment_method VARCHAR(50) NOT NULL,
  stripe_payment_intent_id TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_payment_transactions_booking ON payment_transactions(booking_id);
CREATE INDEX idx_payment_transactions_user ON payment_transactions(user_id);
CREATE INDEX idx_payment_transactions_status ON payment_transactions(status);
```

### Testing
```bash
# Test card numbers (Stripe test mode)
4242 4242 4242 4242  # Success
4000 0000 0000 9995  # Decline
4000 0025 0000 3155  # 3D Secure required
```

---

## 2️⃣ OpenAI Integration (AISearchEngine)

### Installation
```bash
npm install openai
```

### Environment Variables
```bash
VITE_OPENAI_API_KEY=sk-your_key_here
```

### Backend Setup (Supabase Edge Function)
Create `supabase/functions/analyze-search/index.ts`:
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { OpenAI } from 'https://deno.land/x/openai@v4.20.1/mod.ts';

const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY'),
});

serve(async (req) => {
  const { query } = await req.json();
  
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are an equipment rental search assistant. Analyze user queries and extract:
            - intent: main equipment type (excavator, camera, truck, etc.)
            - category: rental category (Construction, Photography, Events, etc.)
            - location: city or region mentioned
            - priceRange: budget constraints {min, max}
            - duration: rental period (days, weeks, months)
            - features: specific requirements (GPS, AC, brand, etc.)
            - confidence: 0-1 score for analysis accuracy
            
            Return ONLY valid JSON matching this schema:
            {
              "intent": string,
              "category": string | null,
              "location": string | null,
              "priceRange": { "min": number | null, "max": number | null },
              "duration": { "value": number | null, "unit": "day" | "week" | "month" | null },
              "features": string[],
              "confidence": number
            }`
        },
        { role: 'user', content: query }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });
    
    const analysis = JSON.parse(response.choices[0].message.content);
    
    return new Response(
      JSON.stringify(analysis),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
```

Deploy:
```bash
supabase functions deploy analyze-search --no-verify-jwt
```

### Frontend Integration
Update `src/components/search/AISearchEngine.tsx`:

```tsx
import { supabase } from '../../lib/supabase';

const analyzeSearchQuery = async (query: string): Promise<SearchAnalysis> => {
  setIsAnalyzing(true);
  
  try {
    const { data, error } = await supabase.functions.invoke('analyze-search', {
      body: { query }
    });
    
    if (error) throw error;
    
    return data as SearchAnalysis;
  } catch (error) {
    console.error('AI analysis failed:', error);
    // Fallback to rule-based analysis
    return fallbackAnalysis(query);
  } finally {
    setIsAnalyzing(false);
  }
};

// Fallback for when API fails
const fallbackAnalysis = (query: string): SearchAnalysis => {
  const lowerQuery = query.toLowerCase();
  
  // Simple keyword matching
  const equipmentKeywords = {
    excavator: 'Construction',
    camera: 'Photography',
    tent: 'Events',
    // ... more mappings
  };
  
  let intent = 'general equipment';
  let category = null;
  
  for (const [keyword, cat] of Object.entries(equipmentKeywords)) {
    if (lowerQuery.includes(keyword)) {
      intent = keyword;
      category = cat;
      break;
    }
  }
  
  // Extract location (simple regex)
  const locationMatch = lowerQuery.match(/in\s+([a-z\s]+?)(?:\s|$|,)/i);
  const location = locationMatch ? locationMatch[1].trim() : null;
  
  // Extract price (simple regex)
  const priceMatch = lowerQuery.match(/under\s+\$?(\d+)/i);
  const maxPrice = priceMatch ? parseInt(priceMatch[1]) : null;
  
  return {
    intent,
    category,
    location,
    priceRange: { min: null, max: maxPrice },
    duration: { value: null, unit: null },
    features: [],
    confidence: 0.6,
  };
};
```

### Usage Analytics
Track search queries for improvement:
```sql
CREATE TABLE search_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  query TEXT NOT NULL,
  analysis JSONB,
  result_count INTEGER,
  clicked_equipment_id UUID REFERENCES equipment(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_search_queries_user ON search_queries(user_id);
CREATE INDEX idx_search_queries_created ON search_queries(created_at DESC);
```

---

## 3️⃣ Supabase Storage (PhotoMessaging)

### Storage Bucket Setup
```sql
-- Create bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('message-photos', 'message-photos', true);

-- Set up policies
CREATE POLICY "Users can upload their own photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'message-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view conversation photos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'message-photos' AND
  EXISTS (
    SELECT 1 FROM conversation_participants cp
    WHERE cp.user_id = auth.uid()
    AND (storage.foldername(name))[1] = cp.conversation_id::text
  )
);

CREATE POLICY "Users can delete their own photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'message-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
```

### Database Schema
```sql
CREATE TABLE message_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  thumbnail_url TEXT,
  file_size INTEGER,
  mime_type VARCHAR(50),
  width INTEGER,
  height INTEGER,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_message_photos_message ON message_photos(message_id);
```

### Frontend Integration
Update `src/components/messaging/PhotoMessaging.tsx`:

```tsx
import { supabase } from '../../lib/supabase';
import imageCompression from 'browser-image-compression';

const uploadPhotos = async (files: File[], conversationId: string): Promise<string[]> => {
  const uploadedUrls: string[] = [];
  
  for (const file of files) {
    try {
      // Compress image before upload
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      });
      
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${conversationId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('message-photos')
        .upload(fileName, compressedFile, {
          cacheControl: '3600',
          upsert: false,
        });
      
      if (error) throw error;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('message-photos')
        .getPublicUrl(fileName);
      
      uploadedUrls.push(publicUrl);
      
      // Create thumbnail (optional)
      const thumbnailFile = await imageCompression(file, {
        maxSizeMB: 0.1,
        maxWidthOrHeight: 200,
        useWebWorker: true,
      });
      
      const thumbName = fileName.replace(/(\.[^.]+)$/, '-thumb$1');
      await supabase.storage
        .from('message-photos')
        .upload(thumbName, thumbnailFile);
      
    } catch (error) {
      console.error('Photo upload failed:', error);
      // Continue with other photos
    }
  }
  
  return uploadedUrls;
};

const handleSendMessage = async () => {
  if (!messageText.trim() && uploadedPhotos.length === 0) return;
  
  setIsSending(true);
  
  try {
    // Upload photos first
    const photoUrls = uploadedPhotos.length > 0
      ? await uploadPhotos(uploadedPhotos, conversationId)
      : [];
    
    // Send message with photo URLs
    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: messageText,
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Save photo records
    if (photoUrls.length > 0) {
      const photoRecords = photoUrls.map(url => ({
        message_id: message.id,
        photo_url: url,
      }));
      
      await supabase.from('message_photos').insert(photoRecords);
    }
    
    // Reset form
    setMessageText('');
    setUploadedPhotos([]);
    
    onSendMessage(messageText, photoUrls);
  } catch (error) {
    alert('Failed to send message: ' + error.message);
  } finally {
    setIsSending(false);
  }
};
```

### Image Compression
```bash
npm install browser-image-compression
```

---

## 4️⃣ Real Analytics Data (AnalyticsCharts)

### Backend Queries
Update `src/components/dashboard/AnalyticsCharts.tsx`:

```tsx
import { supabase } from '../../lib/supabase';

const fetchRevenueData = async (userId: string, range: 'week' | 'month' | 'year') => {
  const startDate = new Date();
  
  switch (range) {
    case 'week':
      startDate.setDate(startDate.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(startDate.getMonth() - 1);
      break;
    case 'year':
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
  }
  
  const { data, error } = await supabase
    .from('bookings')
    .select('total_amount, created_at, status')
    .eq('owner_id', userId)
    .eq('payment_status', 'paid')
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: true });
  
  if (error) throw error;
  
  // Group by day/week/month
  const groupedData = groupByTimePeriod(data, range);
  
  return groupedData;
};

const groupByTimePeriod = (data: any[], range: string) => {
  const grouped: Record<string, number> = {};
  
  data.forEach(booking => {
    const date = new Date(booking.created_at);
    let key: string;
    
    if (range === 'week') {
      key = date.toISOString().split('T')[0]; // YYYY-MM-DD
    } else if (range === 'month') {
      key = `${date.getFullYear()}-W${Math.ceil(date.getDate() / 7)}`; // YYYY-WXX
    } else {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM
    }
    
    grouped[key] = (grouped[key] || 0) + booking.total_amount;
  });
  
  return Object.entries(grouped).map(([date, amount]) => ({
    date,
    amount,
  }));
};

// Usage in component
useEffect(() => {
  if (userId) {
    fetchRevenueData(userId, timeRange).then(setChartData);
  }
}, [userId, timeRange, selectedMetric]);
```

### Real-time Updates
Add subscription for live updates:
```tsx
useEffect(() => {
  if (!userId) return;
  
  const channel = supabase
    .channel(`analytics:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'bookings',
        filter: `owner_id=eq.${userId}`,
      },
      (payload) => {
        // Refresh analytics data
        fetchRevenueData(userId, timeRange).then(setChartData);
      }
    )
    .subscribe();
  
  return () => {
    supabase.removeChannel(channel);
  };
}, [userId, timeRange]);
```

---

## 5️⃣ Enhanced Review System (Database Integration)

### Database Schema
```sql
CREATE TABLE review_aspects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
  aspect_name VARCHAR(50) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE review_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_review_aspects_review ON review_aspects(review_id);
CREATE INDEX idx_review_photos_review ON review_photos(review_id);
```

### Frontend Integration
Update `src/components/reviews/EnhancedReviewSystem.tsx`:

```tsx
const submitReview = async () => {
  if (currentStep !== 4) return;
  
  setIsSubmitting(true);
  
  try {
    // 1. Create main review
    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .insert({
        booking_id: bookingId,
        equipment_id: equipmentId,
        reviewer_id: user.id,
        rating: overallRating,
        title: reviewTitle,
        comment: reviewComment,
        is_equipment_review: true,
      })
      .select()
      .single();
    
    if (reviewError) throw reviewError;
    
    // 2. Save aspect ratings
    const aspectRecords = Object.entries(aspectRatings).map(([aspect, rating]) => ({
      review_id: review.id,
      aspect_name: aspect,
      rating,
    }));
    
    const { error: aspectsError } = await supabase
      .from('review_aspects')
      .insert(aspectRecords);
    
    if (aspectsError) throw aspectsError;
    
    // 3. Upload photos
    if (uploadedPhotos.length > 0) {
      const photoUrls: string[] = [];
      
      for (const file of uploadedPhotos) {
        const fileName = `reviews/${review.id}/${Date.now()}-${file.name}`;
        const { data, error } = await supabase.storage
          .from('review-photos')
          .upload(fileName, file);
        
        if (error) throw error;
        
        const { data: { publicUrl } } = supabase.storage
          .from('review-photos')
          .getPublicUrl(fileName);
        
        photoUrls.push(publicUrl);
      }
      
      const photoRecords = photoUrls.map(url => ({
        review_id: review.id,
        photo_url: url,
      }));
      
      await supabase.from('review_photos').insert(photoRecords);
    }
    
    // 4. Update equipment rating
    await updateEquipmentRating(equipmentId);
    
    onSubmit({
      overallRating,
      aspectRatings,
      title: reviewTitle,
      comment: reviewComment,
      photos: uploadedPhotos.map(f => URL.createObjectURL(f)),
    });
    
    onClose();
  } catch (error) {
    alert('Failed to submit review: ' + error.message);
  } finally {
    setIsSubmitting(false);
  }
};

const updateEquipmentRating = async (equipmentId: string) => {
  // Recalculate average rating
  const { data } = await supabase
    .from('reviews')
    .select('rating')
    .eq('equipment_id', equipmentId)
    .eq('is_equipment_review', true);
  
  if (data && data.length > 0) {
    const avgRating = data.reduce((sum, r) => sum + r.rating, 0) / data.length;
    
    await supabase
      .from('equipment')
      .update({
        rating: Math.round(avgRating * 10) / 10,
        total_reviews: data.length,
      })
      .eq('id', equipmentId);
  }
};
```

---

## 6️⃣ PWA Features (Service Worker Enhancement)

### Update Service Worker
Edit `public/sw.js`:

```javascript
const CACHE_NAME = 'islakayd-v1';
const OFFLINE_URL = '/offline.html';

// Assets to cache
const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(OFFLINE_URL);
      })
    );
    return;
  }
  
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((fetchResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          // Cache API responses
          if (event.request.url.startsWith(self.location.origin)) {
            cache.put(event.request, fetchResponse.clone());
          }
          return fetchResponse;
        });
      });
    })
  );
});

// Background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-bookings') {
    event.waitUntil(syncBookings());
  }
});

async function syncBookings() {
  // Sync offline bookings to server
  const db = await openDB();
  const offlineBookings = await db.getAll('offline-bookings');
  
  for (const booking of offlineBookings) {
    try {
      await fetch('/api/bookings', {
        method: 'POST',
        body: JSON.stringify(booking),
      });
      await db.delete('offline-bookings', booking.id);
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }
}

// Push notifications
self.addEventListener('push', (event) => {
  const data = event.data.json();
  
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge.png',
      data: data.url,
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data)
  );
});
```

### Create Offline Page
Create `public/offline.html`:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Offline - Islakayd</title>
  <style>
    body {
      font-family: system-ui, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-align: center;
    }
    .offline-container {
      max-width: 400px;
      padding: 2rem;
    }
    h1 { font-size: 3rem; margin: 0 0 1rem; }
    p { font-size: 1.2rem; opacity: 0.9; }
    button {
      margin-top: 2rem;
      padding: 1rem 2rem;
      background: white;
      color: #667eea;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div class="offline-container">
    <h1>📡</h1>
    <h2>You're Offline</h2>
    <p>No internet connection detected. Please check your connection and try again.</p>
    <button onclick="window.location.reload()">Try Again</button>
  </div>
</body>
</html>
```

---

## 🧪 Testing Checklist

### Before Testing
- [ ] All environment variables set
- [ ] Supabase functions deployed
- [ ] Storage buckets created with policies
- [ ] Database tables created
- [ ] npm packages installed

### Stripe Payment Testing
- [ ] Test card payment with 4242 4242 4242 4242
- [ ] Test declined card with 4000 0000 0000 9995
- [ ] Verify payment intent created in Stripe dashboard
- [ ] Check payment_transactions table for record

### OpenAI Search Testing
- [ ] Enter complex query: "I need a 20-ton excavator in Los Angeles for 5 days under $2000"
- [ ] Verify intent extraction (excavator)
- [ ] Verify location extraction (Los Angeles)
- [ ] Verify price range extraction ($2000 max)
- [ ] Check search_queries table for logged query

### Photo Upload Testing
- [ ] Upload 5 photos (max limit)
- [ ] Verify compression (check file sizes in storage)
- [ ] Verify thumbnails generated
- [ ] Check message_photos table
- [ ] Test photo viewing in conversation

### Analytics Testing
- [ ] View revenue chart with real booking data
- [ ] Toggle between metrics (revenue, bookings, views)
- [ ] Change time range (week, month, year)
- [ ] Verify real-time updates on new booking

### Review System Testing
- [ ] Submit full review with all steps
- [ ] Upload 3 review photos
- [ ] Verify aspect ratings saved
- [ ] Check equipment rating recalculated
- [ ] View review on equipment page

### PWA Testing
- [ ] Test offline mode (DevTools → Network → Offline)
- [ ] Install as app (Chrome → Install app)
- [ ] Test background sync (create booking offline, go online)
- [ ] Test push notifications (if implemented)

---

## 📊 Performance Monitoring

### Sentry Integration
```bash
npm install @sentry/react
```

Configure in `src/main.tsx`:
```tsx
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay(),
  ],
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

### Google Analytics Events
Track key interactions:
```tsx
// Track payment completion
analytics.event('payment_completed', {
  method: 'card',
  amount: 1500,
  currency: 'USD',
});

// Track AI search usage
analytics.event('ai_search_used', {
  query_length: query.length,
  confidence: analysis.confidence,
});

// Track photo uploads
analytics.event('photo_uploaded', {
  count: photos.length,
  total_size: totalBytes,
});
```

---

## 🚨 Common Issues & Solutions

### Issue: Stripe webhook not working
**Solution**: Set up webhook endpoint in Supabase Edge Function and configure in Stripe dashboard.

### Issue: Photos not displaying
**Solution**: Check storage bucket policies and ensure public read access.

### Issue: AI search timeout
**Solution**: Implement fallback to rule-based analysis if API times out.

### Issue: Analytics data missing
**Solution**: Verify booking records exist and payment_status is 'paid'.

### Issue: PWA not installing
**Solution**: Check manifest.json, ensure HTTPS, verify service worker registration.

---

## ✅ Completion Checklist

- [ ] Stripe payments working end-to-end
- [ ] OpenAI search analyzing queries correctly
- [ ] Photos uploading to Supabase Storage
- [ ] Analytics showing real booking data
- [ ] Reviews saving with aspects and photos
- [ ] PWA installing and working offline
- [ ] All API keys secured in environment variables
- [ ] Database tables created and policies set
- [ ] Error tracking configured (Sentry)
- [ ] Performance monitoring active (Analytics)

**Estimated Time**: 6-8 hours for complete integration
**Priority**: High - Required for production launch

---

Last Updated: Now
Status: Ready for Implementation
