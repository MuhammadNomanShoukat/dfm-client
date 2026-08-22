import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api } from '../api/client';
import {
  generateClientId,
  getPendingCount,
  getPendingOperations,
  markOperation,
  enqueueOperation,
  type SyncOperation,
} from './syncDb';

export type SyncStatus = 'online' | 'offline' | 'syncing' | 'synced';

type OfflineContextValue = {
  status: SyncStatus;
  pendingCount: number;
  queueCreate: (
    entityType: SyncOperation['entityType'],
    payload: Record<string, unknown>,
  ) => Promise<string>;
  syncNow: () => Promise<void>;
};

const OfflineContext = createContext<OfflineContextValue | null>(null);

export function OfflineProvider({ children }: { children: ReactNode }) {
  const [online, setOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('online');
  const [pendingCount, setPendingCount] = useState(0);

  const refreshPending = useCallback(async () => {
    setPendingCount(await getPendingCount());
  }, []);

  const syncNow = useCallback(async () => {
    if (!navigator.onLine) {
      return;
    }
    const pending = await getPendingOperations();
    if (pending.length === 0) {
      setSyncStatus('synced');
      return;
    }
    setSyncStatus('syncing');
    try {
      const { data } = await api.post<{ results: { clientId: string; status: string }[] }>('/sync/push', {
        operations: pending.map(({ clientId, entityType, action, payload, updatedAt }) => ({
          clientId,
          entityType,
          action,
          payload,
          updatedAt,
        })),
      });
      for (const result of data.results) {
        await markOperation(result.clientId, result.status === 'synced' || result.status === 'duplicate' ? 'synced' : 'failed');
      }
      await refreshPending();
      setSyncStatus('synced');
    } catch {
      setSyncStatus('online');
    }
  }, [refreshPending]);

  useEffect(() => {
    const onOnline = () => {
      setOnline(true);
      void syncNow();
    };
    const onOffline = () => setOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    void refreshPending();
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, [syncNow, refreshPending]);

  useEffect(() => {
    if (!online) {
      setSyncStatus('offline');
    } else if (syncStatus === 'offline') {
      setSyncStatus('online');
    }
  }, [online, syncStatus]);

  const queueCreate = useCallback(
    async (entityType: SyncOperation['entityType'], payload: Record<string, unknown>) => {
      const clientId = generateClientId();
      await enqueueOperation({
        clientId,
        entityType,
        action: 'create',
        payload,
        updatedAt: new Date().toISOString(),
      });
      await refreshPending();
      if (navigator.onLine) {
        void syncNow();
      }
      return clientId;
    },
    [refreshPending, syncNow],
  );

  const value = useMemo(
    () => ({ status: syncStatus, pendingCount, queueCreate, syncNow }),
    [syncStatus, pendingCount, queueCreate, syncNow],
  );

  return <OfflineContext.Provider value={value}>{children}</OfflineContext.Provider>;
}

export function useOffline(): OfflineContextValue {
  const ctx = useContext(OfflineContext);
  if (!ctx) {
    throw new Error('useOffline must be used within OfflineProvider');
  }
  return ctx;
}

export function SyncStatusBanner() {
  const { status, pendingCount, syncNow } = useOffline();

  const labels: Record<SyncStatus, { text: string; color: string }> = {
    online: { text: 'Online', color: '#1F6B4A' },
    offline: { text: 'Offline — changes will sync automatically', color: '#B54708' },
    syncing: { text: 'Syncing…', color: '#175CD3' },
    synced: { text: 'All changes synced', color: '#1F6B4A' },
  };

  const meta = labels[status];
  const showPending = pendingCount > 0 && status !== 'syncing';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '4px 12px',
        fontSize: 13,
        background: `${meta.color}14`,
        color: meta.color,
        borderRadius: 8,
        cursor: status === 'offline' || showPending ? 'pointer' : 'default',
      }}
      onClick={() => void syncNow()}
      role="status"
    >
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: meta.color }} />
      {meta.text}
      {showPending ? ` · ${pendingCount} pending` : null}
    </div>
  );
}
