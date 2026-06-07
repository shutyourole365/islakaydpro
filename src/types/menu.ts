import React from 'react';

export type MenuAction = 'list-equipment' | 'verify-id' | 'complete-profile' | 'view-bookings' |
  'active-rentals' | 'earnings' | 'messages' | 'view-favorites' | 'ai-assistant' |
  'browse' | 'search' | 'how-it-works' | 'home' | 'notifications' | 'settings' | 'dashboard';

export interface MenuItemConfig {
  id: MenuAction;
  label: string;
  description?: string;
  icon: React.ReactNode;
  color: string;
  action: () => void;
  badge?: number;
  isNew?: boolean;
  requiresAuth?: boolean;
  visibility?: 'always' | 'authenticated' | 'owner' | 'renter';
}

export const MENU_COLORS: Record<MenuAction, string> = {
  'list-equipment': 'from-blue-500 to-indigo-500',
  'verify-id': 'from-red-500 to-pink-500',
  'complete-profile': 'from-orange-500 to-yellow-500',
  'view-bookings': 'from-purple-500 to-indigo-500',
  'active-rentals': 'from-emerald-500 to-teal-500',
  'earnings': 'from-green-500 to-emerald-500',
  'messages': 'from-cyan-500 to-blue-500',
  'view-favorites': 'from-pink-500 to-rose-500',
  'ai-assistant': 'from-violet-500 to-purple-500',
  'browse': 'from-teal-500 to-emerald-500',
  'search': 'from-blue-500 to-cyan-500',
  'how-it-works': 'from-indigo-500 to-blue-500',
  'home': 'from-blue-500 to-indigo-500',
  'notifications': 'from-amber-500 to-orange-500',
  'settings': 'from-gray-500 to-gray-600',
  'dashboard': 'from-teal-500 to-emerald-500',
};
