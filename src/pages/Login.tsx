import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types/patient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Stethoscope, ClipboardList, Heart, Eye, EyeOff, AlertCircle } from "lucide-react";

const Login = () => {
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setUsername("");
    setPassword("");
    setError("");
  };

  const handleLogin = () => {
    if (!selectedRole) return;
    if (!username.trim() || !password) {
      setError("Please enter both username and password.");
      return;
    }
    const ok = login(selectedRole, username.trim(), password);
    if (!ok) {
      setError("Invalid credentials. Please try again.");
      setPassword("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin();
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
              onClick={() => handleRoleSelect("reception")}
              className={`group relative flex flex-col items-center gap-3 rounded-xl border-2 p-6 transition-all duration-200 ${selectedRole === "reception"
                  ? "border-primary bg-primary/5 shadow-medical"
                  : "border-border bg-card hover:border-primary/40 hover:shadow-card"
                }`}
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${selectedRole === "reception" ? "gradient-medical" : "bg-secondary"
                }`}>
                <ClipboardList className={`h-6 w-6 ${selectedRole === "reception" ? "text-primary-foreground" : "text-muted-foreground"}`} />
              </div>
              <span className={`text-sm font-semibold ${selectedRole === "reception" ? "text-primary" : "text-foreground"}`}>
                Reception
              </span>
            </button>

            <button
              onClick={() => handleRoleSelect("doctor")}
              className={`group relative flex flex-col items-center gap-3 rounded-xl border-2 p-6 transition-all duration-200 ${selectedRole === "doctor"
                  ? "border-primary bg-primary/5 shadow-medical"
                  : "border-border bg-card hover:border-primary/40 hover:shadow-card"
                }`}
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${selectedRole === "doctor" ? "gradient-medical" : "bg-secondary"
                }`}>
                <Stethoscope className={`h-6 w-6 ${selectedRole === "doctor" ? "text-primary-foreground" : "text-muted-foreground"}`} />
              </div>
              <span className={`text-sm font-semibold ${selectedRole === "doctor" ? "text-primary" : "text-foreground"}`}>
                Doctor
              </span>
            </button>
          </div>
        </div>

        {/* Credentials Form */}
        {selectedRole && (
          <Card className="shadow-card border-border">
            <CardContent className="pt-6 space-y-4">

              {/* Username */}
              <div className="space-y-1.5">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder={selectedRole === "doctor" ? "Doctor" : "Reception"}
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setError(""); }}
                  onKeyDown={handleKeyDown}
                  autoComplete="username"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    onKeyDown={handleKeyDown}
                    autoComplete="current-password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 text-destructive" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {/* Submit */}
              <Button
                className="w-full"
                onClick={handleLogin}
                disabled={!username.trim() || !password}
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
