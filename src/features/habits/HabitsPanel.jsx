import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Pencil, ChevronLeft, ChevronRight, Circle, CheckCircle2 } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useHabitsStore from '../../store/habitsStore';
import { getMonthId, formatDateKey } from '../../lib/utils';
import { useToast } from '../../components/ui/Toast';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

function getWeekRange(date) {
  const d = new Date(date);
  const day = d.getDay();
  const start = new Date(d);
  start.setDate(d.getDate() - day);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start, end };
}

function formatWeekKey(date) {
  const { start } = getWeekRange(date);
  return `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`;
}

function HabitsPanel() {
  const { user } = useAuthStore();
  const { habits, loading, fetchHabits, addHabit, updateHabit, deleteHabit, toggleDay } = useHabitsStore();
  const toast = useToast();
  const [weekOffset, setWeekOffset] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  const today = new Date();
  const todayKey = formatDateKey(today);
  const weekBase = new Date(today);
  weekBase.setDate(weekBase.getDate() + weekOffset * 7);
  const { start: weekStart, end: weekEnd } = getWeekRange(weekBase);

  const monthId = getMonthId(today);
  const weekKey = formatWeekKey(weekBase);

  useEffect(() => {
    if (user) fetchHabits(user.uid, today);
  }, [user, monthId]);

  const weekDays = useMemo(() => {
    const days = [];
    const cur = new Date(weekStart);
    while (cur <= weekEnd) {
      days.push({
        date: new Date(cur),
        key: formatDateKey(cur),
        dayNum: cur.getDate(),
        isToday: formatDateKey(cur) === todayKey,
        month: cur.toLocaleString('default', { month: 'short' }),
      });
      cur.setDate(cur.getDate() + 1);
    }
    return days;
  }, [weekKey]);

  const isCurrentWeek = formatWeekKey(today) === weekKey;

  const handlePrevWeek = () => setWeekOffset(o => o - 1);
  const handleNextWeek = () => setWeekOffset(o => o + 1);
  const handleThisWeek = () => setWeekOffset(0);

  const handleAddHabit = async () => {
    if (!newHabitName.trim()) return;
    setAdding(true);
    try {
      await addHabit(user.uid, newHabitName.trim(), today);
      setNewHabitName('');
      setShowAddModal(false);
      toast.success('Habit added!');
    } catch { toast.error('Failed to add habit'); }
    finally { setAdding(false); }
  };

  const handleToggleDay = async (habitId, dayKey) => {
    if (dayKey !== todayKey) return;
    const habit = habits.find(h => h.id === habitId);
    const currentValue = habit?.days?.[dayKey] || false;
    await toggleDay(user.uid, habitId, dayKey, !currentValue, today);
  };

  const handleRenameHabit = async (habitId) => {
    if (editName.trim() && editName.trim() !== habits.find(h => h.id === habitId)?.name) {
      await updateHabit(user.uid, habitId, { name: editName.trim() }, today);
      toast.success('Habit renamed');
    }
    setEditingId(null);
  };

  const handleDeleteHabit = async (habitId) => {
    await deleteHabit(user.uid, habitId, today);
    toast.success('Habit deleted');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={handlePrevWeek} className="p-2 rounded-lg hover:bg-surface-700 text-gray-400 hover:text-white transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="text-center min-w-[200px]">
            <button onClick={handleThisWeek} className={`text-base font-semibold transition-colors ${isCurrentWeek ? 'text-primary-400' : 'text-white hover:text-primary-400'}`}>
              {weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — {weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </button>
          </div>
          <button onClick={handleNextWeek} className="p-2 rounded-lg hover:bg-surface-700 text-gray-400 hover:text-white transition-colors">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4" /> Add Habit
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><LoadingSpinner /></div>
      ) : habits.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 mb-4">No habits yet. Start by adding one!</p>
          <Button onClick={() => setShowAddModal(true)}><Plus className="h-4 w-4" /> Add Your First Habit</Button>
        </div>
      ) : (
        <>
          <div className="hidden sm:grid grid-cols-[minmax(160px,1.8fr)_repeat(7,1fr)] gap-x-3 gap-y-3 items-center">
            <div className="text-xs font-semibold text-gray-500 px-1 self-end leading-none py-2">Habit</div>
            {weekDays.map(day => (
              <div key={day.key} className={`text-center rounded-lg p-1 self-end ${day.isToday ? 'bg-primary-500/10 border border-primary-500/30' : ''}`}>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider leading-tight">
                  {day.date.toLocaleDateString('en-US', { weekday: 'short' })}
                </p>
                <p className={`text-sm font-bold leading-tight ${day.isToday ? 'text-primary-400' : 'text-gray-300'}`}>
                  {day.dayNum}
                </p>
                {day.isToday && (
                  <p className="text-[8px] uppercase tracking-widest text-primary-500 font-semibold mt-0.5">Today</p>
                )}
              </div>
            ))}

            {habits.map((habit) => (
              <>
                <motion.div key={`${habit.id}-name`} layout initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-1 px-1 min-w-0 overflow-hidden group">
                  {editingId === habit.id ? (
                    <input value={editName} onChange={e => setEditName(e.target.value)}
                      onBlur={() => handleRenameHabit(habit.id)} onKeyDown={e => { if (e.key === 'Enter') handleRenameHabit(habit.id); if (e.key === 'Escape') setEditingId(null); }}
                      className="w-full bg-surface-800 rounded px-2 py-1 text-sm font-semibold text-white outline-none border border-primary-500/30" autoFocus
                      onClick={e => e.stopPropagation()} />
                  ) : (
                    <p className="text-sm font-semibold text-gray-200 truncate flex-1">{habit.name}</p>
                  )}
                  <button onClick={() => { setEditingId(habit.id); setEditName(habit.name); }}
                    className="shrink-0 p-0.5 rounded text-gray-500 hover:text-primary-400 hover:bg-primary-500/10 transition-all">
                    <Pencil className="h-2.5 w-2.5" />
                  </button>
                  <button onClick={() => handleDeleteHabit(habit.id)}
                    className="shrink-0 p-0.5 rounded text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all">
                    <Trash2 className="h-2.5 w-2.5" />
                  </button>
                </motion.div>
                {weekDays.map(day => {
                  const checked = habit.days?.[day.key] || false;
                  const isToday = day.isToday;
                  return (
                    <motion.div key={`${habit.id}-${day.key}`} layout initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                      className="flex justify-center">
                      <button
                        onClick={() => handleToggleDay(habit.id, day.key)}
                        disabled={!isToday}
                        className={`w-7 h-7 rounded-md flex items-center justify-center transition-all duration-200
                          ${checked && isToday
                            ? 'bg-primary-500 text-white shadow-sm shadow-primary-500/20'
                            : checked && !isToday
                              ? 'bg-primary-500/20 text-primary-400/70'
                              : isToday
                                ? 'bg-surface-800 border border-dashed border-primary-500/40 hover:bg-surface-700 hover:border-primary-500/60'
                                : 'bg-surface-800 cursor-not-allowed opacity-60'
                          }`}
                      >
                        {checked
                          ? <CheckCircle2 className={`h-3 w-3 ${isToday ? '' : 'text-primary-400/60'}`} />
                          : <Circle className={`h-3 w-3 ${isToday ? 'text-primary-500/30' : 'text-gray-700'}`} />
                        }
                      </button>
                    </motion.div>
                  );
                })}
              </>
            ))}
          </div>


          <div className="sm:hidden space-y-2">
            {habits.map((habit) => (
              <motion.div key={habit.id} layout initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                className="bg-surface-800/60 border border-surface-700/40 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-white truncate pr-2">{habit.name}</p>
                  <button onClick={() => handleDeleteHabit(habit.id)}
                    className="shrink-0 p-1 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  {weekDays.map(day => {
                    const checked = habit.days?.[day.key] || false;
                    const isToday = day.isToday;
                    return (
                      <div key={day.key} className={`flex flex-col items-center gap-1.5 ${isToday ? 'relative' : ''}`}>
                        <span className={`text-[9px] font-medium ${isToday ? 'text-primary-400' : 'text-gray-500'}`}>
                          {day.date.toLocaleDateString('en-US', { weekday: 'narrow' })}
                        </span>
                        <button
                          onClick={() => handleToggleDay(habit.id, day.key)}
                          disabled={!isToday}
                          className={`w-6 h-6 rounded-md flex items-center justify-center transition-all duration-200
                            ${checked && isToday
                              ? 'bg-primary-500 text-white shadow-sm shadow-primary-500/30'
                              : checked && !isToday
                                ? 'bg-primary-500/20 text-primary-400/70'
                                : isToday
                                  ? 'bg-surface-700 border border-dashed border-primary-500/40'
                                  : 'bg-surface-700 cursor-not-allowed opacity-60'
                            }`}
                        >
                          {checked
                            ? <CheckCircle2 className={`h-3 w-3 ${isToday ? '' : 'text-primary-400/60'}`} />
                            : <Circle className={`h-3 w-3 ${isToday ? 'text-primary-500/40' : 'text-gray-700'}`} />
                          }
                        </button>
                        {isToday && (
                          <span className="text-[7px] uppercase tracking-widest text-primary-500 font-semibold">Today</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}

      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Habit">
        <form onSubmit={e => { e.preventDefault(); handleAddHabit(); }} className="space-y-4">
          <Input label="Habit Name" placeholder="e.g., Read 30 minutes, Meditate, Exercise..." value={newHabitName}
            onChange={e => setNewHabitName(e.target.value)} autoFocus />
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button type="submit" loading={adding} disabled={!newHabitName.trim()}>Add Habit</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default HabitsPanel;
