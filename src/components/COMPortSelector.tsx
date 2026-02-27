import { useState, useEffect } from "react";
import { useSerial } from "@/contexts/SerialContext";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Usb, RefreshCcw, Unplug, Loader2 } from "lucide-react";
import { toast } from "sonner";

const BAUD_RATES = ["9600", "19200", "38400", "57600", "115200"];

const COMPortSelector = () => {
    const { isConnected, selectedPort, rawData, connect, disconnect, listPorts } = useSerial();
    const [open, setOpen] = useState(false);
    const [ports, setPorts] = useState<{ path: string; friendlyName?: string }[]>([]);
    const [port, setPort] = useState("");
    const [baudRate, setBaudRate] = useState("9600");
    const [connecting, setConnecting] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Populate current port when dialog opens
    useEffect(() => {
        if (open) {
            if (selectedPort) setPort(selectedPort);
            handleRefresh();
        }
    }, [open]);

    const handleRefresh = async () => {
        setRefreshing(true);
        const available = await listPorts();
        setPorts(available);
        if (available.length > 0 && !port) setPort(available[0].path);
        setRefreshing(false);
    };

    const handleConnect = async () => {
        if (!port) { toast.error("Please select a COM port"); return; }
        setConnecting(true);
        const ok = await connect(port, parseInt(baudRate));
        setConnecting(false);
        if (ok) {
            toast.success(`Connected to ${port} @ ${baudRate} baud`);
            setOpen(false);
        } else {
            toast.error(`Failed to connect to ${port}`);
        }
    };

    const handleDisconnect = async () => {
        await disconnect();
        toast.info("Serial port disconnected");
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {/* Header button with live status dot */}
                <button
                    title="COM Port Settings"
                    className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                >
                    <Usb className="h-3.5 w-3.5" />
                    <span
                        className={`h-2 w-2 rounded-full ${isConnected ? "bg-green-500 shadow-[0_0_4px_1px_rgba(34,197,94,0.5)]" : "bg-muted-foreground/40"
                            }`}
                    />
                    <span className="hidden sm:inline">
                        {isConnected ? selectedPort : "COM Port"}
                    </span>
                </button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Usb className="h-4 w-4" />
                        RFID Serial Port
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 pt-1">
                    {/* Connected banner */}
                    {isConnected && (
                        <div className="flex items-center gap-2 rounded-lg bg-green-500/10 border border-green-500/20 px-3 py-2">
                            <span className="h-2 w-2 rounded-full bg-green-500" />
                            <span className="text-sm font-medium text-green-600 dark:text-green-400">
                                Connected — {selectedPort} @ {baudRate} baud
                            </span>
                        </div>
                    )}

                    {/* COM Port */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <Label>COM Port</Label>
                            <button
                                onClick={handleRefresh}
                                disabled={refreshing || isConnected}
                                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors"
                            >
                                <RefreshCcw className={`h-3 w-3 ${refreshing ? "animate-spin" : ""}`} />
                                Refresh
                            </button>
                        </div>
                        <Select value={port} onValueChange={setPort} disabled={isConnected}>
                            <SelectTrigger>
                                <SelectValue placeholder={ports.length === 0 ? "No ports found" : "Select port…"} />
                            </SelectTrigger>
                            <SelectContent>
                                {ports.length === 0 && (
                                    <SelectItem value="__none__" disabled>No COM ports detected</SelectItem>
                                )}
                                {ports.map(p => (
                                    <SelectItem key={p.path} value={p.path}>
                                        {p.friendlyName ? `${p.path} — ${p.friendlyName}` : p.path}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Baud Rate */}
                    <div className="space-y-1.5">
                        <Label>Baud Rate</Label>
                        <Select value={baudRate} onValueChange={setBaudRate} disabled={isConnected}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {BAUD_RATES.map(b => (
                                    <SelectItem key={b} value={b}>{b}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">Default: 9600 (matches RFID reader)</p>
                    </div>

                    {/* Live data preview when connected */}
                    {isConnected && (
                        <div className="rounded-md border border-border bg-secondary/50 p-3 space-y-1">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Live Input</p>
                            <p className="font-mono text-xs break-all min-h-[1.5rem]">
                                {rawData || <span className="text-muted-foreground italic">Waiting for data…</span>}
                            </p>
                        </div>
                    )}

                    {/* Action button */}
                    {!isConnected ? (
                        <Button className="w-full" onClick={handleConnect} disabled={connecting || ports.length === 0}>
                            {connecting
                                ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Connecting…</>
                                : <><Usb className="h-4 w-4 mr-2" />Connect</>
                            }
                        </Button>
                    ) : (
                        <Button variant="destructive" className="w-full" onClick={handleDisconnect}>
                            <Unplug className="h-4 w-4 mr-2" />
                            Disconnect
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default COMPortSelector;
