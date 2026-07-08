import { create } from 'zustand';
import { api, type Recipe, type Category } from '@/utils/api';

interface AppState {
  recipes: Recipe[];
  categories: Category[];
  selectedCategory: string;
  searchQuery: string;
  loading: boolean;
  setRecipes: (recipes: Recipe[]) => void;
  setSelectedCategory: (category: string) => void;
  setSearchQuery: (query: string) => void;
  setLoading: (loading: boolean) => void;
  fetchRecipes: () => Promise<void>;
  fetchCategories: () => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  recipes: [],
  categories: [],
  selectedCategory: '全部',
  searchQuery: '',
  loading: false,

  setRecipes: (recipes) => set({ recipes }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setLoading: (loading) => set({ loading }),

  fetchRecipes: async () => {
    set({ loading: true });
    try {
      const { selectedCategory, searchQuery } = get();
      const recipes = await api.getRecipes({
        category: selectedCategory === '全部' ? undefined : selectedCategory,
        search: searchQuery || undefined,
      });
      set({ recipes });
    } catch (error) {
      console.error('Failed to fetch recipes:', error);
    } finally {
      set({ loading: false });
    }
  },

  fetchCategories: async () => {
    try {
      const categories = await api.getCategories();
      set({ categories });
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  },
}));
