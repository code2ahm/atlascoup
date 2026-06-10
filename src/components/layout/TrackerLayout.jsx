import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Settings, LogOut, Sun, Moon } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useThemeStore from '../../store/themeStore';
import { logout } from '../../services/auth';
import { useToast } from '../ui/Toast';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import Dashboard from '../../features/dashboard/Dashboard';
import HabitsPanel from '../../features/habits/HabitsPanel';
import TasksPanel from '../../features/tasks/TasksPanel';
import GoalsPanel from '../../features/goals/GoalsPanel';
import AnalyticsPanel from '../../features/analytics/AnalyticsPanel';
import JournalPanel from '../../features/journal/JournalPanel';
import SettingsModal from '../../features/settings/SettingsModal';
import { PageLoader } from '../ui/LoadingSpinner';

function TrackerLayout() {
  const { user } = useAuthStore();
  const { theme, toggleTheme, setTheme } = useThemeStore();
  const navigate = useNavigate();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [showLightModeConfirm, setShowLightModeConfirm] = useState(false);

  const handleToggleTheme = () => {
    if (theme === 'dark') {
      setShowLightModeConfirm(true);
    } else {
      toggleTheme();
      toast.success('Shifted to dark mode, good choice!');
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  const handleLogout = async () => {
    setProfileOpen(false);
    await logout();
    navigate('/login');
  };

  if (loading || !user) return <PageLoader />;

  const renderPanel = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard onTabChange={setActiveTab} />;
      case 'habits': return <HabitsPanel />;
      case 'tasks': return <TasksPanel />;
      case 'goals': return <GoalsPanel />;
      case 'analytics': return <AnalyticsPanel />;
      case 'journal': return <JournalPanel />;
      default: return <Dashboard />;
    }
  };

  const panelTitles = {
    dashboard: 'Dashboard',
    habits: 'Daily Habits',
    tasks: 'Daily Tasks',
    goals: 'Long-term Goals',
    analytics: 'Analytics & Insights',
    journal: 'Journal',
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 glass-nav flex items-center justify-between px-4 h-12 nav-top">
        <div className="flex items-center gap-1.5 text-sm font-medium min-w-0">
          <span className="text-gray-500 whitespace-nowrap">Atlas Coup</span>
          <ChevronRight className="h-3 w-3 text-gray-600 shrink-0" />
          <span className="text-white truncate">{panelTitles[activeTab]}</span>
        </div>
        <button onClick={() => setProfileOpen(!profileOpen)} className="shrink-0">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="" className="w-7 h-7 rounded-lg object-cover" />
          ) : (
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center text-white font-bold text-[11px]">
              {(user?.displayName || user?.email || 'U').charAt(0).toUpperCase()}
            </div>
          )}
        </button>
        <AnimatePresence>
          {profileOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.96 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="absolute top-full right-2 mt-1.5 z-20 w-48 rounded-xl shadow-xl overflow-hidden"
                style={{ background: 'rgb(13,17,23)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div className="p-3 border-b border-white/[0.06]">
                  <p className="text-xs font-medium text-white truncate">{user?.displayName || 'User'}</p>
                  <p className="text-[10px] text-gray-500 truncate">{user?.email || ''}</p>
                </div>
                <button
                  onClick={() => { setSettingsOpen(true); setProfileOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-gray-300 hover:text-white hover:bg-white/[0.06] transition-all"
                >
                  <Settings className="h-3.5 w-3.5" />
                  <span>Settings</span>
                </button>
                <button
                  onClick={() => { handleToggleTheme(); setProfileOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-gray-300 hover:text-white transition-all"
                >
                  {theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
                  <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-red-400 hover:text-red-300 transition-all"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Logout</span>
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
        onSettings={() => setSettingsOpen(true)}
        onToggleTheme={handleToggleTheme}
        userName={user.displayName || user.email?.split('@')[0] || ''}
        userEmail={user.email || ''}
        userPhoto={user.photoURL}
      />
      <main className="flex-1 overflow-y-auto pb-16 lg:pb-0 pt-12 lg:pt-0">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          <div className="hidden lg:flex items-center gap-1.5 text-xs font-medium mb-7">
            <span className="text-gray-500">Atlas Coup</span>
            <ChevronRight className="h-2.5 w-2.5 text-gray-600" />
            <span className="text-gray-300">{panelTitles[activeTab]}</span>
          </div>
          {renderPanel()}
        </div>
      </main>
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      <AnimatePresence>
        {showLightModeConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowLightModeConfirm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={e => e.stopPropagation()}
              className="glass border border-white/10 rounded-2xl p-6 sm:p-8 max-w-sm w-full text-center"
            >
              <svg className="w-20 h-20 mx-auto mb-4" viewBox="0 0 100 100" fill="none">
                <circle cx="50" cy="50" r="18" fill="#FCD34D" />
                {[0,45,90,135,180,225,270,315].map((angle,i) => (
                  <line key={i} x1="50" y1="16" x2="50" y2="8" stroke="#FCD34D" strokeWidth="3" strokeLinecap="round"
                    transform={`rotate(${angle} 50 50)`} opacity="0.8" />
                ))}
                {[22.5,67.5,112.5,157.5,202.5,247.5,292.5,337.5].map((angle,i) => (
                  <line key={i+8} x1="50" y1="20" x2="50" y2="14" stroke="#FCD34D" strokeWidth="2" strokeLinecap="round"
                    transform={`rotate(${angle} 50 50)`} opacity="0.5" />
                ))}
                <circle cx="44" cy="44" r="4" fill="#F59E0B" opacity="0.6" />
                <path d="M38 56 Q50 66 62 56" stroke="#F59E0B" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <rect x="42" y="32" width="4" height="6" rx="2" fill="#fff" opacity="0.9" />
                <rect x="54" y="32" width="4" height="6" rx="2" fill="#fff" opacity="0.9" />
              </svg>
              <h2 className="text-lg font-bold mb-2">Do you want to get blinded by the light of this app?</h2>
              <p className="text-sm text-gray-400 mb-6">It's bright over here! Are you sure?</p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => { setTheme('light'); setShowLightModeConfirm(false); toast.success('Shifted to light mode'); }}
                  className="w-full py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-medium text-sm transition-all border border-amber-500/20"
                >
                  Yes, blind me
                </button>
                <button
                  onClick={() => { setShowLightModeConfirm(false); }}
                  className="w-full py-2.5 rounded-xl bg-surface-800 hover:bg-surface-700 text-gray-300 font-medium text-sm transition-all border border-white/5"
                >
                  No, I would use dark mode instead
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default TrackerLayout;
