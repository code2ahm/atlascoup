import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Circle, CheckCircle2, ChevronLeft, ChevronRight, ListChecks, Clock, Play, Pause, RotateCcw, Repeat, X } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useTasksStore from '../../store/tasksStore';
import { formatDateKey } from '../../lib/utils';
import { useToast } from '../../components/ui/Toast';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { LoadingSkeleton } from '../../components/ui/LoadingSpinner';

import useTimerStore from '../../store/timerStore';
import { Volume2, VolumeX } from 'lucide-react';

function formatTime(m) {
  if (!m || m <= 0) return '';
  if (m < 1) return `${Math.round(m * 60)}s`;
  const h = Math.floor(m / 60);
  const mins = Math.round(m % 60);
  if (h > 0) return mins > 0 ? `${h}h ${mins}m` : `${h}h`;
  return `${mins}m`;
}

let finishAudio = null;

function playStartSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    const now = ctx.currentTime;
    [523.25, 659.25].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(freq, now + i * 0.12);
      gain.gain.setValueAtTime(0.2, now + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.18);
      osc.start(now + i * 0.12);
      osc.stop(now + i * 0.12 + 0.2);
    });
  } catch {}
}

function startFinishBeep() {
  stopFinishBeep();
  try {
    if (!finishAudio) {
      finishAudio = new Audio('/beep.mp3');
      finishAudio.loop = true;
      finishAudio.volume = 0.5;
    }
    finishAudio.currentTime = 0;
    finishAudio.play().catch(() => {});
  } catch {}
}

function stopFinishBeep() {
  if (finishAudio) {
    finishAudio.pause();
    finishAudio.currentTime = 0;
  }
}

