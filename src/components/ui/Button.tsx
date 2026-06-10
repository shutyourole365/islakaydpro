import { type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  onClick,
  type = 'button',
  className = '',
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-semibold rounded-2xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group hover:-translate-y-0.5';

  const variants = {
    primary: 'bg-gradient-to-r from-teal-500 via-cyan-500 to-emerald-500 text-white hover:shadow-2xl hover:shadow-teal-500/35 focus:ring-teal-500/50 shadow-xl shadow-teal-500/25 border border-teal-400/40 hover:scale-[1.02] active:scale-[0.98]',
    secondary: 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:border-teal-300 dark:hover:border-teal-600 focus:ring-teal-500/50 shadow-lg hover:shadow-xl hover:bg-gradient-to-r hover:from-teal-50/80 hover:to-cyan-50/80 dark:hover:bg-teal-900/20 hover:scale-[1.02]',
    outline: 'border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-teal-400 hover:bg-gradient-to-r hover:from-teal-50/60 hover:to-cyan-50/60 dark:hover:bg-teal-900/30 focus:ring-teal-500/50 focus:border-teal-500 hover:scale-[1.02]',
    ghost: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 focus:ring-gray-300/50 relative overflow-hidden hover:scale-[1.01]',
    danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-2xl hover:shadow-red-500/35 focus:ring-red-500/50 shadow-xl shadow-red-500/25 border border-red-400/40 hover:scale-[1.02] active:scale-[0.98]',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
     >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : leftIcon ? (
        leftIcon
      ) : null}
      {children}
      {!loading && rightIcon}
    </button>
  );
}

interface IconButtonProps {
  icon: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  label: string;
  className?: string;
}

export function IconButton({
  icon,
  variant = 'ghost',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  label,
  className = '',
}: IconButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden hover:scale-110 active:scale-95';

  const variants = {
    primary: 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:shadow-xl hover:shadow-teal-500/35 focus:ring-teal-500/50 shadow-lg hover:-translate-y-0.5',
    secondary: 'bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-800 text-gray-700 dark:text-gray-300 hover:from-gray-200 hover:to-gray-100 dark:hover:from-gray-600 dark:hover:to-gray-700 focus:ring-gray-300/50 shadow-md hover:shadow-lg hover:-translate-y-0.5',
    outline: 'border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-teal-400 hover:bg-gradient-to-r hover:from-teal-50/60 hover:to-cyan-50/60 dark:hover:bg-teal-900/30 focus:ring-teal-500/50 hover:-translate-y-0.5',
    ghost: 'text-gray-500 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-100/50 dark:hover:bg-teal-900/30 focus:ring-gray-300/50 relative overflow-hidden hover:-translate-y-0.5',
  };

  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={label}
      title={label}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : icon}
    </button>
  );
}
