import { useEffect, useState } from 'react';
import { Plus, Target, Trash2, ChevronDown, Calendar, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useGoalsStore from '../../store/goalsStore';
import { getQuarter } from '../../lib/utils';
import { useToast } from '../../components/ui/Toast';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import GoalCard from './GoalCard';

const categories = [
  { value: 'health', label: 'Health' },
  { value: 'career', label: 'Career' },
  { value: 'finance', label: 'Finance' },
  { value: 'education', label: 'Education' },
  { value: 'relationships', label: 'Relationships' },
  { value: 'general', label: 'General' },
];

function CustomDatePicker({ label, value, onChange }) {
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => value ? new Date(value) : new Date());

  const daysInMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate();
  const firstDay = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1).getDay();
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const handlePrev = () => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1));
  const handleNext = () => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1));

  const handleSelect = (day) => {
    const d = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    onChange(key);
    setOpen(false);
  };

  const handleToday = () => {
    onChange(todayKey);
    setOpen(false);
  };

  const handleClear = () => {
    onChange('');
    setOpen(false);
  };

  const selectedKey = value || '';
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  return (
    <div className="space-y-1.5 relative">
      <label className="block text-sm font-medium text-gray-300">{label}</label>
      <button type="button" onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between rounded-lg border border-surface-600 bg-surface-900/50 px-3 py-2.5 text-sm text-gray-100 outline-none focus:border-primary-500">
        <span>{value ? new Date(value + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'Select date...'}</span>
        <Calendar className="h-4 w-4 text-gray-500" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="fixed z-20 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] rounded-lg border border-surface-600 bg-surface-800 shadow-xl overflow-hidden p-3">

            <div className="flex items-center justify-between mb-3">
              <button type="button" onClick={handlePrev} className="p-1 rounded hover:bg-surface-700 text-gray-400 hover:text-white">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm font-medium text-white">{monthNames[viewMonth.getMonth()]} {viewMonth.getFullYear()}</span>
              <button type="button" onClick={handleNext} className="p-1 rounded hover:bg-surface-700 text-gray-400 hover:text-white">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-0.5 mb-1">
              {dayNames.map(d => (
                <div key={d} className="text-center text-[9px] text-gray-500 font-medium h-6 flex items-center justify-center">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-0.5">
              {Array.from({ length: firstDay }, (_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const key = `${viewMonth.getFullYear()}-${String(viewMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const isSelected = key === selectedKey;
                const isToday = key === todayKey;
                return (
                  <button key={day} type="button" onClick={() => handleSelect(day)}
                    className={`text-center text-xs h-7 rounded-md transition-colors
                      ${isSelected ? 'bg-primary-500 text-white font-semibold' : isToday ? 'text-primary-400 font-semibold hover:bg-surface-700' : 'text-gray-300 hover:bg-surface-700'}`}>
                    {day}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between mt-3 pt-2 border-t-[0.5px] border-surface-700/30">
              <button type="button" onClick={handleClear} className="text-[10px] text-gray-500 hover:text-gray-300 transition-colors">Clear</button>
              <button type="button" onClick={handleToday} className="text-[10px] text-primary-400 hover:text-primary-300 transition-colors font-medium">Today</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function CustomSelect({ label, options, value, onChange }) {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.value === value);
  return (
    <div className="space-y-1.5 relative">
      <label className="block text-sm font-medium text-gray-300">{label}</label>
      <button type="button" onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between rounded-lg border border-surface-600 bg-surface-900/50 px-3 py-2.5 text-sm text-gray-100 outline-none focus:border-primary-500">
        {selected?.label || 'Select...'}
        <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 top-full mt-1 w-full rounded-lg border border-surface-600 bg-surface-800 shadow-xl overflow-hidden">
            {options.map(opt => (
              <button key={opt.value} type="button" onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`w-full text-left px-3 py-2.5 text-sm transition-colors ${value === opt.value ? 'bg-primary-500/10 text-primary-400' : 'text-gray-300 hover:bg-surface-700'}`}>
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function GoalsPanel() {
  const { user } = useAuthStore();
  const { goals, loading, fetchGoals, addGoal, deleteGoal, toggleMilestone } = useGoalsStore();
  const toast = useToast();
  const [showAddModal, setShowAddModal] = useState(false);
  const [gtTitle, setGtTitle] = useState('');
  const [gtDesc, setGtDesc] = useState('');
  const [gtCategory, setGtCategory] = useState('general');
  const [gtQuarter, setGtQuarter] = useState(getQuarter());
  const [gtYear, setGtYear] = useState(new Date().getFullYear());
  const [gtTargetDate, setGtTargetDate] = useState('');
  const [gtMilestones, setGtMilestones] = useState([]);
  const [gtNewMs, setGtNewMs] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => { if (user) fetchGoals(user.uid); }, [user]);

  const resetForm = () => {
    setGtTitle('');
    setGtDesc('');
    setGtCategory('general');
    setGtQuarter(getQuarter());
    setGtYear(new Date().getFullYear());
    setGtTargetDate('');
    setGtMilestones([]);
    setGtNewMs('');
  };

  const handleAddGoal = async () => {
    if (!gtTitle.trim()) return;
    setAdding(true);
    try {
      await addGoal(user.uid, {
        title: gtTitle.trim(),
        description: gtDesc.trim(),
        category: gtCategory,
        quarter: gtQuarter,
        year: gtYear,
        targetDate: gtTargetDate,
        milestones: gtMilestones.map(m => ({ text: m, completed: false })),
      });
      resetForm();
      setShowAddModal(false);
      toast.success('Goal created!');
    } catch { toast.error('Failed to create goal'); }
    finally { setAdding(false); }
  };

  const handleDeleteGoal = async (goalId) => {
    await deleteGoal(user.uid, goalId);
    toast.success('Goal deleted');
  };

  const handleToggleMilestone = async (goalId, idx, completed) => {
    await toggleMilestone(user.uid, goalId, idx, !completed);
  };

  const currentQuarter = getQuarter();
  const currentYear = new Date().getFullYear();
  const currentGoals = goals.filter(g => g.quarter === currentQuarter && g.year === currentYear);
  const otherGoals = goals.filter(g => !(g.quarter === currentQuarter && g.year === currentYear));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">Current quarter goals</p>
        <Button onClick={() => { resetForm(); setShowAddModal(true); }}>
          <Plus className="h-4 w-4" /> New Goal
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><LoadingSpinner /></div>
      ) : goals.length === 0 ? (
        <div className="text-center py-12">
          <Target className="h-12 w-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 mb-4">No goals yet. Set your first long-term goal!</p>
          <Button onClick={() => { resetForm(); setShowAddModal(true); }}><Plus className="h-4 w-4" /> Create Goal</Button>
        </div>
      ) : (
        <>
          {currentGoals.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Q{currentQuarter} {currentYear}</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {currentGoals.map(goal => (
                  <GoalCard key={goal.id} goal={goal} onDelete={handleDeleteGoal} onToggleMilestone={handleToggleMilestone} />
                ))}
              </div>
            </div>
          )}
          {otherGoals.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Other Goals</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {otherGoals.map(goal => (
                  <GoalCard key={goal.id} goal={goal} onDelete={handleDeleteGoal} onToggleMilestone={handleToggleMilestone} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <Modal open={showAddModal} onClose={() => { setShowAddModal(false); resetForm(); }} title="Create New Goal" size="lg">
        <form onSubmit={e => { e.preventDefault(); handleAddGoal(); }} className="space-y-4">
          <Input label="Goal Title" placeholder="e.g., Get fit, Learn a language..." value={gtTitle}
            onChange={e => setGtTitle(e.target.value)} autoFocus />
          <Input label="Description (optional)" placeholder="Describe your goal..." value={gtDesc}
            onChange={e => setGtDesc(e.target.value)} />
          <div className="grid grid-cols-2 gap-4">
            <CustomSelect label="Category" options={categories} value={gtCategory}
              onChange={v => setGtCategory(v)} />
            <CustomDatePicker label="Target Date" value={gtTargetDate} onChange={v => setGtTargetDate(v)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <CustomSelect label="Quarter" options={[1,2,3,4].map(q => ({ value: q, label: `Q${q}` }))} value={gtQuarter}
              onChange={v => setGtQuarter(v)} />
            <Input label="Year" type="number" value={gtYear} onChange={e => setGtYear(Number(e.target.value))} />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Milestones</label>
            <div className="flex gap-2">
              <Input placeholder="Add a milestone..." value={gtNewMs}
                onChange={e => setGtNewMs(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && gtNewMs.trim()) { e.preventDefault(); setGtMilestones(p => [...p, gtNewMs.trim()]); setGtNewMs(''); } }} />
              <Button type="button" variant="secondary" onClick={() => { if (gtNewMs.trim()) { setGtMilestones(p => [...p, gtNewMs.trim()]); setGtNewMs(''); } }}>
                Add
              </Button>
            </div>
            {gtMilestones.length === 0 && (
              <p className="text-[10px] text-yellow-400 flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3" /> Add at least one milestone to create a goal
              </p>
            )}
            {gtMilestones.length > 0 && (
              <div className="space-y-1 mt-2">
                {gtMilestones.map((m, i) => (
                  <div key={i} className="flex items-center justify-between bg-surface-700/30 rounded px-3 py-1.5">
                    <span className="text-sm text-gray-300">{m}</span>
                    <button type="button" onClick={() => setGtMilestones(p => p.filter((_, j) => j !== i))}
                      className="text-gray-500 hover:text-red-400">
                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => { setShowAddModal(false); resetForm(); }}>Cancel</Button>
            <Button type="submit" loading={adding} disabled={!gtTitle.trim() || gtMilestones.length === 0}>Create Goal</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default GoalsPanel;
