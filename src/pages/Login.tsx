import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types/patient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Stethoscope, ClipboardList, Heart } from "lucide-react";

const Login = () => {
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [name, setName] = useState("");

  const handleLogin = () => {
    if (selectedRole && name.trim()) {
      login(selectedRole, name.trim());
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl gradient-medical shadow-medical">
            <Heart className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Rural Health Clinic
          </h1>
          <p className="text-sm text-muted-foreground">
            RFID-Based Healthcare Management System
          </p>
        </div>

        {/* Role Selection */}
        <div className="space-y-3">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Select your role
          </Label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setSelectedRole("reception")}
              className={`group relative flex flex-col items-center gap-3 rounded-xl border-2 p-6 transition-all duration-200 ${
                selectedRole === "reception"
                  ? "border-primary bg-primary/5 shadow-medical"
                  : "border-border bg-card hover:border-primary/40 hover:shadow-card"
              }`}
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${
                selectedRole === "reception" ? "gradient-medical" : "bg-secondary"
              }`}>
                <ClipboardList className={`h-6 w-6 ${selectedRole === "reception" ? "text-primary-foreground" : "text-muted-foreground"}`} />
              </div>
              <span className={`text-sm font-semibold ${selectedRole === "reception" ? "text-primary" : "text-foreground"}`}>
                Reception
              </span>
            </button>

            <button
              onClick={() => setSelectedRole("doctor")}
              className={`group relative flex flex-col items-center gap-3 rounded-xl border-2 p-6 transition-all duration-200 ${
                selectedRole === "doctor"
                  ? "border-primary bg-primary/5 shadow-medical"
                  : "border-border bg-card hover:border-primary/40 hover:shadow-card"
              }`}
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${
                selectedRole === "doctor" ? "gradient-medical" : "bg-secondary"
              }`}>
                <Stethoscope className={`h-6 w-6 ${selectedRole === "doctor" ? "text-primary-foreground" : "text-muted-foreground"}`} />
              </div>
              <span className={`text-sm font-semibold ${selectedRole === "doctor" ? "text-primary" : "text-foreground"}`}>
                Doctor
              </span>
            </button>
          </div>
        </div>

        {/* Name + Login */}
        {selectedRole && (
          <Card className="shadow-card border-border">
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Your Name</Label>
                <Input
                  id="name"
                  placeholder={selectedRole === "doctor" ? "Dr. Smith" : "Staff name"}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />
              </div>
              <Button
                className="w-full"
                onClick={handleLogin}
                disabled={!name.trim()}
              >
                Sign In as {selectedRole === "reception" ? "Reception" : "Doctor"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Login;
