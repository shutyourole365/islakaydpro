import { useState, useCallback, useMemo } from 'react';

type ValidationRule<T> = {
  validate: (value: T[keyof T], values: T) => boolean;
  message: string;
};

type FieldValidation<T> = {
  [K in keyof T]?: ValidationRule<T>[];
};

type FieldErrors<T> = {
  [K in keyof T]?: string;
};

type FieldTouched<T> = {
  [K in keyof T]?: boolean;
};

interface UseFormOptions<T> {
  initialValues: T;
  validationRules?: FieldValidation<T>;
  onSubmit: (values: T) => void | Promise<void>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

interface UseFormReturn<T> {
  values: T;
  errors: FieldErrors<T>;
  touched: FieldTouched<T>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
  handleChange: (field: keyof T) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleBlur: (field: keyof T) => () => void;
  setFieldValue: (field: keyof T, value: T[keyof T]) => void;
  setFieldError: (field: keyof T, error: string) => void;
  setFieldTouched: (field: keyof T, touched?: boolean) => void;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  reset: (newValues?: T) => void;
  validateField: (field: keyof T) => boolean;
  validateForm: () => boolean;
  getFieldProps: (field: keyof T) => {
    value: T[keyof T];
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onBlur: () => void;
    error?: string;
    touched?: boolean;
  };
}

export function useForm<T extends Record<string, unknown>>({
  initialValues,
  validationRules = {},
  onSubmit,
  validateOnChange = true,
  validateOnBlur = true,
}: UseFormOptions<T>): UseFormReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FieldErrors<T>>({});
  const [touched, setTouched] = useState<FieldTouched<T>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = useCallback((field: keyof T): boolean => {
    const rules = validationRules[field];
    if (!rules) return true;

    for (const rule of rules) {
      if (!rule.validate(values[field], values)) {
        setErrors(prev => ({ ...prev, [field]: rule.message }));
        return false;
      }
    }

    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
    return true;
  }, [values, validationRules]);

  const validateForm = useCallback((): boolean => {
    let isValid = true;
    const newErrors: FieldErrors<T> = {};

    for (const field in validationRules) {
      const rules = validationRules[field as keyof T];
      if (!rules) continue;

      for (const rule of rules) {
        if (!rule.validate(values[field as keyof T], values)) {
          newErrors[field as keyof T] = rule.message;
          isValid = false;
          break;
        }
      }
    }

    setErrors(newErrors);
    return isValid;
  }, [values, validationRules]);

