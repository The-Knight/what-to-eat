import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api, type Recipe } from '@/utils/api';
import Navbar from '@/components/Navbar';
import { Minus, Plus, Dices, RotateCcw, ChefHat } from 'lucide-react';

export default function WhatToEat() {
  const [meatCount, setMeatCount] = useState(1);
  const [vegCount, setVegCount] = useState(1);
  const [result, setResult] = useState<Recipe[] | null>(null);
  const [loading, setLoading] = useState(false);

  const pick = async () => {
    setLoading(true);
    try {
      const allRecipes = await api.getRecipes();
      const meats = allRecipes.filter((r) => r.dish_type === '荤菜');
      const vegs = allRecipes.filter((r) => r.dish_type === '素菜');

      const pickRandom = (arr: Recipe[], count: number) => {
        const shuffled = [...arr].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
      };

      const selected = [...pickRandom(meats, meatCount), ...pickRandom(vegs, vegCount)];
      setResult(selected);
    } finally {
      setLoading(false);
    }
  };

  const Counter = ({ label, value, onChange, type }: { label: string; value: number; onChange: (v: number) => void; type: 'meat' | 'veg' }) => {
    const colors = type === 'meat'
      ? { border: 'border-red-300', text: 'text-red-500', hover: 'hover:bg-red-50' }
      : { border: 'border-green-300', text: 'text-green-500', hover: 'hover:bg-green-50' };
    return (
      <div className="flex flex-col items-center gap-3">
        <span className="text-sm font-medium text-brown-light">{label}</span>
        <div className="flex items-center gap-4">
          <button
            onClick={() => onChange(Math.max(0, value - 1))}
            className={`w-10 h-10 rounded-full border-2 ${colors.border} ${colors.text} ${colors.hover} flex items-center justify-center transition-colors`}
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className={`text-4xl font-bold ${colors.text} w-12 text-center`}>{value}</span>
          <button
            onClick={() => onChange(Math.min(5, value + 1))}
            className={`w-10 h-10 rounded-full border-2 ${colors.border} ${colors.text} ${colors.hover} flex items-center justify-center transition-colors`}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 pt-24 pb-12">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-brown-light hover:text-brown mb-6 transition-colors text-sm"
        >
          ← 返回首页
        </Link>

        <div className="text-center mb-10">
          <div className="text-5xl mb-3">🎲</div>
          <h1 className="text-3xl font-bold text-brown mb-2">今天吃什么？</h1>
          <p className="text-brown-light">选好荤素数量，让命运来决定</p>
        </div>

        {/* Counters */}
        <div className="bg-white rounded-2xl p-8 shadow-sm flex items-center justify-center gap-12 sm:gap-16">
          <Counter label="荤菜" value={meatCount} onChange={setMeatCount} type="meat" />
          <div className="w-px h-16 bg-primary/10" />
          <Counter label="素菜" value={vegCount} onChange={setVegCount} type="veg" />
        </div>

        {/* Pick Button */}
        <div className="flex justify-center mt-8">
          <button
            onClick={pick}
            disabled={loading || (meatCount + vegCount) === 0}
            className="group flex items-center gap-3 bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-2xl text-lg font-bold transition-all duration-300 hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            {loading ? (
              <Dices className="w-6 h-6 animate-spin" />
            ) : (
              <Dices className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
            )}
            看看今天吃什么
          </button>
        </div>

        {/* Result */}
        {result && result.length > 0 && (
          <div className="mt-10 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-brown">今天的菜单</h2>
              <button
                onClick={pick}
                className="flex items-center gap-1 text-sm text-primary hover:text-primary-dark transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                重新选
              </button>
            </div>
            <div className="space-y-3">
              {result.map((recipe, i) => (
                <Link
                  key={recipe.id}
                  to={`/recipe/${recipe.id}`}
                  className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 animate-slide-up"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-primary/5 shrink-0">
                    {recipe.cover_image ? (
                      <img src={recipe.cover_image} alt={recipe.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl opacity-40">🍳</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        recipe.dish_type === '荤菜' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                      }`}>
                        {recipe.dish_type}
                      </span>
                      <span className="text-xs text-brown-light">{recipe.category_name}</span>
                    </div>
                    <h3 className="font-bold text-brown truncate">{recipe.name}</h3>
                  </div>
                  <ChefHat className="w-5 h-5 text-primary/30 shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {result && result.length === 0 && (
          <div className="mt-10 text-center py-10 animate-fade-in">
            <div className="text-4xl mb-3">🤔</div>
            <p className="text-brown-light">没有找到符合条件的菜谱</p>
            <p className="text-brown-light/60 text-sm mt-1">试试调整数量，或者先去添加菜谱</p>
          </div>
        )}
      </main>
    </div>
  );
}
