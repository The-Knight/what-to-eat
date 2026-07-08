const API_BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, options);
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.error || '请求失败');
  }
  return data.data;
}

export interface Ingredient {
  name: string;
  amount: string;
}

export type DishType = '荤菜' | '素菜';

export interface Recipe {
  id: number;
  name: string;
  category_id: number | null;
  category_name: string | null;
  difficulty: number;
  cook_time: string;
  cover_image: string;
  ingredients: Ingredient[];
  steps: string[];
  tips: string;
  dish_type: DishType;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  sort_order: number;
}

export const api = {
  getRecipes: (params?: { category?: string; search?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set('category', params.category);
    if (params?.search) searchParams.set('search', params.search);
    const query = searchParams.toString();
    return request<Recipe[]>(`/recipes${query ? `?${query}` : ''}`);
  },

  getRecipe: (id: number) => request<Recipe>(`/recipes/${id}`),

  createRecipe: (data: Partial<Recipe>) =>
    request<Recipe>('/recipes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  updateRecipe: (id: number, data: Partial<Recipe>) =>
    request<Recipe>(`/recipes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  deleteRecipe: (id: number) =>
    request<void>(`/recipes/${id}`, { method: 'DELETE' }),

  getCategories: () => request<Category[]>('/categories'),

  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return request<{ url: string }>('/upload', {
      method: 'POST',
      body: formData,
    });
  },
};
