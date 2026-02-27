const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 900,
        minHeight: 600,
        frame: false,
        titleBarStyle: 'hidden',
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),
            contextIsolation: true,
            nodeIntegration: false,
        },
        title: "RMediTracker",
        backgroundColor: '#0f1117',
        show: false,
    });

    Menu.setApplicationMenu(null);

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    const isDev = !app.isPackaged;
    if (isDev) {
        mainWindow.loadURL('http://localhost:8080');
    } else {
        mainWindow.loadFile(path.join(__dirname, 'dist/index.html'));
    }
}

app.whenReady().then(() => {
    createWindow();
});

app.on('window-all-closed', () => {
    app.quit();
});

// ─── Window Control IPC Handlers ──────────────────────────────────────────────

ipcMain.handle('window-minimize', () => { mainWindow?.minimize(); });
ipcMain.handle('window-maximize', () => {
    if (mainWindow?.isMaximized()) mainWindow.unmaximize();
    else mainWindow?.maximize();
});
ipcMain.handle('window-close', () => { mainWindow?.close(); });
ipcMain.handle('window-is-maximized', () => mainWindow?.isMaximized() ?? false);

// ─── Serial Port IPC Handlers ─────────────────────────────────────────────────

ipcMain.handle('list-serial-ports', async () => {
    try { return await SerialPort.list(); }
    catch (e) { console.error(e); return []; }
});

let activePort = null;

ipcMain.handle('connect-serial-port', async (event, { path: portPath, baudRate }) => {
    if (activePort && activePort.isOpen) {
        await new Promise((resolve) => activePort.close(resolve));
    }

    return new Promise((resolve, reject) => {
        activePort = new SerialPort({
            path: portPath,
            baudRate: parseInt(baudRate) || 9600,
            autoOpen: false,
            hupcl: false
        });

        activePort.open((err) => {
            if (err) {
                console.error('Error opening port:', err);
                reject(err.message);
                return;
            }

            console.log(`Connected to ${portPath}`);

            // Brief delay for hardware stabilization before setting pins
            setTimeout(() => {
                if (!activePort || !activePort.isOpen) return;
                activePort.set({ dtr: true, rts: true }, (err) => {
                    if (err) console.error('Error setting control flags:', err);
                });
            }, 100);

            const parser = activePort.pipe(new ReadlineParser({ delimiter: '\n' }));

            // 1. Raw continuous stream for the debugger (shows every byte)
            activePort.on('data', (chunk) => {
                const raw = chunk.toString();
                const hex = chunk.toString('hex').toUpperCase().match(/.{1,2}/g)?.join(' ') || '';
                if (mainWindow) {
                    mainWindow.webContents.send('serial-raw', { raw, hex });
                }
            });

            // 2. Line-based stream for the UID logic (stable lines)
            parser.on('data', (line) => {
                const clean = line.toString().trim();
                if (clean && mainWindow) {
                    mainWindow.webContents.send('serial-data', clean);
                }
            });

            activePort.on('error', (err) => {
                if (mainWindow) {
                    mainWindow.webContents.send('serial-error', err.message);
                }
            });

            resolve(true);
        });
    });
});

ipcMain.handle('ping-serial-bridge', () => {
    if (mainWindow) {
        mainWindow.webContents.send('serial-data', '--- PONG: IPC BRIDGE OK ---');
        mainWindow.webContents.send('serial-raw', { raw: 'PONG', hex: '50 4F 4E 47' });
    }
    return true;
});

ipcMain.handle('disconnect-serial-port', async () => {
    if (activePort && activePort.isOpen)
        return new Promise((res) => activePort.close((e) => { activePort = null; res(e ? e.message : true); }));
    return true;
});

// ─── MongoDB IPC Handlers ─────────────────────────────────────────────────────

const { MongoClient, ObjectId } = require('mongodb');
let mongoClient = null;
let mongoDb = null;

ipcMain.handle('mongo-connect', async (event, { uri, dbName }) => {
    try {
        if (mongoClient) await mongoClient.close();
        mongoClient = new MongoClient(uri);
        await mongoClient.connect();
        mongoDb = mongoClient.db(dbName || 'rmeditracker');
        console.log('Connected to MongoDB');
        return { ok: true };
    } catch (e) {
        console.error('MongoDB Connect Error:', e);
        return { ok: false, error: e.message };
    }
});

ipcMain.handle('mongo-disconnect', async () => {
    try {
        if (mongoClient) await mongoClient.close();
        mongoClient = null;
        mongoDb = null;
        return { ok: true };
    } catch (e) {
        return { ok: false, error: e.message };
    }
});

ipcMain.handle('mongo-is-connected', async () => {
    return !!mongoClient && !!mongoDb;
});

ipcMain.handle('mongo-find', async (event, { collection, query, options }) => {
    try {
        if (!mongoDb) throw new Error('Not connected to MongoDB');
        const data = await mongoDb.collection(collection).find(query || {}, options || {}).toArray();
        return { ok: true, data };
    } catch (e) {
        return { ok: false, error: e.message };
    }
});

ipcMain.handle('mongo-insert', async (event, { collection, document }) => {
    try {
        if (!mongoDb) throw new Error('Not connected to MongoDB');
        const result = await mongoDb.collection(collection).insertOne(document);
        return { ok: true, insertedId: result.insertedId.toString() };
    } catch (e) {
        return { ok: false, error: e.message };
    }
});

ipcMain.handle('mongo-insert-many', async (event, { collection, documents }) => {
    try {
        if (!mongoDb) throw new Error('Not connected to MongoDB');
        const result = await mongoDb.collection(collection).insertMany(documents);
        return { ok: true, insertedCount: result.insertedCount };
    } catch (e) {
        return { ok: false, error: e.message };
    }
});

ipcMain.handle('mongo-update', async (event, { collection, filter, update }) => {
    try {
        if (!mongoDb) throw new Error('Not connected to MongoDB');
        // Handle _id if it's a string that should be an ObjectId
        if (filter._id && typeof filter._id === 'string' && filter._id.length === 24) {
            filter._id = new ObjectId(filter._id);
        }
        const result = await mongoDb.collection(collection).updateOne(filter, update);
        return { ok: true, modifiedCount: result.modifiedCount };
    } catch (e) {
        return { ok: false, error: e.message };
    }
});

ipcMain.handle('mongo-delete', async (event, { collection, filter }) => {
    try {
        if (!mongoDb) throw new Error('Not connected to MongoDB');
        if (filter._id && typeof filter._id === 'string' && filter._id.length === 24) {
            filter._id = new ObjectId(filter._id);
        }
        const result = await mongoDb.collection(collection).deleteOne(filter);
        return { ok: true, deletedCount: result.deletedCount };
    } catch (e) {
        return { ok: false, error: e.message };
    }
});
