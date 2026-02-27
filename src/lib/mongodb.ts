// Typed wrapper around Electron's mongoAPI bridge (window.electronAPI.mongoAPI)
// Use these functions in React components instead of calling electronAPI directly.

declare global {
    interface Window {
        electronAPI: {
            mongoAPI: {
                connect: (uri: string, dbName?: string) => Promise<{ ok: boolean; error?: string }>;
                disconnect: () => Promise<{ ok: boolean; error?: string }>;
                isConnected: () => Promise<boolean>;
                find: (collection: string, query?: object, options?: object) => Promise<{ ok: boolean; data?: any[]; error?: string }>;
                insert: (collection: string, document: object) => Promise<{ ok: boolean; insertedId?: string; error?: string }>;
                insertMany: (collection: string, documents: object[]) => Promise<{ ok: boolean; insertedCount?: number; error?: string }>;
                update: (collection: string, filter: object, update: object) => Promise<{ ok: boolean; modifiedCount?: number; error?: string }>;
                delete: (collection: string, filter: object) => Promise<{ ok: boolean; deletedCount?: number; error?: string }>;
            };
            listSerialPorts: () => Promise<any[]>;
            connectSerialPort: (options: any) => Promise<any>;
            disconnectSerialPort: () => Promise<any>;
            onSerialData: (cb: (data: string) => void) => void;
            onSerialRaw: (cb: (data: { raw: string; hex: string }) => void) => void;
            onSerialError: (cb: (err: string) => void) => void;
            pingSerialBridge: () => Promise<boolean>;
            minimizeWindow: () => Promise<void>;
            maximizeWindow: () => Promise<void>;
            closeWindow: () => Promise<void>;
            isMaximized: () => Promise<boolean>;
        };
    }
}

const api = () => window.electronAPI?.mongoAPI;

export const isMongoAvailable = () => typeof window !== 'undefined' && !!window.electronAPI?.mongoAPI;

export const connectMongo = (uri: string, dbName?: string) =>
    api()?.connect(uri, dbName) ?? Promise.resolve({ ok: false, error: 'No Electron API' });

export const disconnectMongo = () =>
    api()?.disconnect() ?? Promise.resolve({ ok: false, error: 'No Electron API' });

export const isMongoConnected = () =>
    api()?.isConnected() ?? Promise.resolve(false);

export const mongoFind = <T = any>(collection: string, query?: object): Promise<T[]> =>
    api()?.find(collection, query).then((r) => (r.ok ? (r.data as T[]) : [])) ?? Promise.resolve([]);

export const mongoInsert = (collection: string, document: object) =>
    api()?.insert(collection, document) ?? Promise.resolve({ ok: false, error: 'No Electron API' });

export const mongoInsertMany = (collection: string, documents: object[]) =>
    api()?.insertMany(collection, documents) ?? Promise.resolve({ ok: false, error: 'No Electron API' });

export const mongoUpdate = (collection: string, filter: object, update: object) =>
    api()?.update(collection, filter, update) ?? Promise.resolve({ ok: false, error: 'No Electron API' });

export const mongoDelete = (collection: string, filter: object) =>
    api()?.delete(collection, filter) ?? Promise.resolve({ ok: false, error: 'No Electron API' });
