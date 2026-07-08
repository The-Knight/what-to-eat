import { Search, X } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useEffect, useState } from 'react';

export default function SearchBar() {
  const { searchQuery, setSearchQuery, fetchRecipes } = useStore();
  const [localValue, setLocalValue] = useState(searchQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localValue);
      fetchRecipes();
    }, 300);
    return () => clearTimeout(timer);
  }, [localValue]);

  return (
    <div className="relative max-w-md w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brown-light" />
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder="搜索菜谱..."
        className="w-full pl-10 pr-10 py-2.5 bg-white border border-primary/20 rounded-full text-sm text-brown placeholder:text-brown-light/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
      />
      {localValue && (
        <button
          onClick={() => {
            setLocalValue('');
            setSearchQuery('');
            fetchRecipes();
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-brown-light/20 flex items-center justify-center hover:bg-brown-light/40 transition-colors"
        >
          <X className="w-3 h-3 text-brown-light" />
        </button>
      )}
    </div>
  );
}
