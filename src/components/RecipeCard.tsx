import { Link } from 'react-router-dom';
import type { Recipe } from '@/utils/api';
import { Clock, Star } from 'lucide-react';

interface Props {
  recipe: Recipe;
}

export default function RecipeCard({ recipe }: Props) {
  const difficultyStars = Array.from({ length: 5 }, (_, i) => i < recipe.difficulty);

  return (
    <Link
      to={`/recipe/${recipe.id}`}
      className="group block bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1 animate-fade-in"
    >
      <div className="aspect-[4/3] overflow-hidden bg-primary/5">
        {recipe.cover_image ? (
          <img
            src={recipe.cover_image}
            alt={recipe.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl opacity-40">
            🍳
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-bold text-brown group-hover:text-primary transition-colors">{recipe.name}</h3>
        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          {recipe.dish_type && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              recipe.dish_type === '荤菜' ? 'bg-red-50 text-red-600' :
              'bg-green-50 text-green-600'
            }`}>
              {recipe.dish_type}
            </span>
          )}
          {recipe.category_name && (
            <span className="text-xs px-2.5 py-0.5 bg-primary/10 text-primary rounded-full font-medium">
              {recipe.category_name}
            </span>
          )}
          <div className="flex items-center gap-1 text-xs text-brown-light">
            <Clock className="w-3 h-3" />
            {recipe.cook_time}
          </div>
        </div>
        <div className="flex items-center gap-0.5 mt-2">
          {difficultyStars.map((active, i) => (
            <Star
              key={i}
              className={`w-3.5 h-3.5 ${active ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`}
            />
          ))}
        </div>
      </div>
    </Link>
  );
}
