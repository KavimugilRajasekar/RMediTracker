import { useState, useEffect, useCallback } from "react";
import { Minus, Square, X, Maximize2 } from "lucide-react";

const isElectron = !!(window as any).electronAPI;

export function TitleBar() {
    const [isMaximized, setIsMaximized] = useState(false);

    const checkMaximized = useCallback(async () => {
        if (!isElectron) return;
        const maximized = await (window as any).electronAPI.isMaximized();
        setIsMaximized(maximized);
    }, []);

    useEffect(() => {
        checkMaximized();
        // Poll every 300ms to sync maximize state since Electron doesn't push events via our bridge
        const interval = setInterval(checkMaximized, 300);
        return () => clearInterval(interval);
    }, [checkMaximized]);

    const handleMinimize = () => {
        if (isElectron) (window as any).electronAPI.minimizeWindow();
    };

    const handleMaximize = async () => {
        if (isElectron) {
            await (window as any).electronAPI.maximizeWindow();
            setIsMaximized((prev) => !prev);
        }
    };

    const handleClose = () => {
        if (isElectron) (window as any).electronAPI.closeWindow();
    };

    return (
        <div
            className="title-bar"
            style={{
                // Allow dragging the title bar to move the window
                WebkitAppRegion: "drag",
            } as React.CSSProperties}
        >
            {/* App Icon + Name */}
            <div className="title-bar__left">
                <div className="title-bar__icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path
                            d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                            stroke="#60a5fa"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>
                <span className="title-bar__title">RMediTracker</span>
            </div>

            {/* Window Controls — must NOT be draggable */}
            <div
                className="title-bar__controls"
                style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
            >
                {/* Minimize */}
                <button
                    className="title-bar__btn title-bar__btn--minimize"
                    onClick={handleMinimize}
                    title="Minimize"
                >
                    <Minus size={12} />
                </button>

                {/* Maximize / Restore */}
                <button
                    className="title-bar__btn title-bar__btn--maximize"
                    onClick={handleMaximize}
                    title={isMaximized ? "Restore" : "Maximize"}
                >
                    {isMaximized ? <Square size={11} /> : <Maximize2 size={11} />}
                </button>

                {/* Close */}
                <button
                    className="title-bar__btn title-bar__btn--close"
                    onClick={handleClose}
                    title="Close"
                >
                    <X size={12} />
                </button>
            </div>
        </div>
    );
}
