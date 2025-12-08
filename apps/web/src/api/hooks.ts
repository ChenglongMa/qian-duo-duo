import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './client';
import { useAuth } from '../hooks/useAuth';

export const useRegister = () =>
  useMutation({
    mutationFn: async (payload: { email: string; password: string; name: string; mainCurrency: string }) => {
      const { data } = await api.post('/auth/register', payload);
      return data;
    }
  });

export const useLogin = () =>
  useMutation({
    mutationFn: async (payload: { email: string; password: string }) => {
      const { data } = await api.post('/auth/login', payload);
      return data;
    }
  });

export const useChangePassword = () =>
  useMutation({
    mutationFn: async (payload: { currentPassword: string; newPassword: string }) => {
      const { data } = await api.post('/auth/change-password', payload);
      return data;
    }
  });

export const useLedgers = () =>
  useQuery({
    queryKey: ['ledgers'],
    queryFn: async () => {
      const { data } = await api.get('/ledgers');
      return data as { id: string; name: string; description?: string; role: string }[];
    }
  });

export const useCategories = (ledgerId?: string | null) =>
  useQuery({
    enabled: Boolean(ledgerId),
    queryKey: ['categories', ledgerId],
    queryFn: async () => {
      const { data } = await api.get(`/ledgers/${ledgerId}/categories`);
      return data as any[];
    }
  });

export const useEntries = (ledgerId?: string | null) =>
  useQuery({
    enabled: Boolean(ledgerId),
    queryKey: ['entries', ledgerId],
    queryFn: async () => {
      const { data } = await api.get(`/ledgers/${ledgerId}/entries`, {
        params: { limit: 100, sortBy: 'date', sortOrder: 'desc' }
      });
      return data as any[];
    }
  });

export const useCreateEntry = (ledgerId?: string | null) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await api.post(`/ledgers/${ledgerId}/entries`, payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['entries', ledgerId] });
    }
  });
};

export const useFxRate = (base: string, quote: string) =>
  useQuery({
    enabled: Boolean(base && quote),
    queryKey: ['fx', base, quote],
    queryFn: async () => {
      const { data } = await api.get('/meta/fx', { params: { base, quote } });
      return data.rate as number;
    }
  });

export const useLogout = () => {
  const set = useAuth((s) => s.logout);
  return () => set();
};
