import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Vite is used only as a build tool for the Electron desktop app.
// base: "./" is required so Electron can load assets from the local dist/ folder.
export default defineConfig({
  base: "./",
  server: {
    host: "localhost",   // Bind to localhost only — not a public web server
    port: 8080,
    hmr: {
      overlay: false,   // Suppress HMR overlay inside Electron's BrowserWindow
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
