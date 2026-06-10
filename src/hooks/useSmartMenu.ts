import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';

export interface MenuItem {
  id: string;
  category: 'recent' | 'suggested' | 'utility';
  priority: number;
}

interface SmartMenuConfig {
  recentActionIds: string[];
  maxRecentActions: number;
  maxSuggestedActions: number;
}

export function useSmartMenu(config: Partial<SmartMenuConfig> = {}) {
  const { profile, isAuthenticated } = useAuth();

  const defaultConfig: SmartMenuConfig = {
    recentActionIds: [],
    maxRecentActions: 3,
    maxSuggestedActions: 4,
    ...config,
  };

  const suggestedActions = useMemo(() => {
    if (!isAuthenticated) {
      return [
        { id: 'browse', category: 'utility' as const, priority: 100 },
        { id: 'search', category: 'utility' as const, priority: 90 },
        { id: 'how-it-works', category: 'utility' as const, priority: 80 },
      ];
    }

    const suggestions: MenuItem[] = [];

    // ID verification suggestion
    if (!profile?.is_verified) {
      suggestions.push({
        id: 'verify-id',
        category: 'suggested' as const,
        priority: 190,
      });
    }

    // Profile completion suggestion
    if (!profile?.full_name || !profile?.phone) {
      suggestions.push({
        id: 'complete-profile',
        category: 'suggested' as const,
        priority: 180,
      });
    }

    // AI Assistant for first-time users
    if (isAuthenticated) {
      suggestions.push({
        id: 'ai-assistant',
        category: 'suggested' as const,
        priority: 120,
      });
    }

    return suggestions;
  }, [isAuthenticated, profile]);

  const recentActions = useMemo(() => {
    return defaultConfig.recentActionIds.slice(0, defaultConfig.maxRecentActions).map((id, index) => ({
      id,
      category: 'recent' as const,
      priority: 100 - index,
    }));
  }, [defaultConfig.recentActionIds, defaultConfig.maxRecentActions]);

  // Combine and sort all menu items
  const allMenuItems = useMemo(() => {
    const combined = [...recentActions, ...suggestedActions];
    // Remove duplicates and sort by priority
    const unique = Array.from(
      new Map(combined.map((item) => [item.id, item])).values()
    );
    return unique.sort((a, b) => b.priority - a.priority);
  }, [recentActions, suggestedActions]);

  const userState = {
    isAuthenticated,
    isVerified: profile?.is_verified || false,
    hasProfileData: !!profile?.full_name && !!profile?.phone,
  };

  return {
    allMenuItems,
    recentActions,
    suggestedActions,
    userState,
    isEmpty: allMenuItems.length === 0,
  };
}
