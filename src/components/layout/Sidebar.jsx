import { LayoutDashboard, CheckSquare, ListTodo, Target, BarChart3, BookOpen, Settings, LogOut, Sun, Moon, Download, PanelLeftClose, PanelLeft } from 'lucide-react';
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

function Sidebar({ activeTab, onTabChange, onLogout, onSettings, onToggleTheme, onInstall, showInstall, userName, userEmail, userPhoto, collapsed, onToggleCollapse }) {
  const { theme } = useThemeStore();

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col h-screen bg-surface-850 border-r border-surface-700/50 shrink-0 transition-all duration-300',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      <div className="flex flex-col h-full overflow-hidden">
        <div className={cn('border-b border-surface-700/50 flex items-center', collapsed ? 'justify-center py-3' : 'p-5')}>
          {userPhoto ? (
            <img src={userPhoto} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0" />
          ) : (
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
              {userName ? userName.charAt(0).toUpperCase() : 'U'}
            </div>
          )}
          {!collapsed && (
            <div className="flex-1 min-w-0 ml-3">
              <p className="text-sm font-medium text-white truncate">{userName || 'User'}</p>
              <p className="text-xs text-gray-500 truncate">{userEmail || ''}</p>
            </div>
          )}
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                title={collapsed ? item.label : undefined}
                className={cn(
                  'w-full flex items-center justify-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200',
                  collapsed ? 'px-0' : '',
                  isActive
                    ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-surface-700/50 border border-transparent'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    {isActive && <div className="w-1 h-1 rounded-full bg-primary-500" />}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-surface-700/50 space-y-0.5">
          <div className="relative group">
            <button
              onClick={onSettings}
              title={collapsed ? 'Settings' : undefined}
              className="w-full flex items-center justify-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-gray-400 hover:text-gray-200 hover:bg-surface-700/50 transition-all"
            >
              <Settings className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="flex-1 text-left">Settings</span>}
            </button>
          </div>
          {showInstall && (
            <button
              onClick={onInstall}
              title={collapsed ? 'Install App' : undefined}
              className="w-full flex items-center justify-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-gray-400 hover:text-gray-200 hover:bg-surface-700/50 transition-all"
            >
              <Download className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="flex-1 text-left">Install App</span>}
            </button>
          )}
          <div className="relative group">
            <button
              onClick={onToggleTheme}
              title={collapsed ? (theme === 'dark' ? 'Light Mode' : 'Dark Mode') : undefined}
              className="w-full flex items-center justify-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-gray-400 hover:text-gray-200 hover:bg-surface-700/50 transition-all"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4 shrink-0" /> : <Moon className="h-4 w-4 shrink-0" />}
              {!collapsed && <span className="flex-1 text-left">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
            </button>
            {theme === 'light' && !collapsed && (
              <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 hidden group-hover:block z-50 pointer-events-none">
                <div className="bg-surface-800 text-[11px] text-gray-200 px-2.5 py-1.5 rounded-lg border border-white/10 shadow-xl whitespace-nowrap">
                  Yes! click me, enable the dark mode
                </div>
              </div>
            )}
          </div>
          <button
            onClick={onLogout}
            title={collapsed ? 'Logout' : undefined}
            className="w-full flex items-center justify-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span className="flex-1 text-left">Logout</span>}
          </button>
          <button
            onClick={onToggleCollapse}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="w-full flex items-center justify-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-gray-400 hover:text-gray-200 hover:bg-surface-700/50 transition-all"
          >
            {collapsed ? <PanelLeft className="h-4 w-4 shrink-0" /> : <PanelLeftClose className="h-4 w-4 shrink-0" />}
            {!collapsed && <span className="flex-1 text-left">Collapse</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