function TaskTimerRing({ onClose }) {
  const { task, totalSecs, startedAt, pausedAt, done, start, pause, resume, reset, stop, getRemaining } = useTimerStore();
  const [_, forceUpdate] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem('timerSound') !== 'false');
  const timerRef = useRef(null);
  const prevStartedRef = useRef(startedAt);
  const prevDoneRef = useRef(done);
  const radius = 72;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    if (done) return;
    timerRef.current = setInterval(() => {
      const store = useTimerStore.getState();
      store.tick();
      forceUpdate(n => n + 1);
    }, 200);
    return () => clearInterval(timerRef.current);
  }, [done]);

  useEffect(() => {
    if (done && !prevDoneRef.current) {
      if (soundEnabled) startFinishBeep();
    }
    prevDoneRef.current = done;
    return () => { if (done) stopFinishBeep(); };
  }, [done, soundEnabled]);

  useEffect(() => {
    localStorage.setItem('timerSound', soundEnabled);
  }, [soundEnabled]);

  useEffect(() => {
    if (startedAt && !prevStartedRef.current) playStartSound();
    prevStartedRef.current = startedAt;
  }, [startedAt]);

  const handleDismiss = () => {
    stopFinishBeep();
    onClose();
  };

  if (!task) return null;

  const remaining = getRemaining();
  const progress = totalSecs > 0 ? remaining / totalSecs : 0;
  const dashOffset = circumference * (1 - progress);
  const mins = Math.floor(remaining / 60);
  const secs = Math.floor(remaining % 60);
  const running = !!startedAt && !pausedAt && !done;
  const isLow = !done && remaining > 0 && progress < 0.2;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md" onClick={handleDismiss}>
      <div className="bg-surface-900/90 rounded-3xl p-10 border border-surface-700/40 shadow-2xl max-w-sm w-full mx-4 backdrop-blur-xl"
        onClick={e => e.stopPropagation()}>

        <div className="flex items-start justify-between mb-6">
          <div className="flex flex-col min-w-0 flex-1 text-center">
            <p className="text-lg font-semibold text-white/90 truncate">{task.name}</p>
            {task.timeMin && <span className="text-xs text-gray-500 mt-0.5">{formatTime(task.timeMin)}</span>}
          </div>
          <div className="flex items-center gap-1">
            <button onClick={e => { e.stopPropagation(); setSoundEnabled(v => !v); }} title={soundEnabled ? 'Mute alarm' : 'Enable alarm'}
              className={`p-1.5 rounded-lg transition-all shrink-0 ${soundEnabled ? 'text-gray-400 hover:text-white hover:bg-surface-700/60' : 'text-gray-600 hover:text-gray-400'}`}>
              {soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
            </button>
            <button onClick={handleDismiss} className="p-1 rounded-lg text-gray-500 hover:text-white hover:bg-surface-700/60 transition-all shrink-0">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center gap-5">
          <div className="relative">
            <svg width="200" height="200" className="transform -rotate-90">
              <defs>
                <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4facfe" />
                  <stop offset="100%" stopColor="#2563eb" />
                </linearGradient>
                <linearGradient id="ringGradientLow" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f97316" />
                  <stop offset="100%" stopColor="#dc2626" />
                </linearGradient>
                <linearGradient id="ringGradientDone" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#22c55e" />
                  <stop offset="100%" stopColor="#16a34a" />
                </linearGradient>
              </defs>
              <circle cx="100" cy="100" r={radius} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="8" />
              <circle cx="100" cy="100" r={radius} fill="none"
                stroke={done ? "url(#ringGradientDone)" : isLow ? "url(#ringGradientLow)" : "url(#ringGradient)"}
                strokeWidth="8" strokeLinecap="round"
                strokeDasharray={circumference} strokeDashoffset={dashOffset}
                className="transition-all duration-500 ease-linear" />
              <circle cx="100" cy="100" r={radius} fill="none"
                stroke={done ? "#22c55e" : isLow ? "#f97316" : "#4facfe"}
                strokeWidth="8" strokeLinecap="round"
                strokeDasharray={circumference} strokeDashoffset={dashOffset}
                className="transition-all duration-500 ease-linear"
                style={{ filter: 'blur(6px)', opacity: 0.3 }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {done ? (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="flex flex-col items-center gap-1">
                  <CheckCircle2 className="h-10 w-10 text-green-400" />
                  <span className="text-3xl font-bold text-green-400 tracking-tight mt-0.5">Done!</span>
                  <span className="text-xs text-gray-500 mt-1">{formatTime(task.timeMin || 25)}</span>
                </motion.div>
              ) : (
                <motion.div key={remaining} className="flex flex-col items-center">
                  <span className={`text-4xl font-bold tabular-nums tracking-tight transition-colors duration-500 ${isLow ? 'text-orange-400' : 'text-white'}`}>
                    {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
                  </span>
                  <span className="text-xs text-gray-500 mt-1.5">{formatTime(task.timeMin || 25)}</span>
                </motion.div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {done ? (
              <motion.button onClick={handleDismiss} initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                className="w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 flex items-center justify-center transition-all active:scale-95 shadow-lg shadow-green-500/30 hover:shadow-green-500/50">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </motion.button>
            ) : (
              <>
                <motion.button onClick={running ? pause : resume} whileTap={{ scale: 0.9 }}
                  className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-blue-600 hover:from-primary-400 hover:to-blue-500 flex items-center justify-center transition-all shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50">
                  {running ? <Pause className="h-6 w-6 text-white" /> : <Play className="h-6 w-6 text-white ml-0.5" />}
                </motion.button>
                <button onClick={reset}
                  className="w-11 h-11 rounded-full bg-surface-800 hover:bg-surface-700 flex items-center justify-center transition-all active:scale-90 border border-surface-600/30">
                  <RotateCcw className="h-4 w-4 text-gray-400" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TasksPanel() {
  const { user } = useAuthStore();
  const subscribeTasks = useTasksStore(s => s.subscribeTasks);
  const { tasks, loading, addTask, toggleTask, deleteTask, updateTask } = useTasksStore();
  const toast = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskTime, setNewTaskTime] = useState(25);
  const [newTaskHrs, setNewTaskHrs] = useState(0);
  const [newTaskMins, setNewTaskMins] = useState(25);
  const [newTaskSecs, setNewTaskSecs] = useState(0);
  const [newTaskRepeat, setNewTaskRepeat] = useState(false);
  const [showCustomTime, setShowCustomTime] = useState(false);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  const dateKey = formatDateKey(currentDate);
  const dateStr = currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const isToday = formatDateKey(new Date()) === dateKey;

  useEffect(() => {
    if (user) {
      const unsub = subscribeTasks(user.uid, currentDate);
      return () => unsub();
    }
  }, [user, dateKey]);

  const handlePrevDay = () => { const d = new Date(currentDate); d.setDate(d.getDate() - 1); setCurrentDate(d); };
  const handleNextDay = () => { const d = new Date(currentDate); d.setDate(d.getDate() + 1); setCurrentDate(d); };
  const handleToday = () => setCurrentDate(new Date());

  const handleAddTask = async () => {
    if (!newTaskName.trim()) return;
    if (tasks.length >= 20) {
      toast.error('Maximum 20 tasks per day. Complete or delete some to add more.');
      return;
    }
    setAdding(true);
    try {
      const totalTime = showCustomTime
        ? newTaskHrs * 60 + newTaskMins + newTaskSecs / 60
        : newTaskTime;
      await addTask(user.uid, { name: newTaskName.trim(), timeMin: Math.max(1 / 60, totalTime), repeatDaily: newTaskRepeat }, currentDate);
      setNewTaskName('');
      setNewTaskTime(25);
      setNewTaskHrs(0);
      setNewTaskMins(25);
      setNewTaskSecs(0);
      setShowCustomTime(false);
      setNewTaskRepeat(false);
      setShowAddModal(false);
      toast.success('Task added!');
    } catch { toast.error('Failed to add task'); }
    finally { setAdding(false); }
  };

  const handleToggle = async (taskId) => { await toggleTask(user.uid, taskId, currentDate); };
  const handleStartTimer = (task) => {
    useTimerStore.getState().start(task, dateKey, () => {
      const currentTask = useTasksStore.getState().tasks.find(t => t.id === task.id);
      if (currentTask && !currentTask.done) handleToggle(task.id);
    });
  };
  const handleDelete = async (taskId) => { await deleteTask(user.uid, taskId, currentDate); toast.success('Task deleted'); };

  const handleRename = async (taskId) => {
    if (editName.trim()) await updateTask(user.uid, taskId, { name: editName.trim() }, currentDate);
    setEditingId(null);
  };

  const doneTasks = tasks.filter(t => t.done);
  const pendingTasks = tasks.filter(t => !t.done);

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button onClick={handlePrevDay} disabled={isToday}
              className={`p-2 rounded-lg transition-colors ${isToday ? 'text-gray-700 cursor-not-allowed' : 'text-gray-400 hover:text-white hover:bg-surface-700'}`}>
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button onClick={handleToday} className={`text-sm font-semibold transition-colors ${isToday ? 'text-primary-400' : 'text-gray-300 hover:text-primary-400'}`}>
              {dateStr}
            </button>
            <button onClick={handleNextDay} className="p-2 rounded-lg hover:bg-surface-700 text-gray-400 hover:text-white transition-colors">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4" /> Add Task
          </Button>
        </div>

        {tasks.length > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-500">
              <span>{doneTasks.length} of {tasks.length} done</span>
              <span>{tasks.length > 0 ? Math.round((doneTasks.length / tasks.length) * 100) : 0}%</span>
            </div>
            <div className="h-1 bg-surface-700/50 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-500 ${doneTasks.length === tasks.length ? 'bg-green-500' : 'bg-gradient-to-r from-primary-500 to-blue-400'}`}
                style={{ width: `${tasks.length > 0 ? (doneTasks.length / tasks.length) * 100 : 0}%` }} />
            </div>
          </div>
        )}


        {loading ? (
          <div className="space-y-3 py-4">
            <div className="space-y-2">
              <LoadingSkeleton className="h-3 w-full max-w-[200px]" />
              <LoadingSkeleton className="h-1 w-full rounded-full" />
            </div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 bg-surface-800/50 rounded-xl px-4 py-3 border border-surface-700/30">
                <LoadingSkeleton className="h-5 w-5 rounded-full" />
                <div className="flex-1">
                  <LoadingSkeleton className="h-4 w-3/4" />
                </div>
                <LoadingSkeleton className="h-3.5 w-8" />
                <div className="flex gap-1">
                  <LoadingSkeleton className="h-7 w-7 rounded" />
                  <LoadingSkeleton className="h-7 w-7 rounded" />
                  <LoadingSkeleton className="h-7 w-7 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12">
            <ListChecks className="h-12 w-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 mb-4">No tasks for this day.</p>
            <Button onClick={() => setShowAddModal(true)}><Plus className="h-4 w-4" /> Add Task</Button>
          </div>
        ) : (
          <div className="space-y-1.5">
            {pendingTasks.map(task => (
              <motion.div key={task.id} layout initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 bg-surface-800/55 rounded-xl px-4 py-3 border-l-2 border-transparent hover:border-l-primary-500/40 border border-surface-700/30 group hover:border-surface-700 transition-all cursor-pointer"
                onClick={() => handleStartTimer(task)}>
                {isToday ? (
                  <button onClick={e => { e.stopPropagation(); handleToggle(task.id); }}
                    className="shrink-0 text-gray-500 hover:text-green-400 transition-colors">
                    <Circle className="h-5 w-5" />
                  </button>
                ) : (
                  <div className="shrink-0 text-gray-600" title="Can only complete tasks today">
                    <Circle className="h-5 w-5" />
                  </div>
                )}
                <div className="flex-1 min-w-0 flex items-center gap-3">
                  {editingId === task.id ? (
                    <input value={editName} onChange={e => setEditName(e.target.value)}
                      onBlur={() => handleRename(task.id)} onKeyDown={e => { if (e.key === 'Enter') handleRename(task.id); if (e.key === 'Escape') setEditingId(null); }}
                      className="w-full bg-surface-700 rounded px-2 py-1 text-sm text-white outline-none border border-primary-500/30" autoFocus
                      onClick={e => e.stopPropagation()} />
                  ) : (
                    <>
                      <div className="flex items-center gap-1.5 min-w-0">
                        {task.repeatDaily && <Repeat className="h-3 w-3 text-gray-600 shrink-0" />}
                        <p className="text-sm text-gray-200 truncate">{task.name}</p>
                      </div>
                      {task.timeMin && <span className="text-xs text-gray-500 tabular-nums shrink-0">{formatTime(task.timeMin)}</span>}
                    </>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={e => { e.stopPropagation(); handleStartTimer(task); }}
                    className="p-1.5 rounded text-gray-500 hover:text-primary-400 hover:bg-primary-500/10 transition-all">
                    <Clock className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={e => { e.stopPropagation(); setEditingId(task.id); setEditName(task.name); }}
                    className="p-1.5 rounded text-gray-500 hover:text-gray-300 hover:bg-surface-700 transition-all">
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button onClick={e => { e.stopPropagation(); handleDelete(task.id); }}
                    className="p-1.5 rounded text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}

            {doneTasks.map(task => (
              <motion.div key={task.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex items-center gap-3 bg-surface-800/20 rounded-xl px-4 py-2 border border-surface-700/10 group opacity-60 hover:opacity-100 transition-opacity">
                <button onClick={() => handleToggle(task.id)} className="shrink-0 text-green-400 hover:text-green-300 transition-colors">
                  <CheckCircle2 className="h-5 w-5" />
                </button>
                <p className="flex-1 text-sm text-gray-600 line-through truncate">{task.name}</p>
                {task.timeMin && <span className="text-xs text-gray-700 tabular-nums">{formatTime(task.timeMin)}</span>}
                <button onClick={() => handleDelete(task.id)}
                  className="p-1.5 rounded text-gray-600 hover:text-red-400 transition-all">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>


      <div className="space-y-6">
        {loading ? (
          <div className="border border-surface-700/30 rounded-xl p-5 space-y-4">
            <LoadingSkeleton className="h-4 w-28" />
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <LoadingSkeleton className="h-3 w-20" />
                <LoadingSkeleton className="h-4 w-10" />
              </div>
            ))}
          </div>
        ) : (
        <Card>
          <CardHeader><CardTitle className="text-sm">Today's Summary</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Total tasks</span>
              <span className="text-white font-medium">{tasks.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Completed</span>
              <Badge color="green">{doneTasks.length}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Pending</span>
              <Badge color="yellow">{pendingTasks.length}</Badge>
            </div>
            <div className="border-t-[0.5px] border-surface-700/30 pt-3 flex justify-between">
              <span className="text-gray-400">Est. time</span>
              <span className="text-white font-medium tabular-nums">
                {formatTime(tasks.reduce((s, t) => s + (t.timeMin || 0), 0))}
              </span>
            </div>
          </CardContent>
        </Card>
        )}
      </div>


      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Task" size="sm">
        <form onSubmit={e => { e.preventDefault(); handleAddTask(); }} className="space-y-4">
          <Input label="Task Name" placeholder="What do you need to do?" value={newTaskName} onChange={e => setNewTaskName(e.target.value)} autoFocus />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Est. Time</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {[15, 20, 30, 45, 60, 120].map(m => (
                <button key={m} type="button" onClick={() => { setNewTaskTime(m); setShowCustomTime(false); }}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${!showCustomTime && newTaskTime === m ? 'bg-primary-500/20 text-primary-400 border-primary-500/30' : 'text-gray-400 border-surface-600 hover:border-surface-500 hover:text-gray-200'}`}>
                  {m >= 60 ? `${m / 60}h` : `${m}m`}
                </button>
              ))}
              <button type="button" onClick={() => setShowCustomTime(true)}
                className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${showCustomTime ? 'bg-primary-500/20 text-primary-400 border-primary-500/30' : 'text-gray-400 border-surface-600 hover:border-surface-500 hover:text-gray-200'}`}>
                Custom
              </button>
            </div>
            {showCustomTime ? (
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] text-gray-500 mb-1 text-center">Hours</label>
                  <input type="text" inputMode="numeric" value={newTaskHrs || ''}
                    onChange={e => setNewTaskHrs(Math.min(99, parseInt(e.target.value) || 0))}
                    className="w-full rounded-lg border border-surface-600 bg-surface-900/50 px-2 py-2 text-sm text-gray-100 outline-none focus:border-primary-500 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="0" />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 mb-1 text-center">Minutes</label>
                  <input type="text" inputMode="numeric" value={newTaskMins || ''}
                    onChange={e => setNewTaskMins(Math.min(59, parseInt(e.target.value) || 0))}
                    className="w-full rounded-lg border border-surface-600 bg-surface-900/50 px-2 py-2 text-sm text-gray-100 outline-none focus:border-primary-500 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="0" />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 mb-1 text-center">Seconds</label>
                  <input type="text" inputMode="numeric" value={newTaskSecs || ''}
                    onChange={e => setNewTaskSecs(Math.min(59, parseInt(e.target.value) || 0))}
                    className="w-full rounded-lg border border-surface-600 bg-surface-900/50 px-2 py-2 text-sm text-gray-100 outline-none focus:border-primary-500 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="0" />
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-600 italic">or tap <span className="not-italic text-primary-400">Custom</span> for hrs / mins / secs</p>
            )}
          </div>

          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div className={`relative w-9 h-5 rounded-full transition-colors ${newTaskRepeat ? 'bg-primary-500' : 'bg-surface-700'}`}>
              <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${newTaskRepeat ? 'translate-x-4' : ''}`} />
            </div>
            <input type="checkbox" checked={newTaskRepeat} onChange={e => setNewTaskRepeat(e.target.checked)} className="sr-only" />
            <div className="flex items-center gap-1.5">
              <Repeat className="h-3.5 w-3.5 text-gray-500" />
              <span className="text-sm text-gray-300">Repeat daily</span>
            </div>
          </label>

          <div className="flex justify-end gap-3 pt-1">
            <Button variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button type="submit" loading={adding} disabled={!newTaskName.trim()}>Add Task</Button>
          </div>
        </form>
      </Modal>


    </div>
  );
}

export default TasksPanel;
export { TaskTimerRing };
