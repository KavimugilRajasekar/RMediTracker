# RMediTracker — Real-Time RFID Healthcare Management

**A premium Electron desktop application paired with ESP8266 firmware that turns a medical center's RFID readers into a live patient registration, queue, and consultation platform.**

[![Electron](https://img.shields.io/badge/Electron-32.2-47848F?logo=electron&logoColor=white)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.1-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![ESP8266](https://img.shields.io/badge/ESP8266-Arduino-00979D?logo=arduino&logoColor=white)](https://www.arduino.cc/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## Project Overview

RMediTracker is a healthcare management desktop system purpose-built for small to mid-sized medical centers. It pairs a hardened Electron + React frontend with custom ESP8266 firmware driving an MFRC522 RFID reader, giving receptionists and doctors a single, fast surface for patient registration, queue control, and consultation notes. RFID taps flow from the hardware over USB serial into a resilient dual-stream parser, then up through an Electron IPC bridge to a reactive UI that updates every connected workstation in real time.

## Why It Exists

Paper registers and ad-hoc clinic software lose patient context, queue state, and visit history every time the front desk changes shift. RMediTracker replaces that gap with a self-contained desktop product that already knows how to talk to the RFID wristbands clinics hand out, how to persist visits across sessions in MongoDB, and how to keep the doctor dashboard in sync with the reception queue without a network round trip.

<img src="./screenshots/banner.png" alt="RMediTracker banner" style="width:320px;"/>

## Key Features

- Dual-stream serial parser combining a `ReadlineParser` with a 64-byte rolling buffer, eliminating tag fragmentation on noisy USB-serial adapters.
- Two-second grace-period recall, so a card tapped slightly before clicking Scan is still attributed to the patient.
- Real-time RFID hardware communication over USB/Serial using `serialport` 13 and `@serialport/parser-readline`.
- Secure Electron main/preload bridge that exposes only typed serial, window, and MongoDB APIs to the renderer (`contextIsolation: true`, `nodeIntegration: false`).
- Custom MongoDB IPC layer (`mongo-connect`, `mongo-find`, `mongo-insert`, `mongo-update`, `mongo-delete`, `mongo-insert-many`) so the renderer never touches Node directly.
- Reactive in-memory patient store in `src/lib/store.ts` for instantaneous UI updates without server round trips.
- Reception and Doctor dashboards with patient registration, queue management, and consultation notes.
- Premium medical aesthetic built on Tailwind CSS, Radix UI primitives, shadcn/ui, Framer Motion, and Lucide icons.
- Frameless window with hidden title bar, custom minimize/maximize/close controls, and a built-in serial debugger for raw and hex inspection.
- ESP8266 firmware (`ESP8266_RFID/FirmwareCode.ino`) that reads MFRC522 tags over SPI and prints the UID over serial at 9600 baud.
- Vitest suite covering the hardware parsing logic to guarantee UID recovery against regressions.
- Packaged distributable for Windows via `electron-builder` producing both NSIS installer and portable executable.

## Architecture Overview

RMediTracker is a three-tier system: an ESP8266 RFID endpoint, an Electron main process that owns the hardware and database, and a Vite-built React frontend that drives the user experience. The main process (`main.cjs`) is the only place that touches `SerialPort` or the MongoDB driver; the renderer communicates exclusively through the typed preload bridge (`preload.cjs`).

- Electron Main Process owns the `SerialPort` lifecycle, opens ports on demand, and pushes both a raw byte stream and a clean line stream to the renderer.
- Preload Bridge (`contextBridge.exposeInMainWorld`) exposes `electronAPI` with `listSerialPorts`, `connectSerialPort`, `onSerialData`, `onSerialRaw`, `mongoAPI`, and window-control helpers.
- Renderer (React + Vite) consumes those streams through a `SerialContext`, normalizes them in `RfidScanner.tsx`, and updates a reactive store in `src/lib/store.ts`.
- ESP8266 Firmware polls the MFRC522 over SPI, assembles a 4-7 byte UID, and emits one hex line per tap.
- MongoDB persistence is reached through IPC handlers that translate string `_id` values into `ObjectId` before issuing the query.

## Tech Stack

| Layer | Technology | Version |
| --- | --- | --- |
| Desktop Shell | Electron | 32.2.0 |
| Frontend Framework | React | 18.3.1 |
| Language | TypeScript | 5.8.3 |
| Build Tool | Vite | 5.4.19 |
| Styling | Tailwind CSS + Radix UI (shadcn/ui) | 3.4 / latest |
| State | React Context + custom local store | — |
| Hardware I/O | serialport + @serialport/parser-readline | 13.0.0 |
| Database | MongoDB (node driver) | 7.1.0 |
| Icons / Motion | lucide-react, framer-motion | 0.462 / latest |
| Validation | zod + react-hook-form | 3.25 / 7.61 |
| Testing | Vitest + Testing Library | 3.2 / 16 |
| Packaging | electron-builder (NSIS + portable) | 26.8 |
| IoT Endpoint | ESP8266 + Arduino + MFRC522 | — |

## Folder Structure

```text
RMediTracker/
├── main.cjs                        # Electron main: serial + MongoDB IPC handlers
├── preload.cjs                     # contextBridge exposing electronAPI
├── package.json                    # Scripts, deps, electron-builder config
├── vite.config.ts                  # Frontend build config
├── tsconfig.app.json               # Renderer TS config
├── src/
│   ├── components/
│   │   ├── RfidScanner.tsx         # Core RFID interaction component
│   │   └── ui/                     # Reusable shadcn/ui primitives
│   ├── contexts/
│   │   └── SerialContext.tsx       # UID parsing + rolling buffer logic
│   ├── pages/                      # Reception, Doctor, dashboards
│   ├── lib/
│   │   ├── store.ts                # Reactive in-memory patient store
│   │   └── mongodb.ts              # Frontend wrapper for Mongo IPC
│   ├── data/                       # Initial state and seed data
│   ├── types/                      # Patient, visit, RFID types
│   ├── test/                       # Vitest suite (UID parser checks)
│   ├── App.tsx                     # Routing + provider setup
│   └── main.tsx                    # React entry point
├── public/                         # Static assets, app icons
├── screenshots/
│   └── banner.png                  # Project banner image
└── ESP8266_RFID/
    └── FirmwareCode.ino            # MFRC522 UID emitter over Serial
```

## Installation and Setup

### Prerequisites

- Node.js 18 or higher
- npm (bundled with Node) or Bun
- A MongoDB instance (local or Atlas) reachable from the desktop machine
- For hardware mode: an ESP8266 board (NodeMCU / Wemos D1 mini) with an MFRC522 RFID reader wired to `SS_PIN=D8` and `RST_PIN=D3`
- Optional: Arduino IDE or `arduino-cli` for flashing firmware

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/KavimugilRajasekar/RMediTracker.git
cd RMediTracker

# 2. Install dependencies
npm install

# 3. Run Vite only (UI development, no hardware)
npm run dev

# 4. Run full Electron + Vite (recommended for hardware)
npm run start
# (or `npm run start:electron` if you want to start Electron separately)

# 5. Build the Windows installer + portable bundle
npm run build
# Output: release/RMediTracker Setup x.x.x.exe and a portable .exe
```

To flash the firmware:

```bash
# Using Arduino CLI
arduino-cli core install esp8266:esp8266
arduino-cli upload -p <COM_PORT> --fqbn esp8266:esp8266:d1_mini ESP8266_RFID/FirmwareCode.ino
```

Open the Serial Monitor at 9600 baud and tap an RFID card; you should see a hex UID printed once per tap.

## Usage and Examples

### Connecting a Reader

1. Launch the desktop app and open the **RfidScanner** view.
2. The app calls `electronAPI.listSerialPorts()` and lists every available COM/tty device.
3. Select the port tied to your ESP8266, set baud rate to `9600`, and click **Connect**.
4. The Electron main process opens the port, sets DTR/RTS after a 100 ms stabilization delay, and pipes a `ReadlineParser({ delimiter: '\n' })` over the stream.
5. Tap an RFID card; the UID lands in the UI both as raw text and as a hex-string.

### Reading the Serial Debugger

The main process emits two parallel streams:

- `serial-raw`: every byte chunk as ASCII + grouped hex pairs.
- `serial-data`: full lines terminated by `\n` (used by the UID logic).

Use the built-in debugger pane to inspect both feeds while developing firmware.

### Persistence Workflow

1. Connect MongoDB through the settings panel (URI + database name).
2. The main process keeps a single `MongoClient` alive; all renderer calls go through `mongo-find`, `mongo-insert`, `mongo-update`, and `mongo-delete`.
3. Patient records survive across sessions; the in-memory reactive store mirrors whatever Mongo returns.

### Tests

```bash
npm test           # one-shot Vitest run
npm run test:watch # watch mode for UID parser tests
```

## Configuration

- **Window chrome**: frameless window with hidden title bar; drag area, minimize, maximize, and close buttons are rendered by the React shell.
- **Serial defaults**: `baudRate = 9600`, `autoOpen = false`, `hupcl = false`. Override from the UI before connecting.
- **MongoDB URI and database name**: supplied per session via the connection panel; default database `rmeditracker`.
- **NSIS installer**: oneClick disabled, installation directory is user-selectable, desktop and start menu shortcuts are created.
- **Packaging targets**: NSIS installer and portable executable, x64 only.
- **asarUnpack**: the `serialport` and `@serialport/bindings-cpp` native modules are unpacked so they can be loaded at runtime.

## Learning Outcomes

- Mastering the Electron multi-process model and the security trade-offs of `contextIsolation` plus an explicit preload bridge.
- Writing a tolerant serial-port parser that handles fragmented, line-delimited, and character-delimited streams without dropping data.
- Designing an in-memory reactive store in TypeScript that mirrors a persistent database without lag.
- Bridging Node-native APIs (MongoDB, `serialport`) to a sandboxed renderer through typed IPC handlers.
- Wiring ESP8266 firmware (Arduino + SPI + MFRC522) to a desktop application and validating end-to-end.
- Producing a signed Windows installer plus a portable build with `electron-builder` and `asarUnpack`.

## Challenges Faced

- RFID readers emit data inconsistently; some send full lines, others dribble bytes one at a time, which required a rolling buffer plus a `ReadlineParser` running in parallel.
- The renderer's security model prevents direct Node access, so every database and serial call had to be re-exposed through `contextBridge` with a minimal, typed surface.
- MongoDB's strict `ObjectId` typing caused string `_id` filters to be silently dropped until the IPC handlers learned to coerce 24-character hex strings back into `ObjectId`.
- Native modules (`serialport`, `@serialport/bindings-cpp`) had to be excluded from `asar` packaging, otherwise the packaged app failed to load the bindings at runtime.
- Coordinating DTR/RTS pin states with cheap USB-serial clones required a short stabilization delay before the UID stream became reliable.

## Future Improvements

- Cross-platform packaging for macOS and Linux (the current `electron-builder` config is Windows-only).
- A cloud sync layer for clinics that operate across multiple branches.
- A role-based access system for doctors, reception, and admin users with per-action audit logs.
- Native printer and barcode-scanner integration alongside RFID.
- A real-time WebSocket bridge so multiple workstations can share the same queue state.

## Contribution Guidelines

1. Fork the repository and create a feature branch: `git checkout -b feat/<short-description>`.
2. Run `npm install` and `npm test` before opening a pull request; add Vitest coverage for any new parsing logic.
3. Keep the preload surface minimal — new hardware or database capabilities belong in `main.cjs`, exposed through `preload.cjs`, never directly in the renderer.
4. Match the existing TypeScript and Tailwind style; lint with `npm run lint` before pushing.
5. Open an issue first for large changes so the design can be discussed before code lands.

## License

This project is distributed under the MIT License. See the upstream `LICENSE` file for full text.

## Author

**Kavimugil Rajasekar**

- Portfolio: [KavimugilRajasekar.github.io](https://KavimugilRajasekar.github.io)
- GitHub: [github.com/KavimugilRajasekar](https://github.com/KavimugilRajasekar)