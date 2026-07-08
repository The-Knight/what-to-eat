import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api, type Recipe } from '@/utils/api';
import { ArrowLeft, Edit, Trash2, Clock, Star, ChefHat } from 'lucide-react';
import ConfirmDialog from '@/components/ConfirmDialog';
import Navbar from '@/components/Navbar';

export default function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    if (id) {
      api.getRecipe(Number(id)).then(setRecipe);
    }
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    await api.deleteRecipe(Number(id));
    navigate('/');
  };

  if (!recipe) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const difficultyStars = Array.from({ length: 5 }, (_, i) => i < recipe.difficulty);

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />

      {/* Cover Image */}
      <div className="relative h-[40vh] bg-brown/10 mt-16">
        {recipe.cover_image ? (
          <img src={recipe.cover_image} alt={recipe.name} loading="lazy" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-8xl opacity-30">🍳</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-white/80 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回
          </button>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{recipe.name}</h1>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Info Bar */}
        <div className="flex flex-wrap items-center gap-4 mb-8">
          {recipe.category_name && (
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
              {recipe.category_name}
            </span>
          )}
          <div className="flex items-center gap-1 text-sm text-brown-light">
            <Clock className="w-4 h-4" />
            {recipe.cook_time}
          </div>
          <div className="flex items-center gap-0.5">
            {difficultyStars.map((active, i) => (
              <Star key={i} className={`w-4 h-4 ${active ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
            ))}
          </div>
          <div className="ml-auto flex gap-2">
            <Link
              to={`/recipe/${id}/edit`}
              className="flex items-center gap-1 px-3 py-1.5 bg-white border border-primary/20 text-primary rounded-lg text-sm hover:bg-primary/5 transition-colors"
            >
              <Edit className="w-3.5 h-3.5" />
              编辑
            </Link>
            <button
              onClick={() => setShowDelete(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-white border border-red-200 text-red-500 rounded-lg text-sm hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              删除
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Ingredients */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h2 className="flex items-center gap-2 text-lg font-bold text-brown mb-4">
                <ChefHat className="w-5 h-5 text-primary" />
                食材清单
              </h2>
              <div className="space-y-2">
                {recipe.ingredients.map((item, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-primary/5 last:border-0">
                    <span className="text-sm text-brown">{item.name}</span>
                    <span className="text-sm text-brown-light">{item.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h2 className="text-lg font-bold text-brown mb-6">烹饪步骤</h2>
              <div className="space-y-0">
                {recipe.steps.map((step, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center shrink-0">
                        {i + 1}
                      </div>
                      {i < recipe.steps.length - 1 && (
                        <div className="w-0.5 flex-1 bg-primary/15 my-1" />
                      )}
                    </div>
                    <p className="text-sm text-brown leading-relaxed pt-1 pb-4">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips */}
            {recipe.tips && (
              <div className="mt-4 bg-amber-50 border border-amber-200/60 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-amber-700 mb-2">💡 小贴士</h3>
                <p className="text-sm text-amber-800 leading-relaxed">{recipe.tips}</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <ConfirmDialog
        open={showDelete}
        title="删除菜谱"
        message={`确定要删除「${recipe.name}」吗？此操作无法撤销。`}
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  );
}
