import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, BookOpen, Smile, Meh, Frown, Angry, Heart, Sparkles, Search } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useJournalStore from '../../store/journalStore';
import { formatDateKey } from '../../lib/utils';
import { useToast } from '../../components/ui/Toast';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { LoadingSkeleton } from '../../components/ui/LoadingSpinner';

const moods = [
  { value: 'amazing', label: 'Amazing', icon: Sparkles, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20', fill: 'bg-yellow-500' },
  { value: 'good', label: 'Good', icon: Smile, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20', fill: 'bg-green-500' },
  { value: 'neutral', label: 'Okay', icon: Meh, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', fill: 'bg-blue-500' },
  { value: 'bad', label: 'Bad', icon: Frown, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20', fill: 'bg-orange-500' },
  { value: 'awful', label: 'Awful', icon: Angry, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', fill: 'bg-red-500' },
];

const filterMoods = [
  { value: null, label: 'All', icon: BookOpen },
  ...moods.map(m => ({ value: m.value, label: m.label, icon: m.icon })),
];

function JournalPanel() {
  const { user } = useAuthStore();
  const subscribeJournal = useJournalStore(s => s.subscribeJournal);
  const { entries, loading, addEntry, deleteEntry } = useJournalStore();
  const toast = useToast();
  const [showAddModal, setShowAddModal] = useState(false);
  const [entryText, setEntryText] = useState('');
  const [entryMood, setEntryMood] = useState('neutral');
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState('');
  const [filterMood, setFilterMood] = useState(null);

  useEffect(() => {
    if (user) {
      const unsub = subscribeJournal(user.uid);
      return () => unsub();
    }
  }, [user]);

  const handleAddEntry = async () => {
    if (!entryText.trim()) return;
    const todayKey = formatDateKey(new Date());
    if (entries.some(e => e.dateKey === todayKey)) {
      toast.info('You can only write one journal entry per day.');
      return;
    }
    setAdding(true);
    try {
      await addEntry(user.uid, { text: entryText.trim(), mood: entryMood, dateKey: todayKey });
      setEntryText('');
      setEntryMood('neutral');
      setShowAddModal(false);
      toast.success('Journal entry saved!');
    } catch { toast.error('Failed to save entry'); }
    finally { setAdding(false); }
  };

  const handleDeleteEntry = async (entryId) => {
    await deleteEntry(user.uid, entryId);
    toast.success('Entry deleted');
  };

  const getMoodColor = (mood) => moods.find(m => m.value === mood)?.color || 'text-gray-400';

  const filteredEntries = useMemo(() => {
    let result = entries;
    if (filterMood) {
      result = result.filter(e => e.mood === filterMood);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(e => e.text?.toLowerCase().includes(q));
    }
    return result;
  }, [entries, search, filterMood]);

  const todayKey = formatDateKey(new Date());
  const todayHasEntry = entries.some(e => e.dateKey === todayKey);

  const streakCount = useMemo(() => {
    let count = 0;
    const d = new Date();
    for (let i = 0; i < 365; i++) {
      const key = formatDateKey(d);
      if (entries.some(e => e.dateKey === key)) {
        count++;
        d.setDate(d.getDate() - 1);
      } else break;
    }
    return count;
  }, [entries]);

  const moodCounts = useMemo(() => {
    return moods.map(m => ({
      ...m,
      count: entries.filter(e => e.mood === m.value).length,
      pct: entries.length > 0 ? Math.round((entries.filter(e => e.mood === m.value).length / entries.length) * 100) : 0,
    }));
  }, [entries]);

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500 pointer-events-none" />
              <input type="text" placeholder="Search..." value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full sm:w-44 rounded-lg border border-surface-600 bg-surface-900/50 pl-8 pr-3 py-2 text-xs text-gray-100 placeholder:text-gray-500 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50" />
            </div>
          </div>
          <Button onClick={() => setShowAddModal(true)} disabled={todayHasEntry} size="sm">
            <Plus className="h-3.5 w-3.5" /> {todayHasEntry ? 'Already wrote today' : 'New Entry'}
          </Button>
        </div>

        <div className="flex flex-wrap gap-1">
          {filterMoods.map(fm => {
            const Icon = fm.icon;
            const active = filterMood === fm.value;
            const mood = moods.find(m => m.value === fm.value);
            return (
              <button key={fm.value ?? 'all'} onClick={() => setFilterMood(fm.value)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs border transition-colors ${active ? (mood ? `${mood.bg} ${mood.color}` : 'bg-primary-500/20 text-primary-400 border-primary-500/30') : 'border-surface-600 text-gray-500 hover:border-surface-500 hover:text-gray-300'}`}>
                <Icon className={`h-3.5 w-3.5 ${active && mood ? mood.color : ''}`} />
                {fm.label}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="space-y-3 py-4">
            <div className="flex items-center gap-3">
              <LoadingSkeleton className="h-8 w-44 rounded-lg" />
              <LoadingSkeleton className="h-8 w-24 rounded-lg" />
            </div>
            <div className="flex gap-1.5">
              {[...Array(4)].map((_, i) => <LoadingSkeleton key={i} className="h-7 w-16 rounded-lg" />)}
            </div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-surface-800/50 rounded-xl p-4 border border-surface-700/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <LoadingSkeleton className="h-4 w-4 rounded" />
                    <LoadingSkeleton className="h-3 w-28" />
                  </div>
                  <LoadingSkeleton className="h-6 w-6 rounded" />
                </div>
                <LoadingSkeleton className="h-3 w-full" />
                <LoadingSkeleton className="h-3 w-4/6" />
              </div>
            ))}
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-10 w-10 text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-400 mb-4">
              {search || filterMood ? 'No entries match your filters.' : 'No journal entries yet. Start writing!'}
            </p>
            {!search && !filterMood && <Button onClick={() => setShowAddModal(true)} size="sm"><Plus className="h-3.5 w-3.5" /> First Entry</Button>}
          </div>
        ) : (
          <div className="space-y-2.5">
            <AnimatePresence>
              {filteredEntries.map(entry => {
                const date = entry.createdAt?.toDate ? entry.createdAt.toDate() : new Date(entry.createdAt || entry.dateKey);
                const mood = moods.find(m => m.value === entry.mood);
                const MoodIcon = mood?.icon;
                return (
                  <motion.div key={entry.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
                    className="bg-surface-800/50 rounded-xl p-4 border border-surface-700/30 group hover:border-surface-700 transition-colors">
                    <div className="flex items-start justify-between mb-2.5">
                      <div className="flex items-center gap-2">
                        {MoodIcon && <MoodIcon className={`h-4 w-4 ${mood?.color || 'text-gray-500'}`} />}
                        <span className="text-[11px] text-gray-500">
                          {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <button onClick={() => handleDeleteEntry(entry.id)}
                        className="p-1 rounded text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">{entry.text}</p>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {loading ? (
          <>
            <div className="border border-surface-700/30 rounded-xl p-5 text-center space-y-3">
              <LoadingSkeleton className="h-8 w-8 rounded mx-auto" />
              <LoadingSkeleton className="h-7 w-12 mx-auto" />
              <LoadingSkeleton className="h-3 w-16 mx-auto" />
            </div>
            <div className="border border-surface-700/30 rounded-xl p-5 space-y-3">
              <LoadingSkeleton className="h-4 w-28" />
              {[...Array(5)].map((_, j) => (
                <div key={j} className="flex items-center gap-2">
                  <LoadingSkeleton className="h-4 w-4 rounded" />
                  <div className="flex-1 space-y-1">
                    <LoadingSkeleton className="h-2.5 w-full" />
                    <LoadingSkeleton className="h-1.5 w-full rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
        <>
        <Card glass>
          <CardContent className="p-5 text-center">
            <Heart className="h-8 w-8 text-primary-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{streakCount}</p>
            <p className="text-xs text-gray-400">Day streak</p>
            {todayHasEntry && <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium mt-2 bg-green-500/10 text-green-400 border border-green-500/20">Written today</span>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Mood Distribution</CardTitle></CardHeader>
          <CardContent>
            {entries.length === 0 ? (
              <p className="text-sm text-gray-500">No data yet</p>
            ) : (
              <div className="space-y-3">
                {moodCounts.map(m => {
                  const Icon = m.icon;
                  return (
                    <div key={m.value} className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${m.color} shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-gray-400">{m.label}</span>
                          <span className="text-gray-500">{m.count}</span>
                        </div>
                        <div className="h-1 bg-surface-700 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${m.fill}`} style={{ width: `${m.pct}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
        </>
        )}
      </div>

      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="New Journal Entry" size="lg">
        <form onSubmit={e => { e.preventDefault(); handleAddEntry(); }} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-300">How are you feeling?</label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
              {moods.map(m => {
                const Icon = m.icon;
                const selected = entryMood === m.value;
                return (
                  <button key={m.value} type="button" onClick={() => setEntryMood(m.value)}
                    className={`flex flex-col items-center gap-1 px-2 sm:px-3 py-2.5 rounded-lg border transition-all ${selected ? `${m.bg} ${m.color}` : 'border-surface-600 text-gray-500 hover:border-surface-500'}`}>
                    <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${selected ? m.color : ''}`} />
                    <span className="text-[10px] sm:text-xs leading-tight">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-300">What's on your mind?</label>
            <textarea value={entryText}
              onChange={e => setEntryText(e.target.value)}
              rows={5} placeholder="Write your thoughts..."
              className="w-full rounded-lg border border-surface-600 bg-surface-900/50 px-3 py-2.5 text-sm text-gray-100 placeholder:text-gray-500 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50 resize-none"
              autoFocus />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button type="submit" loading={adding} disabled={!entryText.trim()}>Save Entry</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default JournalPanel;
