// AI service
export { sendMessage as sendAIMessage, streamMessage, getRecommendations, getEquipmentHelp, getSearchSuggestions } from './ai';

// Analytics service
export { analytics } from './analytics';

// Auth helpers
export { getAuthErrorMessage, signInWithRetry, signUpWithRetry, isEmailConfirmationRequired, resendConfirmationEmail } from './authHelpers';

// Database service
export {
  getProfile, updateProfile,
  getCategories, getEquipment, getEquipmentById, createEquipment, updateEquipment, deleteEquipment,
  getBookings, getBookingById, createBooking, updateBookingStatus,
  getEquipmentAvailability, checkAvailability, blockDates, unblockDates,
  getReviews, createReview,
  getFavorites, addFavorite, removeFavorite, isFavorite,
  getNotifications, markNotificationRead, markAllNotificationsRead, getUnreadNotificationCount,
  getConversations, getMessages, sendMessage, createConversation,
  getUserAnalytics, getEquipmentAnalytics,
  getSavedSearches, saveSearch, deleteSavedSearch,
  submitVerificationRequest, getVerificationRequests, logAuditEvent,
  subscribeToNotifications, subscribeToMessages,
  getUserTrustScore, getUserAlerts, markAlertAsRead, dismissAlert, createAlert,
  getEquipmentBundles, createEquipmentBundle, updateEquipmentBundle, deleteEquipmentBundle,
  getEquipmentWarranties, createWarranty, updateWarranty,
  createBulkBooking, getUserBulkBookings,
  getMarketplaceInsights, trackPriceChange,
} from './database';

// Email service
export { sendEmail, sendWelcomeEmail, sendBookingConfirmation, sendNewMessageNotification, sendPriceAlertNotification } from './email';

// Error monitoring
export { errorMonitoring } from './errorMonitoring';

// Payment service
export { createCheckoutSession, redirectToCheckout, createConnectAccount, redirectToConnectOnboarding, getBalance } from './payments';

// Push notifications
export { isPushSupported, getNotificationPermission, requestNotificationPermission, subscribeToPush } from './pushNotifications';

// Storage service
export { isStorageAvailable, uploadFile, deleteFile, getPublicUrl, uploadMultipleFiles } from './storage';
