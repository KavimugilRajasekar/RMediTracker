const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    // ── Serial Port ──────────────────────────────────────────────────────────
    listSerialPorts: () => ipcRenderer.invoke('list-serial-ports'),
    connectSerialPort: (opts) => ipcRenderer.invoke('connect-serial-port', opts),
    disconnectSerialPort: () => ipcRenderer.invoke('disconnect-serial-port'),
    onSerialData: (cb) => ipcRenderer.on('serial-data', (_, data) => cb(data)),
    onSerialRaw: (cb) => ipcRenderer.on('serial-raw', (_, data) => cb(data)),
    onSerialError: (cb) => ipcRenderer.on('serial-error', (_, err) => cb(err)),
    pingSerialBridge: () => ipcRenderer.invoke('ping-serial-bridge'),

    // ── Window Controls ──────────────────────────────────────────────────────
    minimizeWindow: () => ipcRenderer.invoke('window-minimize'),
    maximizeWindow: () => ipcRenderer.invoke('window-maximize'),
    closeWindow: () => ipcRenderer.invoke('window-close'),
    isMaximized: () => ipcRenderer.invoke('window-is-maximized'),

    // ── MongoDB ─────────────────────────────────────────────────────────────
    mongoAPI: {
        connect: (uri, dbName) => ipcRenderer.invoke('mongo-connect', { uri, dbName }),
        disconnect: () => ipcRenderer.invoke('mongo-disconnect'),
        isConnected: () => ipcRenderer.invoke('mongo-is-connected'),
        find: (collection, query, options) => ipcRenderer.invoke('mongo-find', { collection, query, options }),
        insert: (collection, document) => ipcRenderer.invoke('mongo-insert', { collection, document }),
        insertMany: (collection, documents) => ipcRenderer.invoke('mongo-insert-many', { collection, documents }),
        update: (collection, filter, update) => ipcRenderer.invoke('mongo-update', { collection, filter, update }),
        delete: (collection, filter) => ipcRenderer.invoke('mongo-delete', { collection, filter }),
    },
});
