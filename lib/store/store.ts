import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import { authApi} from '@/lib/api/auth';

interface AppState {
  profile: UserProfile | null;
  isProfileLoading: boolean;
  setProfile: (profile: UserProfile | null) => void;
  clearAuth: () => void;
  fetchProfile: () => Promise<UserProfile | null>;
}

export const useStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        profile: null,
        isProfileLoading: false,
        setProfile: (profile) => set({ profile }),
        clearAuth: () => {
          localStorage.removeItem('token');
          set({ profile: null, isProfileLoading: false });
        },
        fetchProfile: async () => {
          if (!localStorage.getItem('token')) {
            set({ profile: null, isProfileLoading: false });
            return null;
          }

          if (get().isProfileLoading) return get().profile;

          try {
            set({ isProfileLoading: true });
            const profile = await authApi.profile();
            set({ profile });
            return profile;
          } catch {
            set({ profile: null });
            return null;
          } finally {
            set({ isProfileLoading: false });
          }
        },
      }),
      {
        name: 'app-storage',
      }
    )
  )
);
