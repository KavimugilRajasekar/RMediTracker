import { useState } from "react";
import { Wifi, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateRfidUid } from "@/data/mockData";

interface RfidScannerProps {
  onScan: (uid: string) => void;
  isScanning: boolean;
  setIsScanning: (v: boolean) => void;
}

const RfidScanner = ({ onScan, isScanning, setIsScanning }: RfidScannerProps) => {
  const handleSimulateScan = (uid?: string) => {
    setIsScanning(true);
    setTimeout(() => {
      const scannedUid = uid || generateRfidUid();
      onScan(scannedUid);
      setIsScanning(false);
    }, 1500);
  };

  return (
    <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-6 text-center space-y-4">
      <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${isScanning ? "gradient-medical animate-pulse-soft" : "bg-secondary"}`}>
        <Wifi className={`h-8 w-8 ${isScanning ? "text-primary-foreground" : "text-muted-foreground"}`} />
      </div>
      
      {isScanning ? (
        <div className="space-y-2">
          <p className="text-sm font-medium text-primary">Scanning RFID Card...</p>
          <div className="mx-auto h-1 w-32 overflow-hidden rounded-full bg-primary/20">
            <div className="h-full animate-scan rounded-full bg-primary" />
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Place RFID card near the reader</p>
          <div className="flex gap-2 justify-center flex-wrap">
            <Button size="sm" onClick={() => handleSimulateScan("A1:B2:C3:D4")}>
              <Search className="h-3 w-3 mr-1" /> Scan Known Card
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleSimulateScan()}>
              Scan Unknown Card
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RfidScanner;
