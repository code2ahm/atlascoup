import { useState } from 'react';
import { LayoutDashboard, CheckSquare, ListTodo, Target, BarChart3, BookOpen, Settings, LogOut, User, Sun, Moon } from 'lucide-react';
import { cn } from '../../lib/utils';
import useThemeStore from '../../store/themeStore';

const navItems = [
  { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
  { id: 'habits', label: 'Habits', icon: CheckSquare },
  { id: 'tasks', label: 'Tasks', icon: ListTodo },
  { id: 'goals', label: 'Goals', icon: Target },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'journal', label: 'Journal', icon: BookOpen },
];

function BottomNav({ activeTab, onTabChange, onSettings, onLogout, userName, userEmail, userPhoto }) {
  const { theme, toggleTheme } = useThemeStore();
  const [menuOpen, setMenuOpen] = useState(false);

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

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex flex-col items-center gap-0.5 px-1.5 py-1.5 rounded-lg text-[9px] font-medium text-gray-500 hover:text-gray-300 transition-all min-w-0 flex-1 max-w-[64px]"
        >
          <User className="h-4 w-4" />
          <span className="truncate max-w-full">Profile</span>
        </button>
      </div>

      {menuOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
          <div className="absolute bottom-full right-2 mb-2 z-20 w-56 bg-surface-800 border border-surface-700/50 rounded-xl shadow-xl overflow-hidden">
            <div className="p-3 border-b border-surface-700/50 flex items-center gap-3">
              {userPhoto ? (
                <img src={userPhoto} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0" />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                  {(userName || 'U').charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-white truncate">{userName || 'User'}</p>
                <p className="text-[9px] text-gray-500 truncate">{userEmail || ''}</p>
              </div>
            </div>
            <button
              onClick={() => { onSettings(); setMenuOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-surface-700/50 transition-all"
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </button>
            <button
              onClick={() => { toggleTheme(); setMenuOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-surface-700/50 transition-all"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
            <button
              onClick={() => { onLogout(); setMenuOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </>
      )}
    </nav>
  );
}

export default BottomNav;
