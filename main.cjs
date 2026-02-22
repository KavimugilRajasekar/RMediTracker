const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const { SerialPort } = require('serialport');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        frame: false,           // Remove native OS frame (title bar + menu bar)
        titleBarStyle: 'hidden',
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),
            contextIsolation: true,
            nodeIntegration: false,
        },
        title: "RMediTracker",
        backgroundColor: '#0f1117',
        show: false,            // Don't show until ready-to-show
    });

    // Remove the application menu bar (File, Edit, View...)
    Menu.setApplicationMenu(null);

    // Show window once ready to avoid flash
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    // In development, load from the Vite dev server
    const isDev = !app.isPackaged;
    if (isDev) {
        mainWindow.loadURL('http://localhost:8080');
        // mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, 'dist/index.html'));
    }
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

// ─── Window Control IPC Handlers ────────────────────────────────────────────

ipcMain.handle('window-minimize', () => {
    mainWindow?.minimize();
});

ipcMain.handle('window-maximize', () => {
    if (mainWindow?.isMaximized()) {
        mainWindow.unmaximize();
    } else {
        mainWindow?.maximize();
    }
});

ipcMain.handle('window-close', () => {
    mainWindow?.close();
});

ipcMain.handle('window-is-maximized', () => {
    return mainWindow?.isMaximized() ?? false;
});

// ─── Serial Port IPC Handlers ────────────────────────────────────────────────

ipcMain.handle('list-serial-ports', async () => {
    try {
        const ports = await SerialPort.list();
        return ports;
    } catch (error) {
        console.error('Error listing serial ports:', error);
        return [];
    }
});

let activePort = null;

ipcMain.handle('connect-serial-port', async (event, { path: portPath, baudRate }) => {
    if (activePort && activePort.isOpen) {
        await new Promise((resolve) => activePort.close(resolve));
    }

    return new Promise((resolve, reject) => {
        activePort = new SerialPort({ path: portPath, baudRate: parseInt(baudRate) || 9600 }, (err) => {
            if (err) {
                console.error('Error opening port:', err);
                reject(err.message);
            } else {
                console.log(`Connected to ${portPath}`);

                activePort.on('data', (data) => {
                    mainWindow.webContents.send('serial-data', data.toString());
                });

                activePort.on('error', (err) => {
                    mainWindow.webContents.send('serial-error', err.message);
                });

                resolve(true);
            }
        });
    });
});

ipcMain.handle('disconnect-serial-port', async () => {
    if (activePort && activePort.isOpen) {
        return new Promise((resolve) => {
            activePort.close((err) => {
                activePort = null;
                resolve(err ? err.message : true);
            });
        });
    }
    return true;
});
