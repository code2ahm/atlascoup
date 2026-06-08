import { create } from 'zustand';
import * as habitsService from '../services/habits';

const useHabitsStore = create((set, get) => ({
  habits: [],
  loading: false,
  error: null,

  fetchHabits: async (uid, date) => {
    set({ loading: true, error: null });
    try {
      const habits = await habitsService.getHabits(uid, date);
      set({ habits, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  addHabit: async (uid, name, date) => {
    const habit = await habitsService.addHabit(uid, name, get().habits.length, date);
    set(state => ({ habits: [...state.habits, habit] }));
    return habit;
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
