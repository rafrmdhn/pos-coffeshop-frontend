import Dexie, { type EntityTable } from 'dexie';

export interface OfflineTransaction {
  id: string; // uuid v7
  payload: any;
  status: 'pending' | 'syncing' | 'failed';
  created_at: string;
}

export interface AppSettings {
  id: string;
  theme: 'light' | 'dark' | 'system';
  printer_mac?: string;
}

export interface AuthSession {
  id: string; // typically 'session'
  token: string;
  user: any;
}

const db = new Dexie('pos-db') as Dexie & {
  offlineTransactions: EntityTable<OfflineTransaction, 'id'>;
  settings: EntityTable<AppSettings, 'id'>;
  auth: EntityTable<AuthSession, 'id'>;
};

// Schema declaration
db.version(1).stores({
  offlineTransactions: 'id, status, created_at',
  settings: 'id',
  auth: 'id'
});

export { db };
