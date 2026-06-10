import { create } from 'zustand';
import * as tasksService from '../services/tasks';

const useTasksStore = create((set, get) => ({
  tasks: [],
  loading: false,
  error: null,
  _unsubTasks: null,

  fetchTasks: async (uid, date) => {
    set({ loading: true, error: null });
    try {
      const tasks = await tasksService.getTasks(uid, date);
      set({ tasks, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  subscribeTasks: (uid, date) => {
    set({ loading: true, error: null });
    get()._unsubTasks?.();
    let fallbackDone = false;
    const unsub = tasksService.subscribeTasks(uid, date, (tasks) => {
      set({ tasks, loading: false });
      if (tasks.length === 0 && !fallbackDone) {
        fallbackDone = true;
        tasksService.getTasks(uid, date).then(t => {
          if (t.length > 0) set({ tasks: t, loading: false });
        });
      }
    }, (err) => {
      set({ error: err.message, loading: false });
    });
    set({ _unsubTasks: unsub });
    return unsub;
  },

  unsubscribeTasks: () => {
    get()._unsubTasks?.();
    set({ _unsubTasks: null });
  },

  addTask: async (uid, task, date) => {
    const newTask = {
      id: Date.now().toString(),
      name: task.name,
      timeMin: task.timeMin || 25,
      repeatDaily: task.repeatDaily || false,
      done: false,
      order: get().tasks.length,
    };
    const updated = [...get().tasks, newTask];
    await tasksService.saveTasks(uid, updated, date);
    set({ tasks: updated });
    return newTask;
  },

  toggleTask: async (uid, taskId, date) => {
    const updated = get().tasks.map(t =>
      t.id === taskId ? { ...t, done: !t.done } : t
    );
    await tasksService.saveTasks(uid, updated, date);
    set({ tasks: updated });
  },

  updateTask: async (uid, taskId, data, date) => {
    const updated = get().tasks.map(t =>
      t.id === taskId ? { ...t, ...data } : t
    );
    await tasksService.saveTasks(uid, updated, date);
    set({ tasks: updated });
  },

  deleteTask: async (uid, taskId, date) => {
    const updated = get().tasks.filter(t => t.id !== taskId);
    await tasksService.saveTasks(uid, updated, date);
    set({ tasks: updated });
  },

  reorderTasks: async (uid, tasks, date) => {
    const reordered = tasks.map((t, i) => ({ ...t, order: i }));
    await tasksService.saveTasks(uid, reordered, date);
    set({ tasks: reordered });
  },
}));

export default useTasksStore;
