const DB_NAME = 'herdos-offline';
const DB_VERSION = 1;
const STORE = 'sync_queue';

export type SyncOperation = {
  clientId: string;
  entityType: 'animal' | 'task' | 'milk_record' | 'health_record' | 'finance_entry';
  action: 'create' | 'update';
  payload: Record<string, unknown>;
  updatedAt: string;
  status: 'pending' | 'syncing' | 'synced' | 'failed';
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'clientId' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function enqueueOperation(op: Omit<SyncOperation, 'status'>): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put({ ...op, status: 'pending' });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getPendingOperations(): Promise<SyncOperation[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => {
      const all = req.result as SyncOperation[];
      resolve(all.filter((o) => o.status === 'pending' || o.status === 'failed'));
    };
    req.onerror = () => reject(req.error);
  });
}

export async function markOperation(clientId: string, status: SyncOperation['status']): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    const store = tx.objectStore(STORE);
    const getReq = store.get(clientId);
    getReq.onsuccess = () => {
      const item = getReq.result as SyncOperation | undefined;
      if (item) {
        if (status === 'synced') {
          store.delete(clientId);
        } else {
          store.put({ ...item, status });
        }
      }
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getPendingCount(): Promise<number> {
  const pending = await getPendingOperations();
  return pending.length;
}

export function generateClientId(): string {
  return `offline-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
