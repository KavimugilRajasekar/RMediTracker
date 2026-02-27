# RMediTracker - Modern Healthcare & RFID Management

RMediTracker is a premium healthcare management system designed for medical centers and clinics. It integrates real-time RFID hardware communication with a robust Electron-based desktop environment to streamline patient registration, queue management, and doctor consultations.

---

## 🏗️ Project Architecture

The application is built on a split-architecture:
- **Electron (Main Process)**: Handles sensitive hardware communication (USB/Serial), window management, and Database IPC.
- **Preload Bridge**: A secure communications layer that exposes specific hardware and database APIs to the frontend.
- **Frontend (Vite/React)**: A high-performance, dynamic UI for staff and doctors.

### 📂 Directory Structure

```text
RMediTracker/
├── main.cjs                # Electron Main process (Hardware & Database logic)
├── preload.cjs             # Secure bridge between Electron and UI
├── package.json            # Dependencies and scripts
├── vite.config.ts          # Frontend build configuration
├── src/
│   ├── components/         # UI Components (Dashboards, UI Kit, etc.)
│   │   ├── RfidScanner.tsx # Core RFID interaction component
│   │   └── ui/             # Reusable Shadcn UI primitives
│   ├── contexts/           # Global states (Serial Port, Auth)
│   │   └── SerialContext.tsx# Logic for UID parsing & Rolling Buffer
│   ├── pages/              # Main view containers (Reception, Doctor dashboards)
│   ├── lib/                # Low-level utilities
│   │   ├── store.ts        # In-memory reactive patient store
│   │   └── mongodb.ts      # Frontend wrapper for Mongo IPC
│   ├── data/               # Initial state and mock data
│   ├── types/              # TypeScript interfaces for patients & visits
│   ├── test/               # Vitest suite (Hardware parsing verification)
│   └── App.tsx             # Main routing and provider setup
└── public/                 # Static assets and icons
```

---

## 📡 Hardware Integration (RFID)

The heart of RMediTracker is its resilient hardware communication system. We use a **Dual-Stream Parsing Strategy** to ensure no data is lost:

1.  **Line Parser**: Captures standard output from well-behaved devices that send newline characters (`\n`).
2.  **Rolling Buffer (Fragmentation Fix)**: For devices that send data in "bits" (e.g., character by character), we maintain a 64-character sliding window. It reassembles fragments into a full UID automatically.
3.  **Grace-Period Logic**: The scanner uses a 2-second grace period. If a user taps their card slightly before clicking the "Scan" button, the system will still "recall" the tag and process it, making the UI feel fast and natural.

---

## 🗄️ Data & Persistence

- **Modern UI**: Uses Tailwind CSS and Glassmorphism for a premium medical aesthetic.
- **In-Memory Store**: Uses a custom reactive store in `src/lib/store.ts` for instantaneous UI updates without lag.
- **MongoDB Backend**: Integrated via Electron IPC, allowing persistent storage of patient records, visits, and clinical notes across sessions.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite |
| **Styling** | Tailwind CSS, Framer Motion, Lucide Icons |
| **Desktop** | Electron |
| **Hardware** | SerialPort + Readline Parser |
| **Database** | MongoDB + Custom IPC Bridge |
| **State** | React Context + Custom Local Store |
| **Testing** | Vitest |

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18+)
- **NPM** or **Bun**

### 2. Installation
```bash
npm install
```

### 3. Running the App
For standard web development (no hardware):
```bash
npm run dev
```

For full hardware integration (Electron):
```bash
npm run start:electron
```

### 4. Running Tests
Verify the hardware parsing logic:
```bash
npm test
```
