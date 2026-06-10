import { create } from 'zustand';
import * as goalsService from '../services/goals';

const useGoalsStore = create((set, get) => ({
  goals: [],
  loading: false,
  error: null,
  _unsubGoals: null,

  fetchGoals: async (uid) => {
    set({ loading: true, error: null });
    try {
      const goals = await goalsService.getGoals(uid);
      set({ goals, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  subscribeGoals: (uid) => {
    set({ loading: true, error: null });
    get()._unsubGoals?.();
    const unsub = goalsService.subscribeGoals(uid, (goals) => {
      set({ goals, loading: false });
    }, (err) => {
      set({ error: err.message, loading: false });
    });
    set({ _unsubGoals: unsub });
    return unsub;
  },

  unsubscribeGoals: () => {
    get()._unsubGoals?.();
    set({ _unsubGoals: null });
  },

  addGoal: async (uid, goalData) => {
    await goalsService.addGoal(uid, goalData);
  },

  updateGoal: async (uid, goalId, data) => {
    await goalsService.updateGoal(uid, goalId, data);
    set(state => ({
      goals: state.goals.map(g => g.id === goalId ? { ...g, ...data } : g),
    }));
  },

  deleteGoal: async (uid, goalId) => {
    await goalsService.deleteGoal(uid, goalId);
    set(state => ({
      goals: state.goals.filter(g => g.id !== goalId),
    }));
  },

  toggleMilestone: async (uid, goalId, milestoneIndex, completed) => {
    await goalsService.toggleMilestone(uid, goalId, milestoneIndex, completed);
    set(state => ({
      goals: state.goals.map(g => {
        if (g.id !== goalId) return g;
        const milestones = Array.isArray(g.milestones) ? [...g.milestones] : [];
        milestones[milestoneIndex] = { ...milestones[milestoneIndex], completed };
        return { ...g, milestones };
      }),
    }));
  },
}));

export default useGoalsStore;