  const handleChange = useCallback((field: keyof T) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const value = e.target.type === 'checkbox' 
      ? (e.target as HTMLInputElement).checked 
      : e.target.value;
    
    setValues(prev => ({ ...prev, [field]: value }));
    
    if (validateOnChange && touched[field]) {
      setTimeout(() => validateField(field), 0);
    }
  }, [validateOnChange, touched, validateField]);

  const handleBlur = useCallback((field: keyof T) => () => {
    setTouched(prev => ({ ...prev, [field]: true }));
    if (validateOnBlur) {
      validateField(field);
    }
  }, [validateOnBlur, validateField]);

  const setFieldValue = useCallback((field: keyof T, value: T[keyof T]) => {
    setValues(prev => ({ ...prev, [field]: value }));
  }, []);

  const setFieldError = useCallback((field: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  const setFieldTouched = useCallback((field: keyof T, isTouched = true) => {
    setTouched(prev => ({ ...prev, [field]: isTouched }));
  }, []);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    // Mark all fields as touched
    const allTouched = Object.keys(initialValues).reduce((acc, key) => {
      acc[key as keyof T] = true;
      return acc;
    }, {} as FieldTouched<T>);
    setTouched(allTouched);

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validateForm, onSubmit, initialValues]);

  const reset = useCallback((newValues?: T) => {
    setValues(newValues || initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  const getFieldProps = useCallback((field: keyof T) => ({
    value: values[field],
    onChange: handleChange(field),
    onBlur: handleBlur(field),
    error: touched[field] ? errors[field] : undefined,
    touched: touched[field],
  }), [values, errors, touched, handleChange, handleBlur]);

  const isValid = useMemo(() => Object.keys(errors).length === 0, [errors]);
  
  const isDirty = useMemo(() => {
    return Object.keys(initialValues).some(key => 
      values[key as keyof T] !== initialValues[key as keyof T]
    );
  }, [values, initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    isDirty,
    handleChange,
    handleBlur,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    handleSubmit,
    reset,
    validateField,
    validateForm,
    getFieldProps,
  };
}

// Validation helper functions
export const validators = {
  required: (message = 'This field is required') => ({
    validate: (value: unknown) => {
      if (typeof value === 'string') return value.trim().length > 0;
      if (typeof value === 'number') return true;
      if (Array.isArray(value)) return value.length > 0;
      return value != null;
    },
    message,
  }),

  minLength: (min: number, message?: string) => ({
    validate: (value: unknown) => typeof value === 'string' && value.length >= min,
    message: message || `Must be at least ${min} characters`,
  }),

  maxLength: (max: number, message?: string) => ({
    validate: (value: unknown) => typeof value === 'string' && value.length <= max,
    message: message || `Must be no more than ${max} characters`,
  }),

  email: (message = 'Invalid email address') => ({
    validate: (value: unknown) => {
      if (typeof value !== 'string') return false;
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    },
    message,
  }),

  phone: (message = 'Invalid phone number') => ({
    validate: (value: unknown) => {
      if (typeof value !== 'string') return false;
      return /^\+?[\d\s-()]{10,}$/.test(value.replace(/\s/g, ''));
    },
    message,
  }),

  url: (message = 'Invalid URL') => ({
    validate: (value: unknown) => {
      if (typeof value !== 'string') return false;
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
    message,
  }),

  min: (min: number, message?: string) => ({
    validate: (value: unknown) => typeof value === 'number' && value >= min,
    message: message || `Must be at least ${min}`,
  }),

  max: (max: number, message?: string) => ({
    validate: (value: unknown) => typeof value === 'number' && value <= max,
    message: message || `Must be no more than ${max}`,
  }),

  pattern: (regex: RegExp, message = 'Invalid format') => ({
    validate: (value: unknown) => typeof value === 'string' && regex.test(value),
    message,
  }),

  match: <T>(field: keyof T, message = 'Fields do not match') => ({
    validate: (value: unknown, values: T) => value === values[field],
    message,
  }),

  custom: <T>(fn: (value: T[keyof T], values: T) => boolean, message: string) => ({
    validate: fn,
    message,
  }),
};

// Price validation for equipment listings
export const priceValidators = {
  dailyRate: [
    validators.required('Daily rate is required'),
    validators.min(1, 'Daily rate must be at least $1'),
    validators.max(10000, 'Daily rate cannot exceed $10,000'),
  ],
  weeklyRate: [
    validators.min(1, 'Weekly rate must be at least $1'),
    validators.max(50000, 'Weekly rate cannot exceed $50,000'),
  ],
  monthlyRate: [
    validators.min(1, 'Monthly rate must be at least $1'),
    validators.max(100000, 'Monthly rate cannot exceed $100,000'),
  ],
  deposit: [
    validators.min(0, 'Deposit cannot be negative'),
    validators.max(50000, 'Deposit cannot exceed $50,000'),
  ],
};

// Equipment listing validation rules
export const equipmentValidators = {
  title: [
    validators.required('Title is required'),
    validators.minLength(5, 'Title must be at least 5 characters'),
    validators.maxLength(100, 'Title must be less than 100 characters'),
  ],
  description: [
    validators.required('Description is required'),
    validators.minLength(20, 'Description must be at least 20 characters'),
    validators.maxLength(2000, 'Description must be less than 2000 characters'),
  ],
  location: [
    validators.required('Location is required'),
    validators.minLength(3, 'Please enter a valid location'),
  ],
};

// User registration validation rules
export const registrationValidators = {
  email: [
    validators.required('Email is required'),
    validators.email('Please enter a valid email'),
  ],
  password: [
    validators.required('Password is required'),
    validators.minLength(8, 'Password must be at least 8 characters'),
    validators.pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain uppercase, lowercase, and a number'
    ),
  ],
  confirmPassword: [
    validators.required('Please confirm your password'),
    validators.match('password' as never, 'Passwords do not match'),
  ],
  fullName: [
    validators.required('Full name is required'),
    validators.minLength(2, 'Name must be at least 2 characters'),
    validators.maxLength(100, 'Name must be less than 100 characters'),
  ],
};
