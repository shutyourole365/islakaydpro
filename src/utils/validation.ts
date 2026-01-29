export function sanitizeInput(input: string): string {
  // Remove script tags, event handlers, javascript: and encode < >
  let sanitized = input;
  let previous: string;

  // Repeatedly apply multi-character pattern removals until no more changes occur
  do {
    previous = sanitized;
    sanitized = sanitized
      .replace(/<script.*?>.*?<\/script>/gi, '')
      .replace(/on\w+\s*=\s*(['"]).*?\1/gi, '')
      .replace(/javascript:/gi, '');
  } while (sanitized !== previous);

  // Finally, remove all angle brackets and trim whitespace
  return sanitized
    .replace(/[<>]/g, '')
    .trim();
}

export function validateEmail(email: string): { valid: boolean; error?: string } {
  const sanitized = sanitizeInput(email);

  if (!sanitized) {
    return { valid: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(sanitized)) {
    return { valid: false, error: 'Please enter a valid email address' };
  }

  if (sanitized.length > 254) {
    return { valid: false, error: 'Email is too long' };
  }

  return { valid: true };
}

export function validatePassword(password: string): { valid: boolean; error?: string; strength: 'weak' | 'medium' | 'strong' } {
  if (!password) {
    return { valid: false, error: 'Password is required', strength: 'weak' };
  }

  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters', strength: 'weak' };
  }

  if (password.length > 128) {
    return { valid: false, error: 'Password is too long', strength: 'weak' };
  }

  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  let score = 0;

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

  if (score >= 4) {
    strength = 'strong';
  } else if (score >= 2) {
    strength = 'medium';
  }

  return { valid: true, strength };
}

export function validatePhoneNumber(phone: string): { valid: boolean; error?: string } {
  const sanitized = sanitizeInput(phone).replace(/[\s\-().]/g, '');

  if (!sanitized) {
    return { valid: true };
  }

  const phoneRegex = /^\+?[1-9]\d{6,14}$/;
  if (!phoneRegex.test(sanitized)) {
    return { valid: false, error: 'Please enter a valid phone number' };
  }

  return { valid: true };
}

export function validatePrice(price: string | number): { valid: boolean; error?: string; value: number } {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;

  if (isNaN(numPrice)) {
    return { valid: false, error: 'Please enter a valid price', value: 0 };
  }

  if (numPrice < 0) {
    return { valid: false, error: 'Price cannot be negative', value: 0 };
  }

  if (numPrice > 1000000) {
    return { valid: false, error: 'Price exceeds maximum allowed', value: 0 };
  }

  return { valid: true, value: Math.round(numPrice * 100) / 100 };
}

export function validateTextInput(
  input: string,
  options: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    fieldName?: string;
  } = {}
): { valid: boolean; error?: string; value: string } {
  const { required = false, minLength = 0, maxLength = 1000, fieldName = 'Field' } = options;
  const sanitized = sanitizeInput(input);

  if (required && !sanitized) {
    return { valid: false, error: `${fieldName} is required`, value: '' };
  }

  if (!sanitized) {
    return { valid: true, value: '' };
  }

  if (sanitized.length < minLength) {
    return { valid: false, error: `${fieldName} must be at least ${minLength} characters`, value: sanitized };
  }

  if (sanitized.length > maxLength) {
    return { valid: false, error: `${fieldName} must be less than ${maxLength} characters`, value: sanitized };
  }

  return { valid: true, value: sanitized };
}

export function validateDateRange(
  startDate: Date | string,
  endDate: Date | string,
  options: {
    minDays?: number;
    maxDays?: number;
    allowPastDates?: boolean;
  } = {}
): { valid: boolean; error?: string; days: number } {
  const { minDays = 1, maxDays = 365, allowPastDates = false } = options;

  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (isNaN(start.getTime())) {
    return { valid: false, error: 'Invalid start date', days: 0 };
  }

  if (isNaN(end.getTime())) {
    return { valid: false, error: 'Invalid end date', days: 0 };
  }

  if (!allowPastDates && start < today) {
    return { valid: false, error: 'Start date cannot be in the past', days: 0 };
  }

  if (end < start) {
    return { valid: false, error: 'End date must be after start date', days: 0 };
  }

  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  if (days < minDays) {
    return { valid: false, error: `Minimum rental period is ${minDays} day${minDays > 1 ? 's' : ''}`, days };
  }

  if (days > maxDays) {
    return { valid: false, error: `Maximum rental period is ${maxDays} days`, days };
  }

  return { valid: true, days };
}

export function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

export function validateImageUrl(url: string): { valid: boolean; error?: string } {
  if (!url) {
    return { valid: true };
  }
  try {
    const parsed = new URL(url);
    // Only allow http/https, block all others (ftp, file, data, javascript, etc)
    if (!/^https?:$/.test(parsed.protocol)) {
      return { valid: false, error: 'Invalid image URL protocol' };
    }
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const hasImageExtension = imageExtensions.some((ext) =>
      parsed.pathname.toLowerCase().endsWith(ext)
    );
    const isKnownImageHost = [
      'images.pexels.com',
      'images.unsplash.com',
      'cdn.pixabay.com',
    ].some((host) => parsed.hostname.includes(host));
    if (!hasImageExtension && !isKnownImageHost) {
      return { valid: false, error: 'URL does not appear to be an image' };
    }
    return { valid: true };
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }
}

// Credit card validation (Luhn algorithm)
export function validateCreditCard(cardNumber: string): { valid: boolean; error?: string; type?: string } {
  const sanitized = cardNumber.replace(/\s|-/g, '');

  if (!sanitized) {
    return { valid: false, error: 'Card number is required' };
  }

  if (!/^\d{13,19}$/.test(sanitized)) {
    return { valid: false, error: 'Invalid card number format' };
  }

  // Luhn algorithm
  let sum = 0;
  let isEven = false;
  for (let i = sanitized.length - 1; i >= 0; i--) {
    let digit = parseInt(sanitized[i], 10);
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    isEven = !isEven;
  }

  if (sum % 10 !== 0) {
    return { valid: false, error: 'Invalid card number' };
  }

  // Detect card type
  let type: string | undefined;
  if (/^4/.test(sanitized)) type = 'visa';
  else if (/^5[1-5]/.test(sanitized) || /^2[2-7]/.test(sanitized)) type = 'mastercard';
  else if (/^3[47]/.test(sanitized)) type = 'amex';
  else if (/^6(?:011|5)/.test(sanitized)) type = 'discover';

  return { valid: true, type };
}

// CVV validation
export function validateCVV(cvv: string, cardType?: string): { valid: boolean; error?: string } {
  const sanitized = cvv.replace(/\s/g, '');

  if (!sanitized) {
    return { valid: false, error: 'CVV is required' };
  }

  const expectedLength = cardType === 'amex' ? 4 : 3;
  const regex = cardType === 'amex' ? /^\d{4}$/ : /^\d{3}$/;

  if (!regex.test(sanitized)) {
    return { valid: false, error: `CVV must be ${expectedLength} digits` };
  }

  return { valid: true };
}

// Expiry date validation
export function validateExpiryDate(expiry: string): { valid: boolean; error?: string; month?: number; year?: number } {
  const sanitized = expiry.replace(/\s/g, '');
  const match = sanitized.match(/^(\d{2})\/(\d{2}|\d{4})$/);

  if (!match) {
    return { valid: false, error: 'Invalid format (MM/YY)' };
  }

  const month = parseInt(match[1], 10);
  let year = parseInt(match[2], 10);

  if (year < 100) {
    year += 2000;
  }

  if (month < 1 || month > 12) {
    return { valid: false, error: 'Invalid month' };
  }

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return { valid: false, error: 'Card has expired' };
  }

  if (year > currentYear + 20) {
    return { valid: false, error: 'Invalid expiry year' };
  }

  return { valid: true, month, year };
}

// Location/address validation
export function validateAddress(address: string): { valid: boolean; error?: string } {
  const sanitized = sanitizeInput(address);

  if (!sanitized) {
    return { valid: false, error: 'Address is required' };
  }

  if (sanitized.length < 5) {
    return { valid: false, error: 'Address is too short' };
  }

  if (sanitized.length > 200) {
    return { valid: false, error: 'Address is too long' };
  }

  return { valid: true };
}

// Postal code validation (supports US ZIP and Canadian postal codes)
export function validatePostalCode(code: string, country: 'US' | 'CA' | 'any' = 'any'): { valid: boolean; error?: string } {
  const sanitized = code.replace(/\s/g, '').toUpperCase();

  if (!sanitized) {
    return { valid: false, error: 'Postal code is required' };
  }

  const patterns = {
    US: /^\d{5}(-\d{4})?$/,
    CA: /^[A-Z]\d[A-Z]\d[A-Z]\d$/,
  };

  if (country === 'US' && !patterns.US.test(sanitized)) {
    return { valid: false, error: 'Invalid US ZIP code' };
  }

  if (country === 'CA' && !patterns.CA.test(sanitized)) {
    return { valid: false, error: 'Invalid Canadian postal code' };
  }

  if (country === 'any') {
    if (!patterns.US.test(sanitized) && !patterns.CA.test(sanitized.replace(/\s/g, ''))) {
      return { valid: false, error: 'Invalid postal code' };
    }
  }

  return { valid: true };
}

// Format helpers
export function formatCurrency(amount: number, currency = 'USD', locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  
  return phone;
}

export function formatDate(date: Date | string, format: 'short' | 'medium' | 'long' = 'medium'): string {
  const d = new Date(date);
  
  const optionsMap: Record<'short' | 'medium' | 'long', Intl.DateTimeFormatOptions> = {
    short: { month: 'numeric', day: 'numeric' },
    medium: { month: 'short', day: 'numeric', year: 'numeric' },
    long: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
  };

  return d.toLocaleDateString('en-US', optionsMap[format]);
}

export function formatRelativeTime(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  if (diffWeek < 4) return `${diffWeek}w ago`;
  if (diffMonth < 12) return `${diffMonth}mo ago`;
  return `${diffYear}y ago`;
}

// Slug generation for URLs
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// File validation
export function validateFile(
  file: File,
  options: {
    maxSizeMB?: number;
    allowedTypes?: string[];
    allowedExtensions?: string[];
  } = {}
): { valid: boolean; error?: string } {
  const { maxSizeMB = 10, allowedTypes, allowedExtensions } = options;

  if (file.size > maxSizeMB * 1024 * 1024) {
    return { valid: false, error: `File size must be less than ${maxSizeMB}MB` };
  }

  if (allowedTypes && !allowedTypes.includes(file.type)) {
    return { valid: false, error: `File type not allowed. Allowed: ${allowedTypes.join(', ')}` };
  }

  if (allowedExtensions) {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !allowedExtensions.includes(ext)) {
      return { valid: false, error: `File extension not allowed. Allowed: ${allowedExtensions.join(', ')}` };
    }
  }

  return { valid: true };
}

