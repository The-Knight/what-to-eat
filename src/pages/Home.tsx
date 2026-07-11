import { useEffect } from 'react';
import { useStore } from '@/store/useStore';
import Navbar from '@/components/Navbar';
import SearchBar from '@/components/SearchBar';
import CategoryFilter from '@/components/CategoryFilter';
import RecipeCard from '@/components/RecipeCard';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

export default function Home() {
  const { recipes, loading, errorMsg, fetchRecipes } = useStore();

  useEffect(() => {
    fetchRecipes();
  }, []);

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 pt-24 pb-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-brown mb-2">今天吃什么？</h1>
          <p className="text-brown-light">为你精心收藏的美味菜谱</p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <SearchBar />
          <CategoryFilter />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm text-brown-light">正在加载菜谱，首次可能需要等待几秒...</p>
          </div>
        ) : errorMsg ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <AlertCircle className="w-12 h-12 text-primary/40" />
            <p className="text-brown-light">{errorMsg}</p>
            <button
              onClick={fetchRecipes}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              重新加载
            </button>
          </div>
        ) : recipes.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🍽️</div>
            <p className="text-brown-light text-lg">还没有菜谱呢</p>
            <p className="text-brown-light/60 text-sm mt-1">点击上方"新建菜谱"开始添加吧</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
