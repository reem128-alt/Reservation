import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import { authApi} from '@/lib/api/auth';
import type { ChatConversation } from '@/app/types/chat';

interface AppState {
  profile: UserProfile | null;
  isProfileLoading: boolean;
  selectedConversation: ChatConversation | null;
  setProfile: (profile: UserProfile | null) => void;
  setSelectedConversation: (conversation: ChatConversation | null) => void;
  clearAuth: () => void;
  fetchProfile: () => Promise<UserProfile | null>;
}

export const useStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        profile: null,
        isProfileLoading: false,
        selectedConversation: null,
        setProfile: (profile) => set({ profile }),
        setSelectedConversation: (conversation) => set({ selectedConversation: conversation }),
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
