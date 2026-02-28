import { useState, useEffect, useRef } from "react";
import { Wifi, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSerial } from "@/contexts/SerialContext";

interface RfidScannerProps {
  onScan: (uid: string) => void;
  onScanStart?: () => void;
  isScanning: boolean;
  setIsScanning: (v: boolean) => void;
  disabled?: boolean;
}

const RfidScanner = ({ onScan, onScanStart, isScanning, setIsScanning, disabled }: RfidScannerProps) => {
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
    const GRACE_PERIOD_MS = 5000;
    const isFreshEnough = lastScan.timestamp >= (lastRequestTime - GRACE_PERIOD_MS);

    if (!isFreshEnough) {
      console.log('[Scanner] Skipping stale scan:', lastScan.uid, 'Age:', Date.now() - lastScan.timestamp, 'ms');
      return;
    }

    console.log('[Scanner] Valid scan detected:', lastScan.uid);

    // Stop waiting and clear state immediately
    scanRequested.current = false;
    setWaitingLabel("");
    setIsScanning(false);

    // Trigger the scan result in the parent dashboard
    onScan(lastScan.uid);
  }, [lastScan, lastRequestTime, onScan, setIsScanning]);

  // ── Start waiting for the next card swipe from the COM port ───────────────
  const requestScan = (label: string) => {
    if (!isConnected) return;
    console.log('[Scanner] Scan requested:', label);

    onScanStart?.();
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
    <div className={`space-y-4 transition-all duration-500 ${disabled ? "opacity-40 grayscale pointer-events-none cursor-not-allowed scale-[0.98]" : ""}`}>
      <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-6 text-center space-y-4">
        {/* Icon with Ripple Effect */}
        <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
          {isScanning && (
            <div className="absolute inset-0 animate-ping rounded-full bg-primary/20 duration-1000" />
          )}
          <div className={`relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-500 ${isScanning
            ? "gradient-medical shadow-medical scale-110 rotate-3"
            : "bg-secondary grayscale opacity-60"
            }`}>
            {isScanning
              ? <Wifi className="h-8 w-8 text-primary-foreground animate-pulse" />
              : <CreditCard className="h-8 w-8 text-muted-foreground" />
            }
          </div>
        </div>

        {/* Status text */}
        {isScanning ? (
          <div className="space-y-3 animate-in fade-in zoom-in-95 duration-300">
            <p className="text-xs font-bold text-primary tracking-widest uppercase">
              {waitingLabel || "TAP RFID CARD NOW"}
            </p>
            <div className="mx-auto flex gap-1 justify-center">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce opacity-80"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
            {/* Cancel Button */}
            <button
              onClick={cancelScan}
              className="mt-2 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-destructive border border-border/60 rounded-full hover:border-destructive/30 transition-all active:scale-95"
            >
              Cancel Scan
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
            <div className="flex justify-center">
              <Button
                size="lg"
                className="w-full max-w-xs h-12 shadow-sm font-bold text-base"
                onClick={() => requestScan("Waiting for RFID card swipe...")}
                disabled={!isConnected || disabled}
                title={!isConnected ? "Connect a COM port first" : disabled ? "Scan result active" : "Tap any RFID card on the reader"}
              >
                <Wifi className="h-5 w-5 mr-2" />
                Scan
              </Button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default RfidScanner;
