import { LayoutDashboard, CheckSquare, ListTodo, Target, BarChart3, BookOpen, Settings, LogOut, Sun, Moon, Download } from 'lucide-react';
import { cn } from '../../lib/utils';
import useThemeStore from '../../store/themeStore';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'habits', label: 'Habits', icon: CheckSquare },
  { id: 'tasks', label: 'Tasks', icon: ListTodo },
  { id: 'goals', label: 'Goals', icon: Target },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'journal', label: 'Journal', icon: BookOpen },
];

function Sidebar({ activeTab, onTabChange, onLogout, onSettings, onToggleTheme, onInstall, showInstall, userName, userEmail, userPhoto }) {
  const { theme } = useThemeStore();
  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-surface-700/50">
        <div className="flex items-center gap-3">
          {userPhoto ? (
            <img src={userPhoto} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0" />
          ) : (
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
              {userName ? userName.charAt(0).toUpperCase() : 'U'}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{userName || 'User'}</p>
            <p className="text-xs text-gray-500 truncate">{userEmail || ''}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-surface-700/50 border border-transparent'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
              {isActive && <div className="ml-auto w-1 h-1 rounded-full bg-primary-500" />}
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-surface-700/50 space-y-0.5">
        <button
          onClick={onSettings}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-gray-400 hover:text-gray-200 hover:bg-surface-700/50 transition-all"
        >
          <Settings className="h-4 w-4" />
          <span>Settings</span>
        </button>
        {showInstall && (
          <button
            onClick={onInstall}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-gray-400 hover:text-gray-200 hover:bg-surface-700/50 transition-all"
          >
            <Download className="h-4 w-4" />
            <span>Install App</span>
          </button>
        )}
        <div className="relative group">
          <button
            onClick={onToggleTheme}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-gray-400 hover:text-gray-200 hover:bg-surface-700/50 transition-all"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          {theme === 'light' && (
            <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 hidden group-hover:block z-50 pointer-events-none">
              <div className="bg-surface-800 text-[11px] text-gray-200 px-2.5 py-1.5 rounded-lg border border-white/10 shadow-xl whitespace-nowrap">
                Yes! click me, enable the dark mode
              </div>
            </div>
          )}
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <aside className="hidden lg:flex flex-col w-60 h-screen bg-surface-850 border-r border-surface-700/50 shrink-0">
      {sidebarContent}
    </aside>
  );
}

export default Sidebar;
