import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { Equipment, Booking, Profile } from '../types';

// ============================================
// Equipment-specific hooks
// ============================================

/**
 * Hook to track equipment availability in real-time
 */
export function useEquipmentAvailability(equipmentId: string | undefined) {
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [unavailableDates, setUnavailableDates] = useState<Date[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error] = useState<string | null>(null);

  const checkAvailability = useCallback(async (startDate: Date, endDate: Date) => {
    if (!equipmentId) return false;
    
    // Check if any unavailable dates fall within the range
    const start = startDate.getTime();
    const end = endDate.getTime();
    
    return !unavailableDates.some(d => {
      const time = d.getTime();
      return time >= start && time <= end;
    });
  }, [equipmentId, unavailableDates]);

  useEffect(() => {
    if (!equipmentId) return;
    
    setIsLoading(true);
    // Simulate API call - replace with actual database call
    const timer = setTimeout(() => {
      setIsAvailable(true);
      setUnavailableDates([]);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [equipmentId]);

  return { isAvailable, unavailableDates, isLoading, error, checkAvailability };
}

/**
 * Hook to calculate dynamic rental pricing
 */
export function useDynamicPricing(equipment: Equipment | null) {
  const calculatePrice = useCallback((days: number) => {
    if (!equipment) return { subtotal: 0, discount: 0, total: 0, dailyRate: 0 };

    const rate = equipment.daily_rate;
    let discount = 0;

    // Weekly rate if renting 7+ days
    if (days >= 7 && equipment.weekly_rate) {
      const weeks = Math.floor(days / 7);
      const remainingDays = days % 7;
      const weeklyTotal = weeks * equipment.weekly_rate;
      const dailyTotal = remainingDays * equipment.daily_rate;
      const subtotal = weeklyTotal + dailyTotal;
      const regularPrice = days * equipment.daily_rate;
      discount = regularPrice - subtotal;
      
      return {
        subtotal: regularPrice,
        discount,
        total: subtotal,
        dailyRate: subtotal / days,
      };
    }

    // Monthly rate if renting 30+ days
    if (days >= 30 && equipment.monthly_rate) {
      const months = Math.floor(days / 30);
      const remainingDays = days % 30;
      const monthlyTotal = months * equipment.monthly_rate;
      const dailyTotal = remainingDays * equipment.daily_rate;
      const subtotal = monthlyTotal + dailyTotal;
      const regularPrice = days * equipment.daily_rate;
      discount = regularPrice - subtotal;
      
      return {
        subtotal: regularPrice,
        discount,
        total: subtotal,
        dailyRate: subtotal / days,
      };
    }

    return {
      subtotal: days * rate,
      discount: 0,
      total: days * rate,
      dailyRate: rate,
    };
  }, [equipment]);

  return { calculatePrice };
}

/**
 * Hook to manage equipment favorites
 */
export function useFavorites(userId: string | undefined) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const toggleFavorite = useCallback(async (equipmentId: string) => {
    if (!userId) return;

    setFavorites(prev => {
      if (prev.includes(equipmentId)) {
        return prev.filter(id => id !== equipmentId);
      }
      return [...prev, equipmentId];
    });
  }, [userId]);

  const isFavorite = useCallback((equipmentId: string) => {
    return favorites.includes(equipmentId);
  }, [favorites]);

  useEffect(() => {
    if (!userId) return;
    setIsLoading(true);
    // Simulate loading favorites
    setTimeout(() => {
      setFavorites([]);
      setIsLoading(false);
    }, 300);
  }, [userId]);

  return { favorites, toggleFavorite, isFavorite, isLoading };
}

// ============================================
// Booking-specific hooks
// ============================================

/**
 * Hook to manage booking cart
 */
export function useBookingCart() {
  const [items, setItems] = useState<Array<{
    equipment: Equipment;
    startDate: Date;
    endDate: Date;
    quantity: number;
  }>>([]);

  const addItem = useCallback((equipment: Equipment, startDate: Date, endDate: Date, quantity = 1) => {
    setItems(prev => {
      const existingIndex = prev.findIndex(item => item.equipment.id === equipment.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], startDate, endDate, quantity };
        return updated;
      }
      return [...prev, { equipment, startDate, endDate, quantity }];
    });
  }, []);

  const removeItem = useCallback((equipmentId: string) => {
    setItems(prev => prev.filter(item => item.equipment.id !== equipmentId));
  }, []);

  const updateQuantity = useCallback((equipmentId: string, quantity: number) => {
    setItems(prev => prev.map(item => 
      item.equipment.id === equipmentId ? { ...item, quantity } : item
    ));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totals = useMemo(() => {
    let subtotal = 0;
    items.forEach(item => {
      const days = Math.ceil((item.endDate.getTime() - item.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      subtotal += item.equipment.daily_rate * days * item.quantity;
    });
    const serviceFee = subtotal * 0.1; // 10% service fee
    const total = subtotal + serviceFee;
    return { subtotal, serviceFee, total, itemCount: items.length };
  }, [items]);

  return { items, addItem, removeItem, updateQuantity, clearCart, totals };
}

/**
 * Hook to track booking status
 */
export function useBookingStatus(bookingId: string | undefined) {
  const [booking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!bookingId) return;
    setIsLoading(true);
    // Replace with actual API call
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, [bookingId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { booking, isLoading, error, refresh };
}

// ============================================
// Trust & Reputation hooks
// ============================================

/**
 * Hook to calculate trust score
 */
export function useTrustScore(profile: Profile | null) {
  const score = useMemo(() => {
    if (!profile) return { total: 0, breakdown: {}, level: 'new' };

    const breakdown = {
      verification: profile.is_verified ? 20 : 0,
      rating: Math.min(25, (profile.rating || 0) * 5),
      rentals: Math.min(25, (profile.total_rentals || 0) * 0.3),
      reviews: Math.min(15, (profile.total_reviews || 0) * 0.5),
      security: profile.two_factor_enabled ? 15 : 5,
    };

    const total = Object.values(breakdown).reduce((sum, val) => sum + val, 0);

    let level = 'new';
    if (total >= 90) level = 'excellent';
    else if (total >= 75) level = 'good';
    else if (total >= 50) level = 'fair';
    else if (total >= 25) level = 'building';

    return { total, breakdown, level };
  }, [profile]);

  return score;
}

// ============================================
// Search & Filter hooks
// ============================================

/**
 * Hook for advanced equipment search
 */
export function useEquipmentSearch() {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    priceMin: 0,
    priceMax: 10000,
    condition: [] as string[],
    location: '',
    radius: 50,
    availability: 'all' as 'all' | 'available' | 'unavailable',
  });
  const [sortBy, setSortBy] = useState<'relevance' | 'price_low' | 'price_high' | 'rating' | 'newest'>('relevance');
  const [results, setResults] = useState<Equipment[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [totalResults, setTotalResults] = useState(0);

  const search = useCallback(async () => {
    setIsSearching(true);
    // Replace with actual API call
    setTimeout(() => {
      setResults([]);
      setTotalResults(0);
      setIsSearching(false);
    }, 500);
  }, []);

  const updateFilter = useCallback(<K extends keyof typeof filters>(key: K, value: typeof filters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      category: '',
      priceMin: 0,
      priceMax: 10000,
      condition: [],
      location: '',
      radius: 50,
      availability: 'all',
    });
  }, []);

  return {
    query,
    setQuery,
    filters,
    updateFilter,
    resetFilters,
    sortBy,
    setSortBy,
    results,
    totalResults,
    isSearching,
    search,
  };
}

// ============================================
// Notification hooks
// ============================================

/**
 * Hook for managing notifications
 */
export function useNotifications(userId: string | undefined) {
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: Date;
  }>>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === notificationId ? { ...n, isRead: true } : n
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  }, []);

  const dismiss = useCallback((notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  }, []);

  useEffect(() => {
    if (!userId) return;
    setIsLoading(true);
    // Replace with actual subscription
    setTimeout(() => {
      setNotifications([]);
      setUnreadCount(0);
      setIsLoading(false);
    }, 500);
  }, [userId]);

  return { notifications, unreadCount, markAsRead, markAllAsRead, dismiss, isLoading };
}

