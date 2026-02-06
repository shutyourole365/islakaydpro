// Utility hooks
export {
  useDebounce,
  useLocalStorage,
  useSessionStorage,
  useToggle,
  useClickOutside,
  usePrevious,
  useMediaQuery,
  useIsMobile,
  useIsTablet,
  useIsDesktop,
  useAsync,
  useCountdown,
  useIntersectionObserver,
  useCopyToClipboard,
  useDocumentTitle,
  useOnlineStatus,
  useKeyboardShortcut,
  useScrollPosition,
  useWindowSize,
  useLockBodyScroll,
  useForceUpdate,
  useIsMounted,
  useHover,
  useFocus,
} from './useUtilities';

// Keyboard shortcuts hooks
export {
  useKeyboardShortcuts,
  useKeyboardShortcut as useShortcut,
  useEscapeKey,
  useEnterKey,
  useShortcutsHelp,
  useKeyboardShortcutsModal,
  useShortcutEvent,
  useTypeaheadSearch,
  defaultAppShortcuts,
} from './useKeyboardShortcuts';

// Command Palette hook
export { useCommandPalette } from './useCommandPalette';

// Form hooks
export {
  useForm,
  validators,
  priceValidators,
  equipmentValidators,
  registrationValidators,
} from './useForm';

// Supabase hooks
export { useSupabaseStatus } from './useSupabaseStatus';

// Theme hook
export { useTheme } from './useTheme';

// Advanced hooks for equipment rental features
export {
  useEquipmentAvailability,
  useDynamicPricing,
  useFavorites,
  useBookingCart,
  useBookingStatus,
  useTrustScore,
  useEquipmentSearch,
  useNotifications,
  useInfiniteScroll,
  useOptimisticUpdate,
  useAnalytics,
  useRentalDates,
} from './useAdvanced';

