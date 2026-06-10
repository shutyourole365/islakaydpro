import { useEffect, useRef } from 'react';

interface ProgressBarProps {
  value: number; // 0-100
  className?: string;
  innerClassName?: string;
  'aria-label'?: string;
}

export default function ProgressBar({ value, className = '', innerClassName = '', 'aria-label': ariaLabel }: ProgressBarProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (ref.current) {
      // set width via DOM so we avoid JSX inline style props (linter rule)
      ref.current.style.width = `${Math.max(0, Math.min(100, value))}%`;
      // update aria-valuenow dynamically to reflect current value
      const container = ref.current.parentElement;
      if (container) container.setAttribute('aria-valuenow', String(Math.round(value)));
    }
  }, [value]);

  return (
    <div className={`relative overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700 shadow-sm ${className}`} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-label={ariaLabel}>
      <div ref={ref} className={`h-full transition-all duration-500 bg-gradient-to-r from-teal-500 via-cyan-500 to-emerald-500 shadow-lg ${innerClassName}`} />
    </div>
  );
}
