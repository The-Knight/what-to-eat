import { Link } from 'react-router-dom';
import { Plus, ChefHat, Dices } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-cream/80 backdrop-blur-md border-b border-primary/10">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <ChefHat className="w-7 h-7 text-primary group-hover:rotate-12 transition-transform duration-300" />
          <span className="text-xl font-bold text-brown">今天吃什么</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            to="/what-to-eat"
            className="flex items-center gap-1.5 bg-primary/10 hover:bg-primary/20 text-primary px-3 py-2 rounded-full text-sm font-medium transition-all duration-200"
          >
            <Dices className="w-4 h-4" />
            随机选菜
          </Link>
          <Link
            to="/recipe/new"
            className="flex items-center gap-1.5 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            新建菜谱
          </Link>
        </div>
      </div>
    </nav>
  );
}
