import { type ReactNode, type InputHTMLAttributes, forwardRef } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  success?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      success,
      hint,
      leftIcon,
      rightIcon,
      size = 'md',
      fullWidth = true,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    const sizes = {
      sm: 'py-2 text-sm',
      md: 'py-3 text-base',
      lg: 'py-4 text-lg',
    };

    const getInputStyles = () => {
      let styles = `w-full rounded-xl border-2 bg-white/80 dark:bg-gray-800/80 dark:text-white dark:placeholder-gray-500 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-0 ${sizes[size]} shadow-md focus:shadow-lg backdrop-blur-sm`;

      if (leftIcon) styles += ' pl-11';
      else styles += ' pl-4';

      if (rightIcon || error || success) styles += ' pr-11';
      else styles += ' pr-4';

      if (error) {
        styles += ' border-red-400/60 focus:border-red-500 focus:ring-red-500/40 focus:shadow-red-500/20 focus:shadow-lg';
      } else if (success) {
        styles += ' border-emerald-400/60 focus:border-emerald-500 focus:ring-emerald-500/40 focus:shadow-emerald-500/20 focus:shadow-lg';
      } else {
        styles += ' border-gray-300/60 dark:border-gray-700/60 focus:border-teal-500 focus:ring-teal-500/40 focus:shadow-teal-500/20 focus:shadow-lg';
      }

      return styles;
    };

    return (
      <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input ref={ref} id={inputId} className={getInputStyles()} {...props} />
          {(rightIcon || error || success) && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {error ? (
                <AlertCircle className="w-5 h-5 text-red-500" />
              ) : success ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              ) : (
                <span className="text-gray-400">{rightIcon}</span>
              )}
            </div>
          )}
        </div>
        {(error || success || hint) && (
          <p
            className={`mt-1.5 text-sm ${
              error ? 'text-red-600' : success ? 'text-green-600' : 'text-gray-500'
            }`}
          >
            {error || success || hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  success?: string;
  hint?: string;
  fullWidth?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, success, hint, fullWidth = true, className = '', id, ...props }, ref) => {
    const inputId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

    const getTextareaStyles = () => {
      let styles = 'w-full px-4 py-3 rounded-xl border-2 bg-white/80 dark:bg-gray-800/80 dark:text-white dark:placeholder-gray-500 transition-all duration-300 focus:outline-none focus:ring-2 resize-none shadow-md focus:shadow-lg backdrop-blur-sm';

      if (error) {
        styles += ' border-red-400/60 focus:border-red-500 focus:ring-red-500/40 focus:shadow-red-500/20 focus:shadow-lg';
      } else if (success) {
        styles += ' border-emerald-400/60 focus:border-emerald-500 focus:ring-emerald-500/40 focus:shadow-emerald-500/20 focus:shadow-lg';
      } else {
        styles += ' border-gray-300/60 dark:border-gray-700/60 focus:border-teal-500 focus:ring-teal-500/40 focus:shadow-teal-500/20 focus:shadow-lg';
      }

      return styles;
    };

    return (
      <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {label}
          </label>
        )}
        <textarea ref={ref} id={inputId} className={getTextareaStyles()} {...props} />
        {(error || success || hint) && (
          <p
            className={`mt-1.5 text-sm ${
              error ? 'text-red-600' : success ? 'text-green-600' : 'text-gray-500'
            }`}
          >
            {error || success || hint}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: { value: string; label: string }[];
  fullWidth?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, options, fullWidth = true, className = '', id, ...props }, ref) => {
    const inputId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

    const getSelectStyles = () => {
      let styles = 'w-full px-4 py-3 rounded-xl border-2 bg-white/80 dark:bg-gray-800/80 dark:text-white transition-all duration-300 focus:outline-none focus:ring-2 appearance-none shadow-md focus:shadow-lg backdrop-blur-sm';

      if (error) {
        styles += ' border-red-400/60 focus:border-red-500 focus:ring-red-500/40 focus:shadow-red-500/20 focus:shadow-lg';
      } else {
        styles += ' border-gray-300/60 dark:border-gray-700/60 focus:border-teal-500 focus:ring-teal-500/40 focus:shadow-teal-500/20 focus:shadow-lg';
      }

      return styles;
    };

    return (
      <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          <select ref={ref} id={inputId} className={getSelectStyles()} {...props}>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {(error || hint) && (
          <p className={`mt-1.5 text-sm ${error ? 'text-red-600' : 'text-gray-500'}`}>
            {error || hint}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
