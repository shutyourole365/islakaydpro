/**
 * Environment Variable Validation
 * Validates required environment variables on application startup
 * Provides clear error messages for missing or invalid configuration
 */

interface EnvConfig {
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
  VITE_STRIPE_PUBLIC_KEY?: string;
  VITE_GA_MEASUREMENT_ID?: string;
  VITE_ENABLE_ANALYTICS?: string;
  VITE_SENTRY_DSN?: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates environment variables
 * @returns ValidationResult with any errors or warnings
 */
export function validateEnvironment(): ValidationResult {
  const env = import.meta.env as unknown as EnvConfig;
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required variables for basic functionality
  const required = {
    VITE_SUPABASE_URL: env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: env.VITE_SUPABASE_ANON_KEY,
  };

  // Check required variables
  Object.entries(required).forEach(([key, value]) => {
    if (!value) {
      errors.push(`Missing required environment variable: ${key}`);
    } else if (value.includes('your-') || value.includes('paste-')) {
      errors.push(`Environment variable ${key} has placeholder value - please update with actual credentials`);
    }
  });

  // Validate URL formats
  if (env.VITE_SUPABASE_URL && !isValidUrl(env.VITE_SUPABASE_URL)) {
    errors.push('VITE_SUPABASE_URL is not a valid URL');
  }

  // Check optional but recommended variables
  if (!env.VITE_STRIPE_PUBLIC_KEY) {
    warnings.push('VITE_STRIPE_PUBLIC_KEY not set - payment functionality will be disabled');
  }

  if (!env.VITE_GA_MEASUREMENT_ID && env.VITE_ENABLE_ANALYTICS === 'true') {
    warnings.push('VITE_GA_MEASUREMENT_ID not set but analytics enabled - analytics will not work');
  }

  if (!env.VITE_SENTRY_DSN && import.meta.env.PROD) {
    warnings.push('VITE_SENTRY_DSN not set - error tracking will be limited in production');
  }

  // Validate key formats
  if (env.VITE_SUPABASE_ANON_KEY && env.VITE_SUPABASE_ANON_KEY.length < 100) {
    errors.push('VITE_SUPABASE_ANON_KEY appears invalid - should be a long JWT token');
  }

  // Stripe is optional - only warn, don't block
  if (env.VITE_STRIPE_PUBLIC_KEY && 
      !env.VITE_STRIPE_PUBLIC_KEY.startsWith('pk_') && 
      !env.VITE_STRIPE_PUBLIC_KEY.includes('your_')) {
    warnings.push('VITE_STRIPE_PUBLIC_KEY appears invalid - should start with pk_');
  }

  if (env.VITE_GA_MEASUREMENT_ID && !env.VITE_GA_MEASUREMENT_ID.match(/^G-[A-Z0-9]+$/)) {
    warnings.push('VITE_GA_MEASUREMENT_ID format may be incorrect - should be G-XXXXXXXXXX');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates a URL string
 */
function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Logs validation results to console
 */
export function logValidationResults(result: ValidationResult): void {
  if (!result.isValid) {
    console.error('❌ Environment Validation Failed:');
    result.errors.forEach(error => console.error(`  • ${error}`));
    console.error('\n📝 Please check your .env.local file and ensure all required variables are set.');
    console.error('📖 See SETUP_GUIDE.md for detailed configuration instructions.\n');
  }

  if (result.warnings.length > 0) {
    console.warn('⚠️  Environment Warnings:');
    result.warnings.forEach(warning => console.warn(`  • ${warning}`));
    console.warn('');
  }

  if (result.isValid && result.warnings.length === 0) {
    console.log('✅ Environment validation passed');
  }
}

/**
 * Gets the current environment name
 */
export function getEnvironmentName(): 'development' | 'production' | 'test' {
  if (import.meta.env.MODE === 'test') return 'test';
  if (import.meta.env.PROD) return 'production';
  return 'development';
}

/**
 * Checks if a feature is enabled
 */
export function isFeatureEnabled(feature: 'analytics' | 'payments' | 'sentry'): boolean {
  const env = import.meta.env as unknown as EnvConfig;
  
  switch (feature) {
    case 'analytics':
      return env.VITE_ENABLE_ANALYTICS === 'true' && !!env.VITE_GA_MEASUREMENT_ID;
    case 'payments':
      return !!env.VITE_STRIPE_PUBLIC_KEY;
    case 'sentry':
      return !!env.VITE_SENTRY_DSN;
    default:
      return false;
  }
}

/**
 * Gets environment info for debugging
 */
export function getEnvironmentInfo(): Record<string, unknown> {
  return {
    mode: import.meta.env.MODE,
    environment: getEnvironmentName(),
    features: {
      analytics: isFeatureEnabled('analytics'),
      payments: isFeatureEnabled('payments'),
      errorTracking: isFeatureEnabled('sentry'),
    },
    timestamp: new Date().toISOString(),
  };
}
