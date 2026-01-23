# Copilot Instructions for Islakayd Equipment Rental Platform

## Project Overview
Islakayd is a React + TypeScript equipment rental marketplace built with Vite, Tailwind CSS, and Supabase. Users can list equipment for rent or browse and book equipment from other owners. The platform features real-time booking, user verification, ratings/reviews, and an AI assistant.

## Architecture & Key Components

### Tech Stack
- **Frontend**: React 18 + TypeScript, Vite bundler, Tailwind CSS, Leaflet for maps
- **Backend**: Supabase (PostgreSQL, auth, real-time)
- **UI Icons**: lucide-react, custom verification badge
- **Build Tools**: ESLint, PostCSS, TypeScript

### Core Data Model ([src/types/index.ts](src/types/index.ts))
- **Profile**: User profiles extended from Supabase auth with rating, verification status, two-factor
- **Equipment**: Listings with dynamic pricing (daily/weekly/monthly rates), geo-location, images, features, specifications
- **Booking**: Rental transactions with date ranges, payment status, cancellation support
- **Category**: Equipment categories with lazy-loaded counts
- Additional: Reviews, Favorites, Notifications, Conversations/Messages, Analytics, VerificationRequests

### Service Architecture ([src/services/database.ts](src/services/database.ts))
All Supabase queries go through the database service layer. Key patterns:
- Queries return data + count for pagination (e.g., `getEquipment()` returns `{data: Equipment[], count: number}`)
- Filters passed as optional params object with chainable query building
- Related data fetched via postfix joins (e.g., `equipment.select('*, owner:profiles(*), category:categories(*)')`)
- Real-time subscriptions for notifications and messages
- Audit logging for compliance (via `logAuditEvent`)

### Authentication & Context ([src/contexts/AuthContext.tsx](src/contexts/AuthContext.tsx))
- Wraps entire app; manages user session, profile, analytics, unread notification count
- Single source of truth for auth state: `user`, `session`, `profile`, `analytics`, `isAuthenticated`, `isLoading`
- Methods: `signIn`, `signUp`, `signOut`, `resetPassword`, `updatePassword`, `refreshProfile`, `refreshNotifications`
- Auto-loads user data on auth state change; use `refreshProfile()` after profile updates

### Component Organization
- **Layout**: [Header](src/components/layout/Header.tsx) (responsive, mobile menu, auth/profile dropdowns), [Footer](src/components/layout/Footer.tsx)
- **Home**: Hero, Categories, FeaturedListings, HowItWorks, Testimonials, CTA
- **Booking**: [BookingCalendar](src/components/booking/BookingCalendar.tsx) (min/max rental days, unavailable dates handling)
- **Search**: [SearchModal](src/components/search/SearchModal.tsx) (location, price range, category filters, trending searches)
- **Equipment**: [EquipmentDetail](src/components/equipment/EquipmentDetail.tsx), EquipmentMap (Leaflet-based)
- **User**: AuthModal, Dashboard, ReviewsSection, NotificationsDropdown
- **AI**: [AIAssistant](src/components/ai/AIAssistant.tsx) (collapsible widget with message suggestions, simulated responses)

## Developer Workflows

### Local Development
```bash
npm run dev          # Start Vite dev server (usually http://localhost:5173)
npm run build        # Production build to dist/
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run typecheck    # Type check without emitting (tsconfig.app.json)
```

