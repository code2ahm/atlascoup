import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, BookOpen, Smile, Meh, Frown, Angry, Heart, Sparkles } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useJournalStore from '../../store/journalStore';
import { formatDateKey } from '../../lib/utils';
import { useToast } from '../../components/ui/Toast';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

const moods = [
  { value: 'amazing', label: 'Amazing', icon: Sparkles, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
  { value: 'good', label: 'Good', icon: Smile, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
  { value: 'neutral', label: 'Okay', icon: Meh, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  { value: 'bad', label: 'Bad', icon: Frown, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
  { value: 'awful', label: 'Awful', icon: Angry, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
];

function JournalPanel() {
  const { user } = useAuthStore();
  const { entries, loading, fetchEntries, addEntry, deleteEntry } = useJournalStore();
  const toast = useToast();
  const [showAddModal, setShowAddModal] = useState(false);
  const [entryText, setEntryText] = useState('');
  const [entryMood, setEntryMood] = useState('neutral');
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => { if (user) fetchEntries(user.uid); }, [user]);

  const handleAddEntry = async () => {
    if (!entryText.trim()) return;
    setAdding(true);
    try {
      await addEntry(user.uid, { text: entryText.trim(), mood: entryMood, dateKey: formatDateKey(new Date()) });
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

  const getMoodIcon = (mood) => {
    const m = moods.find(m => m.value === mood);
    if (!m) return null;
    const Icon = m.icon;
    return <Icon className={`h-4 w-4 ${m.color}`} />;
  };

  const getMoodLabel = (mood) => moods.find(m => m.value === mood)?.label || mood;

  const filteredEntries = useMemo(() => {
    if (!search.trim()) return entries;
    const q = search.toLowerCase();
    return entries.filter(e =>
      e.text?.toLowerCase().includes(q) ||
      getMoodLabel(e.mood).toLowerCase().includes(q)
    );
  }, [entries, search]);

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

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search entries..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-48 rounded-lg border border-surface-600 bg-surface-900/50 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50"
            />
          </div>
          <Button onClick={() => setShowAddModal(true)} disabled={todayHasEntry}>
            <Plus className="h-4 w-4" /> {todayHasEntry ? 'Already wrote today' : 'New Entry'}
          </Button>
        </div>


        {loading ? (
          <div className="flex justify-center py-12"><LoadingSpinner /></div>
        ) : filteredEntries.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 mb-4">
              {search ? 'No entries match your search.' : 'No journal entries yet. Start writing!'}
            </p>
            {!search && <Button onClick={() => setShowAddModal(true)}><Plus className="h-4 w-4" /> First Entry</Button>}
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filteredEntries.map(entry => {
                const date = entry.createdAt?.toDate ? entry.createdAt.toDate() : new Date(entry.createdAt || entry.dateKey);
                return (
                  <motion.div key={entry.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
                    className="bg-surface-800/50 rounded-xl p-5 border border-surface-700/30 group hover:border-surface-700 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getMoodIcon(entry.mood)}
                        <span className="text-xs text-gray-500">
                          {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <button onClick={() => handleDeleteEntry(entry.id)}
                        className="p-1.5 rounded text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
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


      <div className="space-y-6">
        <Card glass>
          <CardContent className="p-5 text-center">
            <Heart className="h-8 w-8 text-primary-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{streakCount}</p>
            <p className="text-xs text-gray-400">Day streak</p>
            {todayHasEntry && <Badge className="mt-2 bg-green-500/10 text-green-400 border-green-500/20">Written today</Badge>}
          </CardContent>
        </Card>


        <Card>
          <CardHeader><CardTitle className="text-sm">Mood Distribution</CardTitle></CardHeader>
          <CardContent>
            {entries.length === 0 ? (
              <p className="text-sm text-gray-500">No data yet</p>
            ) : (
              <div className="space-y-2">
                {moods.map(m => {
                  const count = entries.filter(e => e.mood === m.value).length;
                  const pct = entries.length > 0 ? Math.round((count / entries.length) * 100) : 0;
                  const Icon = m.icon;
                  return (
                    <div key={m.value} className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${m.color}`} />
                      <div className="flex-1">
                        <div className="flex justify-between text-xs mb-0.5">
                          <span className="text-gray-400">{m.label}</span>
                          <span className="text-gray-500">{count}</span>
                        </div>
                        <div className="h-1.5 bg-surface-700 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${m.bg.split(' ')[0]}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Total Entries</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-white">{entries.length}</p>
          </CardContent>
        </Card>
      </div>


      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="New Journal Entry" size="lg">
        <form onSubmit={e => { e.preventDefault(); handleAddEntry(); }} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-300">How are you feeling?</label>
            <div className="flex gap-2">
              {moods.map(m => {
                const Icon = m.icon;
                const selected = entryMood === m.value;
                return (
                  <button key={m.value} type="button" onClick={() => setEntryMood(m.value)}
                    className={`flex flex-col items-center gap-1 px-4 py-3 rounded-lg border transition-all ${selected ? `${m.bg} ${m.color}` : 'border-surface-600 text-gray-500 hover:border-surface-500'}`}>
                    <Icon className={`h-5 w-5 ${selected ? m.color : ''}`} />
                    <span className="text-xs">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-300">What's on your mind?</label>
            <textarea
              value={entryText}
              onChange={e => setEntryText(e.target.value)}
              rows={6}
              placeholder="Write your thoughts..."
              className="w-full rounded-lg border border-surface-600 bg-surface-900/50 px-3 py-2.5 text-sm text-gray-100 placeholder:text-gray-500 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50 resize-none"
              autoFocus
            />
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

function Badge({ className, children }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className || ''}`}>{children}</span>;
}

export default JournalPanel;
