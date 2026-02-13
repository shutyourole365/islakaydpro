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
      className="group relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-teal-200 overflow-hidden"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-50 to-emerald-50 flex items-center justify-center text-teal-600 group-hover:from-teal-500 group-hover:to-emerald-500 group-hover:text-white transition-all duration-300 mb-4">
          {iconMap[category.icon || 'Sparkles']}
        </div>

        <h3 className="font-semibold text-gray-900 mb-1 text-left">
          {category.name}
        </h3>
        <p className="text-sm text-gray-500 text-left">
          {category.equipment_count.toLocaleString()} items
        </p>
      </div>

      <div className="absolute bottom-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
        <ArrowRight className="w-4 h-4 text-gray-600" />
      </div>
    </button>
  );
});

interface CategoriesProps {
  categories: Category[];
  onCategoryClick: (category: Category) => void;
}

export default function Categories({ categories, onCategoryClick }: CategoriesProps) {
  return (
    <section id="categories" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-700 rounded-full text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Explore Categories
          </span>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Find Equipment by Category
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
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
          <a
            href="#"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-semibold rounded-full hover:bg-gray-800 transition-colors"
          >
            View All Categories
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </div>
    </section>
  );
}
