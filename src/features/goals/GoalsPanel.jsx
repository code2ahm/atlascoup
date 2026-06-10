import { useEffect, useState, useRef } from 'react';
import { Plus, Target, Trash2, ChevronDown, Calendar, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useGoalsStore from '../../store/goalsStore';
import { getQuarter } from '../../lib/utils';
import { useToast } from '../../components/ui/Toast';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { LoadingSkeleton } from '../../components/ui/LoadingSpinner';
import GoalCard from './GoalCard';

const categories = [
  { value: 'health', label: 'Health' },
  { value: 'career', label: 'Career' },
  { value: 'finance', label: 'Finance' },
  { value: 'education', label: 'Education' },
  { value: 'relationships', label: 'Relationships' },
  { value: 'general', label: 'General' },
];

function CustomDatePicker({ label, value, onChange, compact }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const [viewMonth, setViewMonth] = useState(() => value ? new Date(value) : new Date());

  const handleToggle = () => {
    setOpen(!open);
  };

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
    <div className={`relative ${compact ? 'space-y-0.5' : 'space-y-1.5'}`}>
      <label className={`block font-medium text-gray-300 ${compact ? 'text-[11px]' : 'text-sm'}`}>{label}</label>
      <button ref={btnRef} type="button" onClick={handleToggle}
        className={`w-full flex items-center justify-between rounded-lg border border-surface-600 bg-surface-900/50 text-gray-100 outline-none focus:border-primary-500 transition-colors ${compact ? 'px-2 py-1.5 text-[11px]' : 'px-3 py-2.5 text-sm'}`}>
        <span>{value ? new Date(value + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'Select date...'}</span>
        <Calendar className={`${compact ? 'h-3 w-3' : 'h-4 w-4'} text-gray-500`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="fixed inset-0 z-20 flex items-center justify-center">
            <div className="w-[280px] rounded-lg border border-surface-600 bg-[rgb(13,17,23)] shadow-xl overflow-hidden p-3">

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
          </div>
        </>
      )}
    </div>
  );
}

