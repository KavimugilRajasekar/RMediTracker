import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, Heart } from "lucide-react";
import COMPortSelector from "@/components/COMPortSelector";

const AppHeader = () => {
  const { role, userName, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="flex h-14 items-center justify-between px-6">
        {/* Left: Logo + role */}
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-medical">
            <Heart className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-foreground leading-none">Rural Health Clinic</h1>
            <p className="text-xs text-muted-foreground capitalize">{role} Dashboard</p>
          </div>
        </div>

        {/* Right: COM port selector, user name, sign out */}
        <div className="flex items-center gap-2">
          <COMPortSelector />
          <span className="text-sm text-muted-foreground pl-2 border-l border-border">{userName}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="text-muted-foreground hover:text-destructive"
          >
            <LogOut className="h-4 w-4 mr-1" />
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
