import { useState, useEffect, useCallback, useRef } from 'react';
import { getEquipment } from '../services/database';
import type { Equipment, Category } from '../types';

const PAGE_SIZE = 24;

export interface SearchFilters {
  query: string;
  category: string; // slug
  location: string;
  minPrice: number;
  maxPrice: number;
  condition: string;
  sortBy: 'featured' | 'price-low' | 'price-high' | 'rating' | 'newest';
}

export const DEFAULT_FILTERS: SearchFilters = {
  query: '',
  category: '',
  location: '',
  minPrice: 0,
  maxPrice: 2000,
  condition: '',
  sortBy: 'featured',
};

interface UseEquipmentSearchReturn {
  results: Equipment[];
  totalCount: number;
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  filters: SearchFilters;
  setFilters: (filters: Partial<SearchFilters>) => void;
  resetFilters: () => void;
  loadMore: () => void;
  activeFilterCount: number;
  refresh: () => void;
}

export function useEquipmentSearch(
  categories: Category[],
  initialFilters?: Partial<SearchFilters>
): UseEquipmentSearchReturn {
  const [filters, setFiltersState] = useState<SearchFilters>({
    ...DEFAULT_FILTERS,
    ...initialFilters,
  });
  const [results, setResults] = useState<Equipment[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  // Debounce text search
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedQuery, setDebouncedQuery] = useState(filters.query);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQuery(filters.query), 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [filters.query]);

  // Resolve category ID from slug
  const getCategoryId = useCallback((slug: string) => {
    if (!slug) return undefined;
    return categories.find(c => c.slug === slug || c.name === slug)?.id;
  }, [categories]);

  const fetchPage = useCallback(async (offset: number, append = false) => {
    if (append) setLoadingMore(true);
    else setLoading(true);

    try {
      const { data, count } = await getEquipment({
        search: debouncedQuery || undefined,
        categoryId: getCategoryId(filters.category),
        location: filters.location && filters.location !== 'Near Me' ? filters.location : undefined,
        minPrice: filters.minPrice > 0 ? filters.minPrice : undefined,
        maxPrice: filters.maxPrice < 2000 ? filters.maxPrice : undefined,
        condition: filters.condition || undefined,
        limit: PAGE_SIZE,
        offset,
      });

      // Client-side sort (API returns newest-first by default)
      const sorted = [...data];
      switch (filters.sortBy) {
        case 'price-low':
          sorted.sort((a, b) => a.daily_rate - b.daily_rate);
          break;
        case 'price-high':
          sorted.sort((a, b) => b.daily_rate - a.daily_rate);
          break;
        case 'rating':
          sorted.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
          break;
        case 'newest':
          sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          break;
        default:
          sorted.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
      }

      if (append) {
        setResults(prev => [...prev, ...sorted]);
      } else {
        setResults(sorted);
      }
      setTotalCount(count);
      setHasMore(offset + sorted.length < count);
    } catch (err) {
      console.error('Equipment search error:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [debouncedQuery, filters, getCategoryId]);

  // Refetch when filters change
  useEffect(() => {
    setPage(0);
    fetchPage(0, false);
  }, [debouncedQuery, filters.category, filters.location, filters.minPrice, filters.maxPrice, filters.condition, filters.sortBy]);

  const setFilters = useCallback((partial: Partial<SearchFilters>) => {
    setFiltersState(prev => ({ ...prev, ...partial }));
  }, []);

  const resetFilters = useCallback(() => {
    setFiltersState(DEFAULT_FILTERS);
  }, []);

  const loadMore = useCallback(() => {
    const nextOffset = (page + 1) * PAGE_SIZE;
    setPage(p => p + 1);
    fetchPage(nextOffset, true);
  }, [page, fetchPage]);

  const refresh = useCallback(() => {
    setPage(0);
    fetchPage(0, false);
  }, [fetchPage]);

  const activeFilterCount = [
    filters.query,
    filters.category,
    filters.location,
    filters.condition,
    filters.minPrice > 0,
    filters.maxPrice < 2000,
  ].filter(Boolean).length;

  return {
    results,
    totalCount,
    loading,
    loadingMore,
    hasMore,
    filters,
    setFilters,
    resetFilters,
    loadMore,
    activeFilterCount,
    refresh,
  };
}

