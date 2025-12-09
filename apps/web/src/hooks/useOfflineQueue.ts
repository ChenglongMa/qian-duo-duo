import { useEffect, useState } from 'react';
import { nanoid } from 'nanoid';
import { db } from '../db/local.js';
import { api } from '../api/client.js';
import { useAuth } from './useAuth.js';

export const useOfflineQueue = (ledgerId?: string | null) => {
  const [pending, setPending] = useState<number>(0);
  const token = useAuth((s) => s.token);

  useEffect(() => {
    const load = async () => {
      const count = await db.entries.count();
      setPending(count);
    };
    load();
  }, []);

  const queueEntry = async (payload: Record<string, unknown>) => {
    await db.entries.add({
      tempId: nanoid(),
      payload,
      createdAt: Date.now()
    });
    setPending((p) => p + 1);
  };

  const sync = async () => {
    if (!navigator.onLine || !token || !ledgerId) return;
    const items = await db.entries.toArray();
    for (const item of items) {
      try {
        await api.post(`/ledgers/${ledgerId}/entries`, item.payload);
        await db.entries.delete(item.id!);
      } catch (err) {
        console.error('Sync failed', err);
        break;
      }
    }
    const count = await db.entries.count();
    setPending(count);
  };

  useEffect(() => {
    const handler = () => sync();
    window.addEventListener('online', handler);
    return () => window.removeEventListener('online', handler);
  }, [ledgerId, token]);

  useEffect(() => {
    sync();
  }, [ledgerId, token]);

  return { pending, queueEntry, sync };
};
