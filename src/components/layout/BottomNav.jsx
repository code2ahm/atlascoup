import { LayoutDashboard, CheckSquare, ListTodo, Target, BarChart3, BookOpen } from 'lucide-react';
import { cn } from '../../lib/utils';

const navItems = [
  { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
  { id: 'habits', label: 'Habits', icon: CheckSquare },
  { id: 'tasks', label: 'Tasks', icon: ListTodo },
  { id: 'goals', label: 'Goals', icon: Target },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'journal', label: 'Journal', icon: BookOpen },
];

function BottomNav({ activeTab, onTabChange }) {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass-nav" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div className="flex items-center justify-center gap-1 px-1 pt-3 pb-0.5">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                'flex flex-col items-center gap-0.5 px-1.5 py-1.5 rounded-lg text-[9px] font-medium transition-all duration-200 min-w-0 flex-1 max-w-[64px]',
                isActive
                  ? 'text-primary-400'
                  : 'text-gray-500 hover:text-gray-300'
              )}
            >
              <Icon className={cn('h-4 w-4', isActive && 'drop-shadow-[0_0_6px_rgba(79,172,254,0.5)]')} />
              <span className="truncate max-w-full">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNav;
