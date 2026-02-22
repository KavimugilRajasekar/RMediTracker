# RMediTracker

A standalone medical data tracking application built with React, Vite, and Electron.

## Features
- Medical data visualization and management.
- Desktop application support (via Electron).
- USB Serial Port integration for real-time data reading.

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- npm (comes with Node.js)

### Installation
1. Clone the repository.
2. Install dependencies:
   ```sh
   npm install
   ```

### Development
To start the web development server:
```sh
npm run dev
```

To start the application in Electron:
```sh
npm run start:electron
```

### Building for Desktop
To build a standalone executable:
```sh
npm run build:electron
```

## Technologies
- **Frontend**: React, TypeScript, Tailwind CSS, shadcn-ui
- **Bundler**: Vite
- **Desktop**: Electron
- **Communication**: SerialPort (USB)
