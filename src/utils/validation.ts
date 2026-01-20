export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
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

    if (!['http:', 'https:'].includes(parsed.protocol)) {
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
