import { useState, useEffect, useRef } from "react";
import { Wifi, CreditCard, Bug, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSerial } from "@/contexts/SerialContext";

interface RfidScannerProps {
  onScan: (uid: string) => void;
  isScanning: boolean;
  setIsScanning: (v: boolean) => void;
}

const RfidScanner = ({ onScan, isScanning, setIsScanning }: RfidScannerProps) => {
  const { isConnected, lastScan, rawLog } = useSerial();
  const [showDebug, setShowDebug] = useState(false);
  const [lastRequestTime, setLastRequestTime] = useState(0);

  // Track whether we're actively waiting for the next card swipe
  const scanRequested = useRef(false);
  const [waitingLabel, setWaitingLabel] = useState<string>("");

  // ── When a real UID arrives from the COM port ─────────────────────────────
  useEffect(() => {
    // If no scan is requested or lastScan is null, do nothing
    if (!lastScan || !scanRequested.current) return;

    // Grace period check: 
    // Usually users tap and then click, or click while tapping. 
    // We allow a 2-second window for "buffered" scans to feel more natural.
    const GRACE_PERIOD_MS = 2000;
    const isFreshEnough = lastScan.timestamp >= (lastRequestTime - GRACE_PERIOD_MS);

    if (!isFreshEnough) {
      console.log('[Scanner] Skipping truly stale scan:', lastScan.uid, 'Age:', Date.now() - lastScan.timestamp, 'ms');
      return;
    }

    console.log('[Scanner] Captured scan:', lastScan.uid, 'Time Diff:', lastScan.timestamp - lastRequestTime, 'ms');

    // Stop waiting immediately to prevent double-captures from a single swipe
    scanRequested.current = false;
    setWaitingLabel("");

    // Visual feedback "Searching..." -> "Success!"
    setIsScanning(true); // Ensure pulse is visible
    const t = setTimeout(() => {
      onScan(lastScan.uid);
      setIsScanning(false);
    }, 600);
    return () => clearTimeout(t);
  }, [lastScan, lastRequestTime, onScan, setIsScanning]);

  // ── Start waiting for the next card swipe from the COM port ───────────────
  const requestScan = (label: string) => {
    if (!isConnected) return;
    // Set baseline time to ignore old buffered data
    setLastRequestTime(Date.now());
    scanRequested.current = true;
    setIsScanning(true);
    setWaitingLabel(label);
  };

  // Cancel waiting
  const cancelScan = () => {
    scanRequested.current = false;
    setIsScanning(false);
    setWaitingLabel("");
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-6 text-center space-y-4">
        {/* Icon */}
        <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-300 ${isScanning ? "gradient-medical animate-pulse-soft scale-105" : "bg-secondary"
          }`}>
          {isScanning
            ? <Wifi className="h-8 w-8 text-primary-foreground" />
            : <CreditCard className="h-8 w-8 text-muted-foreground" />
          }
        </div>

        {/* Status text */}
        {isScanning ? (
          <div className="space-y-2">
            <p className="text-sm font-medium text-primary">
              {waitingLabel || "Scanning RFID Card…"}
            </p>
            <div className="mx-auto h-1 w-32 overflow-hidden rounded-full bg-primary/20">
              <div className="h-full animate-scan rounded-full bg-primary" />
            </div>
            {/* Cancel */}
            <button
              onClick={cancelScan}
              className="text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {isConnected ? (
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                🟢 RFID reader connected — tap a button and scan
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Connect a COM port from the header to enable scanning
              </p>
            )}

            {/* ── Scan buttons — trigger real serial read ── */}
            <div className="flex gap-2 justify-center flex-wrap">
              <Button
                size="sm"
                onClick={() => requestScan("Waiting for card scan… (Known Patient)")}
                disabled={!isConnected}
                title={!isConnected ? "Connect a COM port first" : "Tap a registered card on the reader"}
              >
                <CreditCard className="h-3 w-3 mr-1" />
                Scan Known Card
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => requestScan("Waiting for card scan… (New/Unknown)")}
                disabled={!isConnected}
                title={!isConnected ? "Connect a COM port first" : "Tap any card to check if it's registered"}
              >
                <CreditCard className="h-3 w-3 mr-1" />
                Scan Unknown Card
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ── DEBUG PANEL ── */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <button
          onClick={() => setShowDebug(!showDebug)}
          className="flex w-full items-center justify-between p-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:bg-secondary/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Bug className="h-3.5 w-3.5 text-warning" />
            Serial Connection Debugger
          </div>
          {showDebug ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {showDebug && (
          <div className="border-t border-border bg-secondary/30 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase font-bold">Status</span>
                <span className={`font-mono text-xs font-bold ${isConnected ? "text-success" : "text-destructive"}`}>
                  {isConnected ? "CONNECTED" : "DISCONNECTED"}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-[10px] px-3 font-bold"
                onClick={() => window.electronAPI.pingSerialBridge()}
              >
                Test System Bridge
              </Button>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-border">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Live Hardware Stream</span>
              <div className="h-32 rounded border border-border bg-background p-2 font-mono text-[10px] overflow-y-auto space-y-1 select-text">
                {rawLog.length === 0 ? (
                  <p className="text-muted-foreground italic">No data received yet. Waiting for COM port input...</p>
                ) : (
                  rawLog.map((log, i) => (
                    <div key={i} className="flex gap-2">
                      <span className="text-muted-foreground opacity-50">[{rawLog.length - i}]</span>
                      <span className={log.includes('PONG') || log.startsWith('---') ? "text-primary font-bold" : "text-foreground"}>
                        {log}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
            <p className="text-[9px] text-muted-foreground italic leading-relaxed">
              * The bridge test sends a dummy signal from the system to this panel. If it works but scanning doesn't, the issue is with your hardware/serial cable.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RfidScanner;
