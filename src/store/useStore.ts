import { create } from 'zustand';
import { api, type Recipe, type Category } from '@/utils/api';

interface AppState {
  recipes: Recipe[];
  categories: Category[];
  selectedCategory: string;
  searchQuery: string;
  loading: boolean;
  errorMsg: string;
  setRecipes: (recipes: Recipe[]) => void;
  setSelectedCategory: (category: string) => void;
  setSearchQuery: (query: string) => void;
  setLoading: (loading: boolean) => void;
  setErrorMsg: (msg: string) => void;
  fetchRecipes: () => Promise<void>;
  fetchCategories: () => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  recipes: [],
  categories: [],
  selectedCategory: '全部',
  searchQuery: '',
  loading: false,
  errorMsg: '',

  setRecipes: (recipes) => set({ recipes }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setLoading: (loading) => set({ loading }),
  setErrorMsg: (msg) => set({ errorMsg: msg }),

  fetchRecipes: async () => {
    set({ loading: true, errorMsg: '' });
    try {
      const { selectedCategory, searchQuery } = get();
      const recipes = await api.getRecipes({
        category: selectedCategory === '全部' ? undefined : selectedCategory,
        search: searchQuery || undefined,
      });
      set({ recipes, errorMsg: '' });
    } catch (error: any) {
      console.error('Failed to fetch recipes:', error);
      set({ errorMsg: '加载失败，请点击下方重试' });
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
