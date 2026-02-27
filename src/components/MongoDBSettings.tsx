import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Database, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { connectMongo, disconnectMongo, isMongoConnected } from "@/lib/mongodb";

export type MongoStatus = "disconnected" | "connecting" | "connected" | "error";

interface MongoDBSettingsProps {
    onStatusChange?: (status: MongoStatus) => void;
}

const MongoDBSettings = ({ onStatusChange }: MongoDBSettingsProps) => {
    const [open, setOpen] = useState(false);
    const [uri, setUri] = useState("mongodb://localhost:27017");
    const [dbName, setDbName] = useState("rmeditracker");
    const [status, setStatus] = useState<MongoStatus>("disconnected");
    const [errorMsg, setErrorMsg] = useState("");

    // Check connection status on mount
    useEffect(() => {
        isMongoConnected().then((connected) => {
            const s: MongoStatus = connected ? "connected" : "disconnected";
            setStatus(s);
            onStatusChange?.(s);
        });
    }, []);

    const handleConnect = async () => {
        setStatus("connecting");
        setErrorMsg("");
        onStatusChange?.("connecting");
        const result = await connectMongo(uri.trim(), dbName.trim());
        if (result.ok) {
            setStatus("connected");
            onStatusChange?.("connected");
            setOpen(false);
        } else {
            setStatus("error");
            setErrorMsg(result.error || "Connection failed");
            onStatusChange?.("error");
        }
    };

    const handleDisconnect = async () => {
        await disconnectMongo();
        setStatus("disconnected");
        setErrorMsg("");
        onStatusChange?.("disconnected");
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button
                    title="MongoDB Settings"
                    className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors hover:bg-secondary"
                >
                    <Database className="h-3.5 w-3.5 text-muted-foreground" />
                    <StatusDot status={status} />
                    <span className="text-muted-foreground hidden sm:inline">
                        {status === "connected" ? "DB Connected" : "DB"}
                    </span>
                </button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Database className="h-4 w-4" />
                        MongoDB Connection
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 pt-2">
                    {/* Status Banner */}
                    {status === "connected" && (
                        <div className="flex items-center gap-2 rounded-lg bg-success/10 border border-success/20 px-3 py-2">
                            <CheckCircle2 className="h-4 w-4 text-success" />
                            <span className="text-sm text-success font-medium">Connected to MongoDB</span>
                        </div>
                    )}
                    {status === "error" && (
                        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2">
                            <XCircle className="h-4 w-4 text-destructive" />
                            <span className="text-sm text-destructive">{errorMsg}</span>
                        </div>
                    )}

                    {/* URI */}
                    <div className="space-y-1.5">
                        <Label htmlFor="mongo-uri">Connection URI</Label>
                        <Input
                            id="mongo-uri"
                            value={uri}
                            onChange={(e) => setUri(e.target.value)}
                            placeholder="mongodb://localhost:27017"
                            onKeyDown={(e) => e.key === "Enter" && handleConnect()}
                            disabled={status === "connecting" || status === "connected"}
                        />
                    </div>

                    {/* DB Name */}
                    <div className="space-y-1.5">
                        <Label htmlFor="mongo-db">Database Name</Label>
                        <Input
                            id="mongo-db"
                            value={dbName}
                            onChange={(e) => setDbName(e.target.value)}
                            placeholder="rmeditracker"
                            onKeyDown={(e) => e.key === "Enter" && handleConnect()}
                            disabled={status === "connecting" || status === "connected"}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-1">
                        {status !== "connected" ? (
                            <Button
                                className="flex-1"
                                onClick={handleConnect}
                                disabled={status === "connecting" || !uri.trim()}
                            >
                                {status === "connecting" ? (
                                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Connecting…</>
                                ) : (
                                    "Connect"
                                )}
                            </Button>
                        ) : (
                            <Button
                                className="flex-1"
                                variant="destructive"
                                onClick={handleDisconnect}
                            >
                                Disconnect
                            </Button>
                        )}
                    </div>

                    <p className="text-xs text-muted-foreground">
                        Make sure MongoDB is running locally. Default: <code>mongodb://localhost:27017</code>
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
};

const StatusDot = ({ status }: { status: MongoStatus }) => {
    const colorMap: Record<MongoStatus, string> = {
        connected: "bg-green-500",
        connecting: "bg-yellow-400 animate-pulse",
        disconnected: "bg-muted-foreground/40",
        error: "bg-destructive",
    };
    return <span className={`inline-block h-2 w-2 rounded-full ${colorMap[status]}`} />;
};

export default MongoDBSettings;
