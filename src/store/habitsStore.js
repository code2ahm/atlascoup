import { create } from 'zustand';
import * as habitsService from '../services/habits';
import { getMonthId } from '../lib/utils';

const useHabitsStore = create((set, get) => ({
  habits: [],
  loading: false,
  error: null,
  _unsubHabits: null,

  fetchHabits: async (uid, date) => {
    set({ loading: true, error: null });
    try {
      const habits = await habitsService.getHabits(uid, date);
      set({ habits, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  subscribeHabits: (uid, date) => {
    set({ loading: true, error: null });
    get()._unsubHabits?.();
    let fallbackDone = false;
    const unsub = habitsService.subscribeHabits(uid, date, (habits) => {
      set({ habits, loading: false });
      if (habits.length === 0 && !fallbackDone) {
        fallbackDone = true;
        const prevDate = new Date(date);
        prevDate.setMonth(prevDate.getMonth() - 1);
        habitsService.copyRepeatableHabits(uid, getMonthId(prevDate), getMonthId(date), date).then(copied => {
          if (copied > 0) {
            get()._unsubHabits?.();
            const newUnsub = habitsService.subscribeHabits(uid, date, (newHabits) => {
              set({ habits: newHabits, loading: false });
            });
            set({ _unsubHabits: newUnsub });
          }
        });
      }
    }, (err) => {
      set({ error: err.message, loading: false });
    });
    set({ _unsubHabits: unsub });
    return unsub;
  },

  unsubscribeHabits: () => {
    get()._unsubHabits?.();
    set({ _unsubHabits: null });
  },

  addHabit: async (uid, name, repeatDaily, date) => {
    await habitsService.addHabit(uid, name, repeatDaily, get().habits.length, date);
  },

  updateHabit: async (uid, habitId, data, date) => {
    await habitsService.updateHabit(uid, habitId, data, date);
    set(state => ({
      habits: state.habits.map(h => h.id === habitId ? { ...h, ...data } : h),
    }));
  },

  deleteHabit: async (uid, habitId, date) => {
    await habitsService.deleteHabit(uid, habitId, date);
    set(state => ({
      habits: state.habits.filter(h => h.id !== habitId),
    }));
  },

  reorderHabits: async (uid, date, orderedIds) => {
    const { habits } = get();
    const updates = orderedIds.map((id, i) => ({ id, order: i }));
    await habitsService.batchUpdateOrder(uid, date, updates);
    set(state => {
      const updated = state.habits.map(h => {
        const match = updates.find(u => u.id === h.id);
        return match ? { ...h, order: match.order } : h;
      });
      updated.sort((a, b) => a.order - b.order);
      return { habits: updated };
    });
  },

  toggleDay: async (uid, habitId, day, value, date) => {
    await habitsService.toggleHabitDay(uid, habitId, day, value, date);
    set(state => ({
      habits: state.habits.map(h => {
        if (h.id !== habitId) return h;
        const days = { ...h.days, [day]: value };
        if (!value) delete days[day];
        return { ...h, days };
      }),
    }));
  },
}));

export default useHabitsStore;
