import { create } from 'zustand';
import { onAuthStateChanged, updateProfile } from 'firebase/auth';
import { auth } from '../lib/firebase';

const useAuthStore = create((set, get) => ({
  user: null,
  loading: true,

  setUser: (user) => set({ user, loading: false }),

  init: () => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        const stored = localStorage.getItem(`avatar_${user.uid}`);
        if (stored && !user.photoURL?.startsWith('data:')) {
          user.photoURL = stored;
        }
      }
      set({ user, loading: false });
    });
  },

  updateProfileAction: async (data) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    if (data.photoURL && data.photoURL.startsWith('data:')) {
      localStorage.setItem(`avatar_${currentUser.uid}`, data.photoURL);
    }
    try {
      await updateProfile(currentUser, data);
    } catch {
    }
    set({ user: { ...currentUser, ...data } });
  },
}));

export default useAuthStore;