// Image file validation
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  return validateFile(file, {
    maxSizeMB: 5,
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    allowedExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  });
}

// Username validation
export function validateUsername(username: string): { valid: boolean; error?: string } {
  const sanitized = sanitizeInput(username);

  if (!sanitized) {
    return { valid: false, error: 'Username is required' };
  }

  if (sanitized.length < 3) {
    return { valid: false, error: 'Username must be at least 3 characters' };
  }

  if (sanitized.length > 30) {
    return { valid: false, error: 'Username must be less than 30 characters' };
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(sanitized)) {
    return { valid: false, error: 'Username can only contain letters, numbers, underscores, and hyphens' };
  }

  if (/^[_-]|[_-]$/.test(sanitized)) {
    return { valid: false, error: 'Username cannot start or end with underscore or hyphen' };
  }

  return { valid: true };
}

// Coordinates validation
export function validateCoordinates(lat: number, lng: number): { valid: boolean; error?: string } {
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return { valid: false, error: 'Invalid coordinates' };
  }

  if (lat < -90 || lat > 90) {
    return { valid: false, error: 'Latitude must be between -90 and 90' };
  }

  if (lng < -180 || lng > 180) {
    return { valid: false, error: 'Longitude must be between -180 and 180' };
  }

  return { valid: true };
}