// ============================================
// Performance hooks
// ============================================

/**
 * Hook for infinite scroll / pagination
 */
export function useInfiniteScroll<T>(
  fetchFn: (page: number) => Promise<{ data: T[]; hasMore: boolean }>,
  options = { threshold: 100 }
) {
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loaderRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await fetchFn(page);
      setItems(prev => [...prev, ...result.data]);
      setHasMore(result.hasMore);
      setPage(prev => prev + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more');
    } finally {
      setIsLoading(false);
    }
  }, [fetchFn, page, isLoading, hasMore]);

  const reset = useCallback(() => {
    setItems([]);
    setPage(1);
    setHasMore(true);
    setError(null);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      { rootMargin: `${options.threshold}px` }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [loadMore, hasMore, isLoading, options.threshold]);

  return { items, isLoading, hasMore, error, loaderRef, loadMore, reset };
}

/**
 * Hook for optimistic updates
 */
export function useOptimisticUpdate<T>() {
  const [optimisticValue, setOptimisticValue] = useState<T | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const update = useCallback(async (
    newValue: T,
    updateFn: () => Promise<T>,
    onError?: (error: Error) => void
  ) => {
    const previousValue = optimisticValue;
    setOptimisticValue(newValue);
    setIsUpdating(true);

    try {
      const result = await updateFn();
      setOptimisticValue(result);
    } catch (error) {
      setOptimisticValue(previousValue);
      onError?.(error instanceof Error ? error : new Error('Update failed'));
    } finally {
      setIsUpdating(false);
    }
  }, [optimisticValue]);

  return { value: optimisticValue, isUpdating, update, setValue: setOptimisticValue };
}

