import { create } from 'zustand';
import * as goalsService from '../services/goals';

const useGoalsStore = create((set, get) => ({
  goals: [],
  loading: false,
  error: null,

  fetchGoals: async (uid) => {
    set({ loading: true, error: null });
    try {
      const goals = await goalsService.getGoals(uid);
      set({ goals, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  addGoal: async (uid, goalData) => {
    const goal = await goalsService.addGoal(uid, goalData);
    set(state => ({ goals: [goal, ...state.goals] }));
    return goal;
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
