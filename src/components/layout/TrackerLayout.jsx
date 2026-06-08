import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { logout } from '../../services/auth';
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
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loading || !user) return <PageLoader />;

  const renderPanel = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
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
    <div className="flex h-screen bg-surface-900 overflow-hidden">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
        onSettings={() => setSettingsOpen(true)}
        userName={user.displayName || user.email?.split('@')[0] || ''}
        userEmail={user.email || ''}
        userPhoto={user.photoURL}
      />
      <main className="flex-1 overflow-y-auto pb-16 lg:pb-0">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          <div className="mb-6 lg:mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold text-white">
              {panelTitles[activeTab]}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          {renderPanel()}
        </div>
      </main>
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} onSettings={() => setSettingsOpen(true)} onLogout={handleLogout}
        userName={user.displayName || user.email?.split('@')[0] || ''}
        userEmail={user.email || ''}
        userPhoto={user.photoURL}
      />
    </div>
  );
}

export default TrackerLayout;
