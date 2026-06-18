import type { ReactNode } from 'react';
import { useScrollReveal } from '../../hooks/useScrollReveal';

interface RevealProps {
  children: ReactNode;
  className?: string;
}

/**
 * Wraps content so it fades and rises into view when scrolled into the
 * viewport. Pairs the `.reveal` / `.reveal-visible` utilities with the
 * `useScrollReveal` hook. Respects reduced-motion preferences.
 */
export default function Reveal({ children, className = '' }: RevealProps) {
  const [ref, visible] = useScrollReveal<HTMLDivElement>();
  return (
    <div ref={ref} className={`reveal ${visible ? 'reveal-visible' : ''} ${className}`}>
      {children}
    </div>
  );
}
