import { create } from 'zustand';
import * as journalService from '../services/journal';

const useJournalStore = create((set, get) => ({
  entries: [],
  loading: false,
  error: null,

  fetchEntries: async (uid) => {
    set({ loading: true, error: null });
    try {
      const entries = await journalService.getJournalEntries(uid);
      set({ entries, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  addEntry: async (uid, { text, mood, dateKey }) => {
    const entry = await journalService.addJournalEntry(uid, { text, mood, dateKey });
    set(state => ({ entries: [entry, ...state.entries] }));
    return entry;
  },

  deleteEntry: async (uid, entryId) => {
    await journalService.deleteJournalEntry(uid, entryId);
    set(state => ({
      entries: state.entries.filter(e => e.id !== entryId),
    }));
  },
}));

export default useJournalStore;
