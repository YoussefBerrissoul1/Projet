import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, AuthState } from '@/types/auth';
import { mockUsers } from '@/data/mockData';

interface AuthStoreState extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

const DEMO_PASSWORD = 'Demo@12345!'; // Password for demo accounts

export const useAuthStore = create<AuthStoreState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });

        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 800));

        try {
          // Find user by email
          const user = mockUsers.find((u) => u.email === email);

          if (!user) {
            set({
              isLoading: false,
              error: 'User not found. Please check your email.',
            });
            return;
          }

          // Verify password (in real app, this would be done server-side)
          if (password !== DEMO_PASSWORD) {
            set({
              isLoading: false,
              error: 'Invalid password. Try "Demo@12345!"',
            });
            return;
          }

          // Successful login
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            isLoading: false,
            error: 'An error occurred during login. Please try again.',
          });
        }
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          error: null,
        });
      },

      setUser: (user: User | null) => {
        set({
          user,
          isAuthenticated: user !== null,
        });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
