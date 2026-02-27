// Shared serial-port context so the COMPortSelector in the header
// can broadcast scanned RFID UIDs to any component listening.

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";

interface SerialContextType {
    isConnected: boolean;
    selectedPort: string;
    lastScan: { uid: string; timestamp: number } | null;
    rawData: string;          // latest raw serial line
    rawLog: string[];        // recent history for debugging
    connect: (port: string, baudRate: number) => Promise<boolean>;
    disconnect: () => Promise<void>;
    listPorts: () => Promise<{ path: string; friendlyName?: string }[]>;
}

const SerialContext = createContext<SerialContextType | null>(null);

// Parse UID from raw serial data. Handles "UID tag :822CE55C", raw "2B375006", and even fragmented "2B 37 50 06"
export const parseUid = (raw: string): string | null => {
    if (!raw) return null;
    const trimmed = raw.trim();

    // 1. Try matching "UID tag :XXXXXXXX" (common in many Arduino RFID libraries)
    const tagMatch = trimmed.match(/UID\s+tag\s*:\s*([A-Za-z0-9\s]+)/i);
    if (tagMatch) {
        const potential = tagMatch[1].replace(/\s/g, '').toUpperCase();
        if (/[A-F0-9]{8,14}/.test(potential)) return potential;
    }

    // 2. Try searching for any 8, 10, or 12 character hex sequence
    // We filter out common non-UID hex patterns if necessary, but usually a lone hex string is a UID
    const hexPattern = /[A-Fa-f0-9]{8,14}/;
    const directMatch = trimmed.replace(/\s/g, '').match(hexPattern);
    if (directMatch) {
        return directMatch[0].toUpperCase();
    }

    return null;
};

export const SerialProvider = ({ children }: { children: ReactNode }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [selectedPort, setSelectedPort] = useState("");
    const [lastScan, setLastScan] = useState<{ uid: string; timestamp: number } | null>(null);
    const [rawData, setRawData] = useState("");
    const [rawLog, setRawLog] = useState<string[]>([]);
    const listenersAttached = useRef(false);
    const rollingBuffer = useRef(""); // Accumulates raw chunks

    // Attach Electron serial-data listeners once
    useEffect(() => {
        if (!window.electronAPI || listenersAttached.current) return;
        listenersAttached.current = true;

        const processIncoming = (data: string, source: 'LINE' | 'RAW') => {
            const uid = parseUid(data);
            if (uid) {
                console.log(`✅ UID detected via ${source}:`, uid);
                // Functional update not needed for UI sync, but timestamp is critical
                setLastScan({ uid, timestamp: Date.now() });
                return true;
            }
            return false;
        };

        // 1. Line-based listener for stable UIDs (best for well-behaved hardware)
        window.electronAPI.onSerialData((data: string) => {
            console.log('✅ Serial Line:', data);
            const logEntry = `[${new Date().toLocaleTimeString()}] LINE: ${data}`;
            setRawLog(prev => [logEntry, ...prev].slice(0, 50));
            processIncoming(data, 'LINE');
        });

        // 2. Raw continuous listener for the debugger AND fallback parsing
        window.electronAPI.onSerialRaw((data) => {
            const { raw, hex } = data;
            setRawData(raw);

            // Add hex/ascii to debug log
            const logEntry = `[${new Date().toLocaleTimeString()}] HW: ${JSON.stringify(raw)} | HEX: [${hex}]`;
            setRawLog(prev => [logEntry, ...prev].slice(0, 50));

            // Append to rolling buffer to catch fragmented UIDs (e.g. "2B" then "375006")
            rollingBuffer.current = (rollingBuffer.current + raw).slice(-64); // Keep last 64 chars

            if (processIncoming(rollingBuffer.current, 'RAW')) {
                // Clear buffer once a UID is successfully parsed to avoid re-triggering on same data
                rollingBuffer.current = "";
            }
        });

        window.electronAPI.onSerialError((err) => {
            console.error('Serial Error event:', err);
            setIsConnected(false);
        });
    }, []);

    const listPorts = async () => {
        if (!window.electronAPI) return [];
        return window.electronAPI.listSerialPorts();
    };

    const connect = async (port: string, baudRate: number): Promise<boolean> => {
        if (!window.electronAPI) return false;
        try {
            const ok = await window.electronAPI.connectSerialPort({ path: port, baudRate });
            if (ok === true) {
                setIsConnected(true);
                setSelectedPort(port);
                setRawLog(prev => ["--- Connected to " + port + " ---", ...prev].slice(0, 50));
                return true;
            }
            return false;
        } catch {
            return false;
        }
    };

    const disconnect = async () => {
        if (!window.electronAPI) return;
        await window.electronAPI.disconnectSerialPort();
        setIsConnected(false);
        setSelectedPort("");
        setLastScan(null);
        setRawLog(prev => ["--- Disconnected ---", ...prev].slice(0, 50));
    };

    return (
        <SerialContext.Provider value={{ isConnected, selectedPort, lastScan, rawData, rawLog, connect, disconnect, listPorts }}>
            {children}
        </SerialContext.Provider>
    );
};

export const useSerial = () => {
    const ctx = useContext(SerialContext);
    if (!ctx) throw new Error("useSerial must be used within SerialProvider");
    return ctx;
};
