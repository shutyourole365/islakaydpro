import { useEffect, useRef, useState } from 'react';

/**
 * Animates a formatted numeric string by counting up from zero on mount/change.
 * Preserves any prefix/suffix in the value (e.g. "$1,234", "85%", "12") and the
 * original formatting (thousands separators, decimal places). Falls back to the
 * static value when the string isn't numeric or the user prefers reduced motion.
 */
export default function AnimatedNumber({
  value,
  duration = 900,
}: {
  value: string;
  duration?: number;
}) {
  const [display, setDisplay] = useState(value);
  const rafRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const match = value.match(/^(\D*)(-?[\d,]*\.?\d+)(.*)$/);
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!match || prefersReduced) {
      setDisplay(value);
      return;
    }

    const [, prefix, numStr, suffix] = match;
    const target = parseFloat(numStr.replace(/,/g, ''));
    const decimals = (numStr.split('.')[1] || '').length;
    const grouped = numStr.includes(',');
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      const current = target * eased;
      const formatted = grouped
        ? current.toLocaleString(undefined, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          })
        : current.toFixed(decimals);
      setDisplay(`${prefix}${formatted}${suffix}`);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, duration]);

  return <>{display}</>;
}
