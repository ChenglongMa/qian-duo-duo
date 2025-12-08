import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string;
  mainCurrency: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  ledgerId: string | null;
  setAuth: (payload: { token: string; user: User; ledgerId?: string | null }) => void;
  setLedgerId: (ledgerId: string) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      ledgerId: null,
      setAuth: ({ token, user, ledgerId }) => set({ token, user, ledgerId: ledgerId || null }),
      setLedgerId: (ledgerId) => set({ ledgerId }),
      logout: () => set({ token: null, user: null, ledgerId: null })
    }),
    {
      name: 'qdd-auth'
    }
  )
);
