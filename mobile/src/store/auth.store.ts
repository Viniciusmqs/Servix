import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import { User } from '../types/models';

interface AuthState {
  user: User | null;
  token: string | null;
  needsOnboarding: boolean;
  _hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  setAuth: (user: User, token: string) => void;
  setNeedsOnboarding: (value: boolean) => void;
  logout: () => void;
  restoreSession: () => void;
}

const secureStorage = createJSONStorage(() => ({
  getItem: async (key: string): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {
      // SecureStore unavailable (e.g. simulator without keychain) — ignore
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {}
  },
}));

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      needsOnboarding: false,
      _hasHydrated: false,

      setHasHydrated: (value) => set({ _hasHydrated: value }),

      setAuth: (user, token) => set({ user, token }),

      setNeedsOnboarding: (value) => set({ needsOnboarding: value }),

      logout: () => set({ user: null, token: null, needsOnboarding: false }),

      restoreSession: () => {
        // zustand persist restores user/token automatically from SecureStore.
        // This is a no-op kept for API compatibility; _hasHydrated signals readiness.
      },
    }),
    {
      name: 'auth-storage',
      storage: secureStorage,
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        needsOnboarding: state.needsOnboarding,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
