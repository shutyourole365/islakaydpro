// Number formatting utilities
export function formatNumber(num: number, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat('en-US', options).format(num);
}

export function formatCompactNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let unitIndex = 0;
  let size = bytes;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

// Price formatting
export function formatPrice(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPriceRange(min: number, max: number, currency = 'USD'): string {
  if (min === max) {
    return formatPrice(min, currency);
  }
  return `${formatPrice(min, currency)} - ${formatPrice(max, currency)}`;
}

// Date formatting
export function formatDateRange(start: Date | string, end: Date | string): string {
  const startDate = new Date(start);
  const endDate = new Date(end);

  const startMonth = startDate.toLocaleDateString('en-US', { month: 'short' });
  const endMonth = endDate.toLocaleDateString('en-US', { month: 'short' });
  const startYear = startDate.getFullYear();
  const endYear = endDate.getFullYear();

  if (startYear === endYear && startMonth === endMonth) {
    return `${startMonth} ${startDate.getDate()}-${endDate.getDate()}, ${startYear}`;
  }

  if (startYear === endYear) {
    return `${startMonth} ${startDate.getDate()} - ${endMonth} ${endDate.getDate()}, ${startYear}`;
  }

  return `${startMonth} ${startDate.getDate()}, ${startYear} - ${endMonth} ${endDate.getDate()}, ${endYear}`;
}

export function formatDuration(days: number): string {
  if (days === 1) return '1 day';
  if (days < 7) return `${days} days`;
  if (days === 7) return '1 week';
  if (days < 30) {
    const weeks = Math.floor(days / 7);
    const remainingDays = days % 7;
    if (remainingDays === 0) return `${weeks} week${weeks > 1 ? 's' : ''}`;
    return `${weeks} week${weeks > 1 ? 's' : ''} ${remainingDays} day${remainingDays > 1 ? 's' : ''}`;
  }
  if (days < 365) {
    const months = Math.floor(days / 30);
    return `${months} month${months > 1 ? 's' : ''}`;
  }
  const years = Math.floor(days / 365);
  return `${years} year${years > 1 ? 's' : ''}`;
}

export function formatTimeAgo(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 30) return 'just now';
  if (diffSec < 60) return `${diffSec} seconds ago`;
  if (diffMin === 1) return '1 minute ago';
  if (diffMin < 60) return `${diffMin} minutes ago`;
  if (diffHour === 1) return '1 hour ago';
  if (diffHour < 24) return `${diffHour} hours ago`;
  if (diffDay === 1) return 'yesterday';
  if (diffDay < 7) return `${diffDay} days ago`;
  if (diffDay < 30) return `${Math.floor(diffDay / 7)} weeks ago`;
  if (diffDay < 365) return `${Math.floor(diffDay / 30)} months ago`;
  return `${Math.floor(diffDay / 365)} years ago`;
}

export function formatTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

// String formatting
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function titleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function truncate(str: string, maxLength: number, ellipsis = '...'): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - ellipsis.length) + ellipsis;
}

export function pluralize(count: number, singular: string, plural?: string): string {
  if (count === 1) return `${count} ${singular}`;
  return `${count} ${plural || singular + 's'}`;
}

export function initials(name: string, maxLength = 2): string {
  return name
    .split(' ')
    .map(part => part.charAt(0).toUpperCase())
    .slice(0, maxLength)
    .join('');
}

// Location formatting
export function formatLocation(city?: string, state?: string, country?: string): string {
  const parts = [city, state, country].filter(Boolean);
  return parts.join(', ');
}

export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  const km = meters / 1000;
  if (km < 10) {
    return `${km.toFixed(1)} km`;
  }
  return `${Math.round(km)} km`;
}

export function formatDistanceMiles(meters: number): string {
  const miles = meters * 0.000621371;
  if (miles < 0.1) {
    const feet = Math.round(meters * 3.28084);
    return `${feet} ft`;
  }
  if (miles < 10) {
    return `${miles.toFixed(1)} mi`;
  }
  return `${Math.round(miles)} mi`;
}

// Rating formatting
export function formatRating(rating: number, maxRating = 5): string {
  return `${rating.toFixed(1)}/${maxRating}`;
}

export function formatRatingStars(rating: number, maxRating = 5): string {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = maxRating - fullStars - (hasHalfStar ? 1 : 0);
  
  return '★'.repeat(fullStars) + (hasHalfStar ? '½' : '') + '☆'.repeat(emptyStars);
}

// Equipment-specific formatting
export function formatEquipmentCondition(condition: string): string {
  const conditions: Record<string, string> = {
    new: 'Brand New',
    excellent: 'Excellent',
    good: 'Good',
    fair: 'Fair',
    poor: 'Poor',
  };
  return conditions[condition.toLowerCase()] || capitalize(condition);
}

export function formatRentalRate(dailyRate: number, weeklyRate?: number, monthlyRate?: number): string {
  let rates = `${formatPrice(dailyRate)}/day`;
  if (weeklyRate) {
    rates += ` • ${formatPrice(weeklyRate)}/week`;
  }
  if (monthlyRate) {
    rates += ` • ${formatPrice(monthlyRate)}/month`;
  }
  return rates;
}

export function formatAvailability(isAvailable: boolean, nextAvailableDate?: Date): string {
  if (isAvailable) {
    return 'Available now';
  }
  if (nextAvailableDate) {
    return `Available ${formatDateRange(nextAvailableDate, nextAvailableDate)}`;
  }
  return 'Not available';
}

// Booking status formatting
export function formatBookingStatus(status: string): { label: string; color: string } {
  const statuses: Record<string, { label: string; color: string }> = {
    pending: { label: 'Pending Approval', color: 'amber' },
    confirmed: { label: 'Confirmed', color: 'green' },
    active: { label: 'In Progress', color: 'blue' },
    completed: { label: 'Completed', color: 'gray' },
    cancelled: { label: 'Cancelled', color: 'red' },
    declined: { label: 'Declined', color: 'red' },
  };
  return statuses[status.toLowerCase()] || { label: capitalize(status), color: 'gray' };
}

export function formatPaymentStatus(status: string): { label: string; color: string } {
  const statuses: Record<string, { label: string; color: string }> = {
    pending: { label: 'Payment Pending', color: 'amber' },
    paid: { label: 'Paid', color: 'green' },
    refunded: { label: 'Refunded', color: 'blue' },
    failed: { label: 'Payment Failed', color: 'red' },
  };
  return statuses[status.toLowerCase()] || { label: capitalize(status), color: 'gray' };
}

// URL formatting
export function formatUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace('www.', '');
  } catch {
    return url;
  }
}

export function buildQueryString(params: Record<string, string | number | boolean | undefined | null>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  
  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

// JSON formatting
export function formatJSON(obj: unknown, indent = 2): string {
  try {
    return JSON.stringify(obj, null, indent);
  } catch {
    return String(obj);
  }
}