// ============================================
// Analytics hooks
// ============================================

/**
 * Hook for tracking user interactions
 */
export function useAnalytics() {
  const track = useCallback((event: string, properties?: Record<string, unknown>) => {
    // Replace with actual analytics implementation
    console.log('[Analytics]', event, properties);
    
    // Example: send to GA4
    if (typeof window !== 'undefined' && (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag) {
      (window as unknown as { gtag: (...args: unknown[]) => void }).gtag('event', event, properties);
    }
  }, []);

  const trackPageView = useCallback((pageName: string, properties?: Record<string, unknown>) => {
    track('page_view', { page_name: pageName, ...properties });
  }, [track]);

  const trackEquipmentView = useCallback((equipmentId: string, equipmentName: string) => {
    track('view_item', { item_id: equipmentId, item_name: equipmentName });
  }, [track]);

  const trackAddToCart = useCallback((equipment: Equipment) => {
    track('add_to_cart', {
      item_id: equipment.id,
      item_name: equipment.title,
      price: equipment.daily_rate,
    });
  }, [track]);

  const trackBookingStarted = useCallback((equipmentId: string, totalAmount: number) => {
    track('begin_checkout', { item_id: equipmentId, value: totalAmount });
  }, [track]);

  const trackBookingCompleted = useCallback((bookingId: string, totalAmount: number) => {
    track('purchase', { transaction_id: bookingId, value: totalAmount });
  }, [track]);

  return {
    track,
    trackPageView,
    trackEquipmentView,
    trackAddToCart,
    trackBookingStarted,
    trackBookingCompleted,
  };
}

// ============================================
// Date & Time hooks
// ============================================

/**
 * Hook for rental date management
 */
export function useRentalDates(
  minDays = 1,
  maxDays = 90,
  unavailableDates: Date[] = []
) {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const rentalDays = useMemo(() => {
    if (!startDate || !endDate) return 0;
    return Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  }, [startDate, endDate]);

  const isDateUnavailable = useCallback((date: Date) => {
    return unavailableDates.some(
      d => d.toDateString() === date.toDateString()
    );
  }, [unavailableDates]);

  const validateDates = useCallback(() => {
    setError(null);

    if (!startDate) {
      setError('Please select a start date');
      return false;
    }

    if (!endDate) {
      setError('Please select an end date');
      return false;
    }

    if (startDate < new Date()) {
      setError('Start date cannot be in the past');
      return false;
    }

    if (endDate < startDate) {
      setError('End date must be after start date');
      return false;
    }

    const days = rentalDays;
    if (days < minDays) {
      setError(`Minimum rental is ${minDays} day${minDays > 1 ? 's' : ''}`);
      return false;
    }

    if (days > maxDays) {
      setError(`Maximum rental is ${maxDays} days`);
      return false;
    }

    // Check for unavailable dates in range
    const current = new Date(startDate);
    while (current <= endDate) {
      if (isDateUnavailable(current)) {
        setError('Selected dates include unavailable days');
        return false;
      }
      current.setDate(current.getDate() + 1);
    }

    return true;
  }, [startDate, endDate, minDays, maxDays, rentalDays, isDateUnavailable]);

  const reset = useCallback(() => {
    setStartDate(null);
    setEndDate(null);
    setError(null);
  }, []);

  return {
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    rentalDays,
    error,
    validateDates,
    isDateUnavailable,
    reset,
  };
}