function CustomSelect({ label, options, value, onChange, compact }) {
  const [open, setOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ left: 0, top: 0, width: 0 });
  const btnRef = useRef(null);
  const selected = options.find(o => o.value === value);

  const handleToggle = () => {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setDropdownPos({ left: rect.left, top: rect.bottom + 2, width: rect.width });
    }
    setOpen(!open);
  };

  return (
    <div className={`relative ${compact ? 'space-y-0.5' : 'space-y-1.5'}`}>
      <label className={`block font-medium text-gray-300 ${compact ? 'text-[11px]' : 'text-sm'}`}>{label}</label>
      <button ref={btnRef} type="button" onClick={handleToggle}
        className={`w-full flex items-center justify-between rounded-lg border border-surface-600 bg-surface-900/50 text-gray-100 outline-none focus:border-primary-500 transition-colors ${compact ? 'px-2 py-1.5 text-[11px]' : 'px-3 py-2.5 text-sm'}`}>
        {selected?.label || 'Select...'}
        <ChevronDown className={`${compact ? 'h-3 w-3' : 'h-4 w-4'} text-gray-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="fixed z-20" style={{ left: dropdownPos.left, top: dropdownPos.top, width: dropdownPos.width }}>
            <div className="w-full rounded-lg border border-surface-600 bg-[rgb(13,17,23)] shadow-xl overflow-hidden">
              {options.map(opt => (
                <button key={opt.value} type="button" onClick={() => { onChange(opt.value); setOpen(false); }}
                  className={`w-full text-left transition-colors ${compact ? 'px-2 py-1.5 text-[11px]' : 'px-3 py-2.5 text-sm'} ${value === opt.value ? 'bg-primary-400/15 text-primary-300' : 'text-gray-300 hover:bg-surface-700'}`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function GoalsPanel() {
  const { user } = useAuthStore();
  const subscribeGoals = useGoalsStore(s => s.subscribeGoals);
  const { goals, loading, addGoal, deleteGoal, toggleMilestone } = useGoalsStore();
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
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [filterQuarter, setFilterQuarter] = useState(getQuarter());
  const [filterCategory, setFilterCategory] = useState(null);

  useEffect(() => {
    if (user) {
      const unsub = subscribeGoals(user.uid);
      return () => unsub();
    }
  }, [user]);

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

  const sortByDue = (a, b) => {
    if (!a.targetDate) return 1;
    if (!b.targetDate) return -1;
    return new Date(a.targetDate) - new Date(b.targetDate);
  };

  const quarters = [1, 2, 3, 4];
  const filterCategories = ['health', 'career', 'finance', 'education', 'relationships', 'general'];

  const filtered = goals.filter(g => {
    if (filterQuarter && g.quarter !== filterQuarter) return false;
    if (g.year !== filterYear) return false;
    if (filterCategory && g.category !== filterCategory) return false;
    return true;
  }).sort(sortByDue);

  const grouped = {};
  filtered.forEach(g => {
    const key = `Q${g.quarter} ${g.year}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(g);
  });

  const years = [...new Set(goals.map(g => g.year))].sort((a, b) => b - a);
  if (!years.includes(filterYear)) years.unshift(filterYear);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-sm text-gray-400">Goals</p>
        <Button onClick={() => { resetForm(); setShowAddModal(true); }}>
          <Plus className="h-4 w-4" /> New Goal
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 bg-white/[0.03] border border-white/[0.06] rounded-lg px-1.5 py-1">
          <button onClick={() => setFilterYear(y => y - 1)} className="p-0.5 rounded text-gray-500 hover:text-white hover:bg-white/5 transition-colors">
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <span className="text-xs font-medium text-white px-2 min-w-[44px] text-center">{filterYear}</span>
          <button onClick={() => setFilterYear(y => y + 1)} className="p-0.5 rounded text-gray-500 hover:text-white hover:bg-white/5 transition-colors">
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
          <div className="w-px h-4 bg-white/10 mx-1" />
          {years.slice(0, 5).map(y => (
            <button key={y} onClick={() => setFilterYear(y)}
              className={`text-[10px] px-1.5 py-0.5 rounded transition-colors ${filterYear === y ? 'bg-primary-500/20 text-primary-400' : 'text-gray-500 hover:text-gray-300'}`}>
              {y}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <button onClick={() => setFilterQuarter(null)}
          className={`text-[10px] px-2.5 py-1 rounded-full border transition-colors ${filterQuarter === null ? 'bg-white/10 text-white border-white/20' : 'text-gray-500 border-white/[0.06] hover:text-gray-300 hover:border-white/10'}`}>
          All
        </button>
        {quarters.map(q => (
          <button key={q} onClick={() => setFilterQuarter(q)}
            className={`text-[10px] px-2.5 py-1 rounded-full border transition-colors ${filterQuarter === q ? 'bg-primary-500/20 text-primary-400 border-primary-500/30' : 'text-gray-500 border-white/[0.06] hover:text-gray-300 hover:border-white/10'}`}>
            Q{q}
          </button>
        ))}
        <div className="w-px h-4 bg-white/10 mx-1" />
        {filterCategories.map(c => (
          <button key={c} onClick={() => setFilterCategory(filterCategory === c ? null : c)}
            className={`text-[10px] px-2.5 py-1 rounded-full border capitalize transition-colors ${filterCategory === c ? 'bg-primary-500/20 text-primary-400 border-primary-500/30' : 'text-gray-500 border-white/[0.06] hover:text-gray-300 hover:border-white/10'}`}>
            {c}
          </button>
        ))}
        {(filterQuarter !== getQuarter() || filterCategory !== null) && (
          <button onClick={() => { setFilterYear(new Date().getFullYear()); setFilterQuarter(getQuarter()); setFilterCategory(null); }}
            className="text-[10px] px-2 py-1 rounded-full text-gray-600 hover:text-gray-400 transition-colors">
            Reset
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-4 py-4">
          <div className="flex flex-wrap gap-2">
            {[...Array(6)].map((_, i) => (
              <LoadingSkeleton key={i} className="h-6 w-16 rounded-full" />
            ))}
          </div>
          {[...Array(2)].map((_, i) => (
            <div key={i} className="space-y-3">
              <LoadingSkeleton className="h-4 w-20" />
              <div className="grid md:grid-cols-2 gap-4">
                {[...Array(2)].map((_, j) => (
                  <div key={j} className="bg-surface-800/50 rounded-xl border border-surface-700/30 p-4 space-y-3">
                    <LoadingSkeleton className="h-5 w-3/4" />
                    <LoadingSkeleton className="h-3 w-full" />
                    <div className="flex gap-2">
                      <LoadingSkeleton className="h-5 w-16 rounded-full" />
                      <LoadingSkeleton className="h-5 w-20 rounded-full" />
                    </div>
                    <LoadingSkeleton className="h-1 w-full rounded-full" />
                    <div className="space-y-1.5">
                      {[...Array(3)].map((_, k) => (
                        <div key={k} className="flex items-center gap-2">
                          <LoadingSkeleton className="h-3.5 w-3.5 rounded-full" />
                          <LoadingSkeleton className="h-3 w-5/6" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : goals.length === 0 ? (
        <div className="text-center py-12">
          <Target className="h-12 w-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 mb-4">No goals yet. Set your first long-term goal!</p>
          <Button onClick={() => { resetForm(); setShowAddModal(true); }}><Plus className="h-4 w-4" /> Create Goal</Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <Target className="h-12 w-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No goals match this filter.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([key, gs]) => (
            <div key={key} className="space-y-3">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">{key}</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {gs.map(goal => (
                  <GoalCard key={goal.id} goal={goal} onDelete={handleDeleteGoal} onToggleMilestone={handleToggleMilestone} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showAddModal} onClose={() => { setShowAddModal(false); resetForm(); }} title="Create New Goal" className="w-[90vw] sm:w-[65vw] max-w-lg max-h-[70vh]" scrollable>
        <form onSubmit={e => { e.preventDefault(); handleAddGoal(); }} className="space-y-2.5">
          <div className="space-y-0.5">
            <Input label="Goal Title" placeholder="Run a marathon, learn guitar..." value={gtTitle}
              onChange={e => setGtTitle(e.target.value.slice(0, 100))} autoFocus className="text-xs" />
            <p className="text-[9px] text-gray-600 text-right">{gtTitle.length}/100</p>
          </div>
          <div className="space-y-0.5">
            <Input label="Description" placeholder="What does success look like?" value={gtDesc}
              onChange={e => setGtDesc(e.target.value.slice(0, 300))} className="text-xs" />
            <p className="text-[9px] text-gray-600 text-right">{gtDesc.length}/300</p>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <CustomSelect compact label="Category" options={categories} value={gtCategory}
              onChange={v => setGtCategory(v)} />
            <CustomSelect compact label="Quarter" options={[1,2,3,4].map(q => ({ value: q, label: `Q${q}` }))} value={gtQuarter}
              onChange={v => setGtQuarter(v)} />
          </div>
          <div>
            <CustomDatePicker compact label="Target Date" value={gtTargetDate} onChange={v => setGtTargetDate(v)} />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-medium text-gray-400">Milestones</label>
              <span className="text-[9px] text-gray-600">{gtMilestones.length}/10</span>
            </div>
            <div className="flex gap-1.5">
              <Input placeholder="Add a milestone" value={gtNewMs}
                onChange={e => setGtNewMs(e.target.value.slice(0, 80))}
                className="text-xs"
                onKeyDown={e => { if (e.key === 'Enter' && gtNewMs.trim() && gtMilestones.length < 10) { e.preventDefault(); setGtMilestones(p => [...p, gtNewMs.trim()]); setGtNewMs(''); } }} />
              <Button type="button" variant="secondary" disabled={!gtNewMs.trim() || gtMilestones.length >= 10} className="shrink-0 text-[11px] px-2.5 py-1.5" onClick={() => { if (gtNewMs.trim()) { setGtMilestones(p => [...p, gtNewMs.trim()]); setGtNewMs(''); } }}>
                Add
              </Button>
            </div>
            <div>
              {gtMilestones.length === 0 && (
                <p className="text-[9px] text-yellow-400/80 flex items-center gap-1">
                  <AlertCircle className="h-2.5 w-2.5" /> Add at least one milestone
                </p>
              )}
            </div>
            {gtMilestones.length > 0 && (
              <div className="space-y-0.5 mt-1 max-h-32 custom-scroll overflow-y-auto">
                {gtMilestones.map((m, i) => (
                  <div key={i} className="flex items-center justify-between bg-surface-700/30 rounded-lg px-2 py-1">
                    <span className="text-[11px] text-gray-300">{m}</span>
                    <button type="button" onClick={() => setGtMilestones(p => p.filter((_, j) => j !== i))}
                      className="text-gray-500 hover:text-red-400 shrink-0 ml-2">
                      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" className="text-[11px] h-7" onClick={() => { setShowAddModal(false); resetForm(); }}>Cancel</Button>
            <Button type="submit" className="text-[11px] h-7" loading={adding} disabled={!gtTitle.trim() || gtMilestones.length === 0}>Create Goal</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default GoalsPanel;
