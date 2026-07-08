import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, type Recipe, type Ingredient, type Category, type DishType } from '@/utils/api';
import Navbar from '@/components/Navbar';
import ImageUpload from '@/components/ImageUpload';
import IngredientEditor from '@/components/IngredientEditor';
import StepEditor from '@/components/StepEditor';
import { Save, ArrowLeft } from 'lucide-react';

export default function RecipeEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [difficulty, setDifficulty] = useState(1);
  const [cookTime, setCookTime] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [ingredients, setIngredients] = useState<Ingredient[]>([{ name: '', amount: '' }]);
  const [steps, setSteps] = useState<string[]>(['']);
  const [tips, setTips] = useState('');
  const [dishType, setDishType] = useState<DishType>('荤菜');
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getCategories().then(setCategories);
    if (isEdit) {
      api.getRecipe(Number(id)).then((recipe) => {
        setName(recipe.name);
        setCategoryId(recipe.category_id);
        setDifficulty(recipe.difficulty);
        setCookTime(recipe.cook_time);
        setCoverImage(recipe.cover_image);
        setIngredients(recipe.ingredients.length ? recipe.ingredients : [{ name: '', amount: '' }]);
        setSteps(recipe.steps.length ? recipe.steps : ['']);
        setTips(recipe.tips);
        setDishType(recipe.dish_type || '荤菜');
      });
    }
  }, [id]);

  const handleSave = async () => {
    if (!name.trim()) {
      alert('请输入菜谱名称');
      return;
    }

    setSaving(true);
    try {
      const data = {
        name: name.trim(),
        category_id: categoryId,
        difficulty,
        cook_time: cookTime,
        cover_image: coverImage,
        ingredients: ingredients.filter((i) => i.name.trim()),
        steps: steps.filter((s) => s.trim()),
        tips,
        dish_type: dishType,
      };

      if (isEdit) {
        await api.updateRecipe(Number(id), data);
      } else {
        await api.createRecipe(data);
      }
      navigate('/');
    } catch (error) {
      alert('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 pt-24 pb-12">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-brown-light hover:text-brown mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回
        </button>

        <h1 className="text-2xl font-bold text-brown mb-8">
          {isEdit ? '编辑菜谱' : '新建菜谱'}
        </h1>

        <div className="space-y-8">
          {/* Cover Image */}
          <div>
            <label className="block text-sm font-medium text-brown mb-2">封面图</label>
            <ImageUpload value={coverImage} onChange={setCoverImage} />
          </div>

          {/* Basic Info */}
          <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-medium text-brown mb-1">菜谱名称 *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例如：番茄炒蛋"
                className="w-full px-3 py-2.5 bg-cream/50 border border-primary/15 rounded-xl text-brown placeholder:text-brown-light/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-brown mb-1">分类</label>
                <select
                  value={categoryId || ''}
                  onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : null)}
                  className="w-full px-3 py-2.5 bg-cream/50 border border-primary/15 rounded-xl text-brown focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">未分类</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-brown mb-1">难度</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-cream/50 border border-primary/15 rounded-xl text-brown focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>{'⭐'.repeat(n)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-brown mb-1">烹饪时间</label>
                <input
                  type="text"
                  value={cookTime}
                  onChange={(e) => setCookTime(e.target.value)}
                  placeholder="例如：30分钟"
                  className="w-full px-3 py-2.5 bg-cream/50 border border-primary/15 rounded-xl text-brown placeholder:text-brown-light/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-brown mb-1">荤素</label>
              <select
                value={dishType}
                onChange={(e) => setDishType(e.target.value as DishType)}
                className="w-full px-3 py-2.5 bg-cream/50 border border-primary/15 rounded-xl text-brown focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="荤菜">荤菜</option>
                <option value="素菜">素菜</option>
              </select>
            </div>
          </div>

          {/* Ingredients */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="text-sm font-medium text-brown mb-3">食材清单</h2>
            <IngredientEditor value={ingredients} onChange={setIngredients} />
          </div>

          {/* Steps */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="text-sm font-medium text-brown mb-3">烹饪步骤</h2>
            <StepEditor value={steps} onChange={setSteps} />
          </div>

          {/* Tips */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="text-sm font-medium text-brown mb-2">小贴士</h2>
            <textarea
              value={tips}
              onChange={(e) => setTips(e.target.value)}
              placeholder="分享你的烹饪心得..."
              rows={3}
              className="w-full px-3 py-2.5 bg-cream/50 border border-primary/15 rounded-xl text-sm text-brown placeholder:text-brown-light/40 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>

          {/* Submit */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-primary/25 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? '保存中...' : '保存菜谱'}
          </button>
        </div>
      </main>
    </div>
  );
}
