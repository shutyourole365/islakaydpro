import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsVisible(window.scrollY > 480);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
      className="fixed bottom-6 right-24 z-40 w-11 h-11 rounded-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/70 dark:border-gray-700/60 shadow-soft-lg flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-teal-500 hover:text-white hover:border-teal-500 hover:-translate-y-0.5 transition-all duration-200 animate-fade-in"
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
}
