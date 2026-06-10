import { create } from 'zustand';
import * as journalService from '../services/journal';

const useJournalStore = create((set, get) => ({
  entries: [],
  loading: false,
  error: null,
  _unsubJournal: null,

  fetchEntries: async (uid) => {
    set({ loading: true, error: null });
    try {
      const entries = await journalService.getJournalEntries(uid);
      set({ entries, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  subscribeJournal: (uid) => {
    set({ loading: true, error: null });
    get()._unsubJournal?.();
    const unsub = journalService.subscribeJournal(uid, (entries) => {
      set({ entries, loading: false });
    }, (err) => {
      set({ error: err.message, loading: false });
    });
    set({ _unsubJournal: unsub });
    return unsub;
  },

  unsubscribeJournal: () => {
    get()._unsubJournal?.();
    set({ _unsubJournal: null });
  },

  addEntry: async (uid, { text, mood, dateKey }) => {
    await journalService.addJournalEntry(uid, { text, mood, dateKey });
  },

  deleteEntry: async (uid, entryId) => {
    await journalService.deleteJournalEntry(uid, entryId);
    set(state => ({
      entries: state.entries.filter(e => e.id !== entryId),
    }));
  },
}));

export default useJournalStore;
