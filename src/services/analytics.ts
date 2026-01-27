/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, react-hooks/exhaustive-deps, prefer-const */
// Google Analytics 4 Integration
export interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  [key: string]: unknown;
}

class Analytics {
  private initialized = false;
  private measurementId: string | null = null;

  initialize(measurementId?: string) {
    this.measurementId = measurementId || import.meta.env.VITE_GA_MEASUREMENT_ID;
    
    if (!this.measurementId || this.initialized) {
      return;
    }

    // Load Google Analytics script
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.measurementId}`;
    script.async = true;
    document.head.appendChild(script);

    // Initialize gtag
    (window as any).dataLayer = (window as any).dataLayer || [];
    function gtag(...args: any[]) {
      (window as any).dataLayer.push(args);
    }
    (window as any).gtag = gtag;

    gtag('js', new Date());
    gtag('config', this.measurementId, {
      send_page_view: false, // We'll send page views manually
    });

    this.initialized = true;
    if (import.meta.env.DEV) {
      console.log('Analytics initialized with ID:', this.measurementId);
    }
  }

  // Track page views
  pageView(path: string, title?: string) {
    if (!this.initialized || !this.measurementId) {
      if (import.meta.env.DEV) {
        console.warn('Analytics pageView called but not initialized');
      }
      return;
    }

    (window as any).gtag?.('config', this.measurementId, {
      page_path: path,
      page_title: title || document.title,
    });
  }

  // Track custom events
  event(eventName: string, params?: Record<string, unknown>) {
    if (!this.initialized) return;

    (window as any).gtag?.('event', eventName, params);
  }

  // Track equipment views
  trackEquipmentView(equipmentId: string, equipmentTitle: string, category: string) {
    this.event('view_item', {
      item_id: equipmentId,
      item_name: equipmentTitle,
      item_category: category,
    });
  }

  // Track searches
  trackSearch(searchTerm: string, filters?: Record<string, unknown>) {
    this.event('search', {
      search_term: searchTerm,
      ...filters,
    });
  }

  // Track bookings
  trackBooking(equipmentId: string, value: number, currency: string = 'USD') {
    this.event('begin_checkout', {
      item_id: equipmentId,
      value,
      currency,
    });
  }

  // Track completed bookings
  trackBookingComplete(bookingId: string, value: number, currency: string = 'USD') {
    this.event('purchase', {
      transaction_id: bookingId,
      value,
      currency,
    });
  }

  // Track user sign ups
  trackSignUp(method: string = 'email') {
    this.event('sign_up', {
      method,
    });
  }

  // Track user login
  trackLogin(method: string = 'email') {
    this.event('login', {
      method,
    });
  }

  // Track favorites
  trackFavorite(equipmentId: string, action: 'add' | 'remove') {
    this.event(action === 'add' ? 'add_to_wishlist' : 'remove_from_wishlist', {
      item_id: equipmentId,
    });
  }

  // Track shares
  trackShare(method: string, contentType: string, itemId: string) {
    this.event('share', {
      method,
      content_type: contentType,
      item_id: itemId,
    });
  }

  // Track errors
  trackError(error: string, fatal: boolean = false) {
    this.event('exception', {
      description: error,
      fatal,
    });
  }

  // Set user properties
  setUserId(userId: string) {
    if (!this.initialized) return;

    (window as any).gtag?.('config', this.measurementId, {
      user_id: userId,
    });
  }

  // Set user properties
  setUserProperties(properties: Record<string, unknown>) {
    if (!this.initialized) return;

    (window as any).gtag?.('set', 'user_properties', properties);
  }
}

// Singleton instance
export const analytics = new Analytics();

// Initialize analytics if measurement ID is available
if (typeof window !== 'undefined' && import.meta.env.VITE_GA_MEASUREMENT_ID) {
  analytics.initialize();
}

export default analytics;
