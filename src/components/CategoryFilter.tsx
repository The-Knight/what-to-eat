import { useStore } from '@/store/useStore';
import { useEffect } from 'react';

export default function CategoryFilter() {
  const { categories, selectedCategory, setSelectedCategory, fetchRecipes, fetchCategories } = useStore();

  useEffect(() => {
    fetchCategories();
  }, []);

  const allCategories = ['全部', ...categories.map((c) => c.name)];

  const handleClick = (name: string) => {
    setSelectedCategory(name);
    fetchRecipes();
  };

  return (
    <div className="flex flex-wrap gap-2">
      {allCategories.map((name) => (
        <button
          key={name}
          onClick={() => handleClick(name)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
            selectedCategory === name
              ? 'bg-primary text-white shadow-md shadow-primary/25'
              : 'bg-white text-brown-light border border-primary/15 hover:border-primary/40 hover:text-primary'
          }`}
        >
          {name}
        </button>
      ))}
    </div>
  );
}
