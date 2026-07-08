import { Link, useLocation } from 'react-router-dom';
import { Home, Dices, Plus } from 'lucide-react';

const tabs = [
  { path: '/', label: '首页', icon: Home },
  { path: '/what-to-eat', label: '随机选菜', icon: Dices },
  { path: '/recipe/new', label: '新建', icon: Plus },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-t border-primary/10 pb-[env(safe-area-inset-bottom)] sm:hidden">
      <div className="flex items-center justify-around h-14">
        {tabs.map(({ path, label, icon: Icon }) => {
          const active = location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 transition-colors ${
                active ? 'text-primary' : 'text-brown-light'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
