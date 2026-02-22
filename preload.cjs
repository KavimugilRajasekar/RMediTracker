const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    // Serial Port
    listSerialPorts: () => ipcRenderer.invoke('list-serial-ports'),
    connectSerialPort: (options) => ipcRenderer.invoke('connect-serial-port', options),
    disconnectSerialPort: () => ipcRenderer.invoke('disconnect-serial-port'),
    onSerialData: (callback) => ipcRenderer.on('serial-data', (event, data) => callback(data)),
    onSerialError: (callback) => ipcRenderer.on('serial-error', (event, err) => callback(err)),

    // Window Controls
    minimizeWindow: () => ipcRenderer.invoke('window-minimize'),
    maximizeWindow: () => ipcRenderer.invoke('window-maximize'),
    closeWindow: () => ipcRenderer.invoke('window-close'),
    isMaximized: () => ipcRenderer.invoke('window-is-maximized'),
});
