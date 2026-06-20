import { memo } from 'react';
import {
  HardHat,
  Drill,
  Trees,
  Camera,
  Speaker,
  Truck,
  Heart,
  Factory,
  Dumbbell,
  PartyPopper,
  Laptop,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import type { Category } from '../../types';

const iconMap: Record<string, React.ReactNode> = {
  HardHat: <HardHat className="w-7 h-7" />,
  Drill: <Drill className="w-7 h-7" />,
  Trees: <Trees className="w-7 h-7" />,
  Camera: <Camera className="w-7 h-7" />,
  Speaker: <Speaker className="w-7 h-7" />,
  Truck: <Truck className="w-7 h-7" />,
  Heart: <Heart className="w-7 h-7" />,
  Factory: <Factory className="w-7 h-7" />,
  Dumbbell: <Dumbbell className="w-7 h-7" />,
  PartyPopper: <PartyPopper className="w-7 h-7" />,
  Laptop: <Laptop className="w-7 h-7" />,
  Sparkles: <Sparkles className="w-7 h-7" />,
};

interface CategoryItemProps {
  category: Category;
  onClick: (category: Category) => void;
  index: number;
}

const CategoryItem = memo(function CategoryItem({ category, onClick, index }: CategoryItemProps) {
  return (
    <button
      onClick={() => onClick(category)}
      className="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-soft hover:shadow-brand-lg transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-teal-300/70 dark:hover:border-teal-700/60 hover:-translate-y-1.5 overflow-hidden animate-fade-in-up"
      style={{ animationDelay: `${Math.min(index * 50, 500)}ms`, animationFillMode: 'both' }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-teal-500/0 to-emerald-500/0 group-hover:from-teal-500/10 group-hover:to-emerald-500/10 transition-all duration-300" />

      <div className="relative">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-900/40 dark:to-emerald-900/40 flex items-center justify-center text-teal-600 dark:text-teal-400 group-hover:from-teal-500 group-hover:to-emerald-500 group-hover:text-white group-hover:shadow-brand group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300 mb-4">
          {iconMap[category.icon || 'Sparkles']}
        </div>

        <h3 className="font-bold text-gray-900 dark:text-white mb-1 text-left group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors">
          {category.name}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-left">
          {category.equipment_count.toLocaleString()} items
        </p>
      </div>

      <div className="absolute bottom-4 right-4 w-8 h-8 rounded-full bg-teal-50 dark:bg-teal-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-x-3 group-hover:translate-x-0 transition-all duration-300">
        <ArrowRight className="w-4 h-4 text-teal-600 dark:text-teal-400" />
      </div>
    </button>
  );
});

interface CategoriesProps {
  categories: Category[];
  onCategoryClick: (category: Category) => void;
  onViewAll?: () => void;
}

export default function Categories({ categories, onCategoryClick, onViewAll }: CategoriesProps) {
  return (
    <section id="categories" className="relative py-24 bg-gray-50 dark:bg-gray-950 overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-teal-500/5 dark:bg-teal-500/[0.04] rounded-full blur-[140px]" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500/10 to-emerald-500/10 text-teal-700 dark:text-teal-300 ring-1 ring-inset ring-teal-500/20 rounded-full text-sm font-semibold mb-5">
            <Sparkles className="w-4 h-4" />
            Explore Categories
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white mb-5 text-balance">
            Find equipment by <span className="text-gradient-animated">category</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-pretty">
            Browse thousands of tools and equipment across 12+ categories. From construction
            to photography, we have everything you need.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {categories.map((category, index) => (
            <CategoryItem
              key={category.id}
              category={category}
              onClick={onCategoryClick}
              index={index}
            />
          ))}
        </div>

        <div className="text-center mt-12">
          <button
            onClick={() => onViewAll?.()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold rounded-full hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
          >
            View All Categories
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
