import { create } from 'zustand';

const useTimerStore = create((set, get) => ({
  task: null,
  totalSecs: 0,
  startedAt: null,
  elapsedBeforePause: 0,
  pausedAt: null,
  done: false,

  start: (task) => {
    const totalSecs = (task.timeMin || 25) * 60;
    set({ task, totalSecs, startedAt: Date.now(), elapsedBeforePause: 0, pausedAt: null, done: false });
  },

  pause: () => {
    const { startedAt, elapsedBeforePause, pausedAt } = get();
    if (pausedAt) return;
    const elapsed = elapsedBeforePause + (Date.now() - startedAt) / 1000;
    set({ pausedAt: Date.now(), elapsedBeforePause: elapsed });
  },

  resume: () => {
    const { pausedAt } = get();
    if (!pausedAt) return;
    set({ startedAt: Date.now(), pausedAt: null });
  },

  tick: () => {
    const { task, totalSecs, startedAt, elapsedBeforePause, pausedAt, done } = get();
    if (done || pausedAt || !startedAt) return;
    const elapsed = elapsedBeforePause + (Date.now() - startedAt) / 1000;
    if (elapsed >= totalSecs) {
      set({ done: true, startedAt: null, elapsedBeforePause: 0 });
    }
  },

  reset: () => {
    const { task } = get();
    if (task) {
      const totalSecs = (task.timeMin || 25) * 60;
      set({ totalSecs, startedAt: null, elapsedBeforePause: 0, pausedAt: null, done: false });
    }
  },

  stop: () => {
    set({ task: null, totalSecs: 0, startedAt: null, elapsedBeforePause: 0, pausedAt: null, done: false });
  },

  getRemaining: () => {
    const { totalSecs, startedAt, elapsedBeforePause, pausedAt, done, task } = get();
    if (!task || done) return 0;
    if (pausedAt) return Math.max(0, Math.ceil(totalSecs - elapsedBeforePause));
    if (startedAt) {
      const elapsed = elapsedBeforePause + (Date.now() - startedAt) / 1000;
      return Math.max(0, Math.ceil(totalSecs - elapsed));
    }
    return totalSecs;
  },

  isRunning: () => {
    const { startedAt, pausedAt, done, task } = get();
    return !!task && !!startedAt && !pausedAt && !done;
  },
}));

export default useTimerStore;
