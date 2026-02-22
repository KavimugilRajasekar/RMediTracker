import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { RefreshCcw, Unplug, Usb } from "lucide-react";

declare global {
    interface Window {
        electronAPI: {
            listSerialPorts: () => Promise<any[]>;
            connectSerialPort: (options: { path: string; baudRate: number }) => Promise<boolean | string>;
            disconnectSerialPort: () => Promise<boolean | string>;
            onSerialData: (callback: (data: string) => void) => void;
            onSerialError: (callback: (err: string) => void) => void;
        };
    }
}

const SerialPortManager = () => {
    const [ports, setPorts] = useState<any[]>([]);
    const [selectedPort, setSelectedPort] = useState<string>('');
    const [baudRate, setBaudRate] = useState<string>('9600');
    const [isConnected, setIsConnected] = useState(false);
    const [lastData, setLastData] = useState<string>('');

    const scanPorts = async () => {
        if (!window.electronAPI) {
            toast.error("Not running in Electron environment");
            return;
        }
        const availablePorts = await window.electronAPI.listSerialPorts();
        setPorts(availablePorts);
        if (availablePorts.length > 0 && !selectedPort) {
            setSelectedPort(availablePorts[0].path);
        }
    };

    useEffect(() => {
        scanPorts();

        if (window.electronAPI) {
            window.electronAPI.onSerialData((data) => {
                setLastData(data);
                console.log("Serial Data:", data);
            });

            window.electronAPI.onSerialError((err) => {
                toast.error(`Serial Error: ${err}`);
                setIsConnected(false);
            });
        }
    }, []);

    const handleConnect = async () => {
        if (!selectedPort) {
            toast.error("Please select a port");
            return;
        }

        try {
            const result = await window.electronAPI.connectSerialPort({
                path: selectedPort,
                baudRate: parseInt(baudRate),
            });

            if (result === true) {
                setIsConnected(true);
                toast.success(`Connected to ${selectedPort}`);
            } else {
                toast.error(`Connection failed: ${result}`);
            }
        } catch (error: any) {
            toast.error(`Error: ${error}`);
        }
    };

    const handleDisconnect = async () => {
        try {
            await window.electronAPI.disconnectSerialPort();
            setIsConnected(false);
            toast.info("Disconnected");
        } catch (error) {
            toast.error("Failed to disconnect");
        }
    };

    return (
        <Card className="w-full max-w-md mx-auto mt-8">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Usb className="w-5 h-5 text-blue-500" />
                    USB Serial Port Manager
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex gap-2">
                    <div className="flex-1">
                        <label className="text-xs font-medium text-gray-500 mb-1 block">Available Ports</label>
                        <Select value={selectedPort} onValueChange={setSelectedPort} disabled={isConnected}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Port" />
                            </SelectTrigger>
                            <SelectContent>
                                {ports.map((port) => (
                                    <SelectItem key={port.path} value={port.path}>
                                        {port.friendlyName || port.path}
                                    </SelectItem>
                                ))}
                                {ports.length === 0 && <SelectItem value="none" disabled>No ports found</SelectItem>}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={scanPorts}
                        disabled={isConnected}
                        className="mt-5"
                    >
                        <RefreshCcw className="w-4 h-4" />
                    </Button>
                </div>

                <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Baud Rate</label>
                    <Select value={baudRate} onValueChange={setBaudRate} disabled={isConnected}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="9600">9600</SelectItem>
                            <SelectItem value="115200">115200</SelectItem>
                            <SelectItem value="38400">38400</SelectItem>
                            <SelectItem value="19200">19200</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex gap-2">
                    {!isConnected ? (
                        <Button className="w-full gap-2" onClick={handleConnect}>
                            <Usb className="w-4 h-4" />
                            Connect
                        </Button>
                    ) : (
                        <Button variant="destructive" className="w-full gap-2" onClick={handleDisconnect}>
                            <Unplug className="w-4 h-4" />
                            Disconnect
                        </Button>
                    )}
                </div>

                {isConnected && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-md border border-gray-200">
                        <span className="text-xs font-bold text-gray-400 uppercase">Input Stream</span>
                        <div className="mt-1 font-mono text-sm break-all h-20 overflow-y-auto">
                            {lastData || "Waiting for data..."}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default SerialPortManager;