### Environment Setup
Create `.env.local` with Supabase credentials:
```
VITE_SUPABASE_URL=<your-project-url>
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

### Database Migrations
Supabase migrations in [supabase/migrations/](supabase/migrations/) are timestamped SQL files. New migrations must:
1. Have security policies (RLS) for all tables
2. Include proper indexes for filtering/sorting
3. Follow naming: `YYYYMMDDHHMMSS_description.sql`

## Booking Flow & Payment Handling

### Booking Lifecycle
Bookings flow through states: `pending` → `confirmed` → `active` → `completed` (or `cancelled`)
- **Payment status** tracked separately: `pending` | `paid` | `refunded`
- Renters can only update `pending` bookings; owners can update any booking they own

### BookingCalendar Component ([src/components/booking/BookingCalendar.tsx](src/components/booking/BookingCalendar.tsx))
```typescript
// Key validation logic in handleDateClick:
const daysDiff = Math.ceil((date.getTime() - selectedStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
if (daysDiff < minRentalDays || daysDiff > maxRentalDays) return; // Enforce limits
// Check for unavailable dates in range before confirming selection
```
- Uses `unavailableDates` array to block already-booked dates
- Validates min/max rental days before accepting range selection
- Automatically calculates `totalPrice = rentalDays * dailyRate`

### Availability Management
```typescript
// Check availability before creating booking
const isAvailable = await checkAvailability(equipmentId, startDate, endDate);
// Block dates after booking confirmed
await blockDates(equipmentId, startDate, endDate, 'booked');
```

### Booking Data Structure ([src/types/index.ts#L60](src/types/index.ts#L60))
Includes: `subtotal`, `service_fee`, `deposit_amount`, `total_amount` for transparent pricing

## Security & Permissions Patterns

### Row-Level Security (RLS)
All tables use Supabase RLS. Key patterns in [migrations](supabase/migrations/):

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| profiles | Public read | Own profile | Own profile | N/A |
| equipment | Public active | Owner only | Owner only | Owner (soft) |
| bookings | Renter OR Owner | Renter only | Status-based | N/A |
| favorites | Own only | Own only | N/A | Own only |
| messages | Sender OR Receiver | Sender only | Receiver (read status) | N/A |

### RLS Performance Optimization
Policies use `(select auth.uid())` instead of `auth.uid()` to prevent re-evaluation per row:
```sql
-- GOOD: Subquery evaluated once
USING (owner_id = (select auth.uid()))
-- BAD: Function called for each row
USING (owner_id = auth.uid())
```

### Audit Logging
Security-sensitive actions logged via `logAuditEvent()`:
```typescript
await logAuditEvent({ userId, action: 'sign_in', metadata: { method: 'email' } });
// Actions: sign_in, sign_up, sign_out, password_changed
```

### Input Sanitization ([src/utils/validation.ts](src/utils/validation.ts))
**Always sanitize user input** before storage:
```typescript
sanitizeInput(input)  // Removes: <>, javascript:, on*= event handlers
validateEmail(email)  // Returns: { valid, error? }
validatePassword(pw)  // Returns: { valid, error?, strength: 'weak'|'medium'|'strong' }
```

### Soft Deletes
Equipment uses soft delete (`is_active: false`) rather than hard delete to preserve booking history.

## Performance Optimization Patterns

### Database Query Optimization
1. **Indexed foreign keys** - All FK columns have indexes (see migration `20260120165134`)
2. **Pagination built-in** - `getEquipment()` returns `{data, count}` for efficient pagination
3. **Selective joins** - Use postfix syntax: `'*, owner:profiles(*), category:categories(*)'`
4. **View tracking** via RPC: `supabase.rpc('increment_view_count', { equipment_id })`

### Frontend Performance
1. **Parallel data loading** - AuthContext uses `Promise.all()`:
   ```typescript
   const [profile, analytics, unreadCount] = await Promise.all([
     getProfile(userId), getUserAnalytics(userId), getUnreadNotificationCount(userId)
   ]);
   ```
2. **Memoized calculations** - BookingCalendar uses `useMemo` for `daysInMonth`, `rentalDays`
3. **Body overflow management** - Modals toggle `document.body.style.overflow` to prevent scroll
4. **Optimistic updates** - Favorites toggle immediately, sync in background

### Vite Optimization
```typescript
// vite.config.ts - Exclude lucide-react from pre-bundling for faster dev starts
optimizeDeps: { exclude: ['lucide-react'] }
```

## AI Assistant Integration

### Current Architecture ([src/components/ai/AIAssistant.tsx](src/components/ai/AIAssistant.tsx))
The AI Assistant ("Kayd") currently uses **simulated responses** for demo purposes:
```typescript
const simulateResponse = async (userMessage: string) => {
  setIsTyping(true);
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate latency
  // Keyword-based response matching
  if (lowerMessage.includes('excavator')) response = responses.excavator;
  // ...
};
```

### Integrating a Real LLM
To connect to an actual LLM API, modify `simulateResponse()`:
```typescript
const generateResponse = async (userMessage: string) => {
  setIsTyping(true);
  const response = await fetch('/api/chat', {
    method: 'POST',
    body: JSON.stringify({
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      context: { /* equipment data, user preferences */ }
    })
  });
  const data = await response.json();
  // Add response to messages...
};
```

### Message Structure
```typescript
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[]; // Quick-reply buttons shown after assistant messages
}
```

### UI Features Available
- **Collapsible widget** - `isOpen` / `isExpanded` states
- **Typing indicator** - `isTyping` state shows loading animation
- **Suggestions** - Pre-built quick replies after each response
- **Feedback buttons** - ThumbsUp/ThumbsDown icons (implement tracking as needed)
- **Voice input placeholder** - Mic icon ready for speech-to-text integration

## Project-Specific Patterns

### Error Handling
- Database errors bubble up; callers use try-catch
- Auth errors from Supabase auth methods should be caught and shown in UI
- Async operations use Promise.all() for parallel queries (see `loadUserData` in AuthContext)

### Styling & Responsive Design
- Tailwind CSS with mobile-first approach
- Header: hamburger menu on mobile (`md:` breakpoints)
- SearchModal: controlled via `isOpen` prop; manages body overflow
- Calendar: responsive grid layout for date picker

### Real-Time Features
- Notifications subscribed via `subscribeToNotifications(userId)` (see AuthContext setup)
- Message conversations streamed in real-time
- User analytics auto-tracked on login/navigation

## Integration Points & External Dependencies

### Supabase Integration ([src/lib/supabase.ts](src/lib/supabase.ts))
- Single client instance initialized with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- All queries go through service layer; direct queries should be avoided
- Auth state changes trigger profile/analytics reload

### Leaflet Maps
- [EquipmentMap](src/components/equipment/EquipmentMap.tsx) uses react-leaflet
- Displays equipment pins with lat/long; click handlers show details
- Required: Define map bounds, tile layer, and zoom defaults

### Lucide React Icons
- Used throughout for consistent UI (Search, Menu, Heart, Bell, etc.)
- Check icon names at https://lucide.dev before adding new ones

## Common Workflows & Examples

### Adding a New Equipment Filter
1. Extend `SearchFilters` type in [SearchModal](src/components/search/SearchModal.tsx)
2. Add filter state and input in JSX
3. Update `getEquipment()` call in database service with new filter param
4. Chain appropriate `.eq()`, `.gte()`, `.lte()` to query

### Creating a New Page
1. Create component in appropriate subdirectory (e.g., [components/browse/](src/components/browse/))
2. Import in [App.tsx](src/App.tsx)
3. Add route case to App's navigation logic
4. Wire up Header navigation callback

### Updating User Profile After Changes
1. Call database service update function (e.g., `updateProfile()`)
2. Call `refreshProfile()` from AuthContext to sync state globally
3. Components using `useAuth()` re-render automatically

## Useful File References
- Sample data in [App.tsx](src/App.tsx#L22) shows Equipment type usage
- Database schema definitions in [supabase/migrations/](supabase/migrations/)
- Type definitions centralized in [src/types/index.ts](src/types/index.ts) (~330 lines)
- Tailwind config: [tailwind.config.js](tailwind.config.js)
- ESLint config: [eslint.config.js](eslint.config.js)
