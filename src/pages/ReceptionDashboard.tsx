import { useState, useCallback, useEffect, useRef } from "react";
import { Patient, Visit } from "@/types/patient";
import {
  getPatients, getVisits,
  addPatient, addVisit, updatePatient,
} from "@/lib/store";
import AppHeader from "@/components/AppHeader";
import RfidScanner from "@/components/RfidScanner";
import PatientRegistrationDialog from "@/components/PatientRegistrationDialog";
import StatusBadge from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Users, UserCheck, Search, CreditCard, AlertTriangle, X, UserPlus, RefreshCw } from "lucide-react";
import { useSerial } from "@/contexts/SerialContext";

const ReceptionDashboard = () => {
  const [patients, setPatients] = useState<Patient[]>(() => getPatients());
  const [visits, setVisits] = useState<Visit[]>(() => getVisits());
  const [isScanning, setIsScanning] = useState(false);
  const [scannedPatient, setScannedPatient] = useState<Patient | null>(null);
  const [scannedUid, setScannedUid] = useState<string>("");
  const [lastScanTime, setLastScanTime] = useState<number>(0);
  const [showRegister, setShowRegister] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { resetScanData } = useSerial();
  const clearTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ── New: Clear results when starting a new scan ──────────────────────────────
  const handleScanStart = useCallback(() => {
    if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
    setScannedUid("");
    setScannedPatient(null);
    resetScanData();
  }, [resetScanData]);

  // ── helpers to sync state + store ──────────────────────────────────────────
  const refresh = () => { setPatients(getPatients()); setVisits(getVisits()); };

  // ── Stats ───────────────────────────────────────────────────────────────────
  const todayVisits = visits.filter(v => new Date(v.arrivedAt).toDateString() === new Date().toDateString());
  const arrivedCount = todayVisits.filter(v => v.status === "Arrived").length;

  // ── RFID Scan ────────────────────────────────────────────────────────────────
  const handleScan = useCallback((uid: string) => {
    const cleanUid = uid.trim().toUpperCase();
    setScannedUid(cleanUid);
    setLastScanTime(Date.now());

    const allPatients = getPatients();
    // ONLY search by CURRENT rfidUid - old cards "vanish"
    const found = allPatients.find(p => p.rfidUid.toUpperCase() === cleanUid);

    if (found) {
      console.log('[Dashboard] Patient recognized:', found.firstName, found.lastName);
      setScannedPatient(found);
      toast.success(`Patient identified: ${found.firstName} ${found.lastName}`);
    } else {
      console.warn('[Dashboard] No patient found for UID:', cleanUid);
      setScannedPatient(null);
      toast.error(`Unrecognized Card: ${cleanUid}`);
    }

    // Auto-clear after 5 seconds ONLY if a patient was found
    if (found) {
      clearTimerRef.current = setTimeout(() => {
        setScannedUid("");
        setScannedPatient(null);
      }, 5000);
    }
  }, []);

  // ── Mark Arrived ─────────────────────────────────────────────────────────────
  const handleMarkArrived = (patientId: string) => {
    if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
    const existing = visits.find(v => v.patientId === patientId && v.status === "Arrived");
    if (existing) { toast.warning("Patient already marked as Arrived."); return; }
    const visit: Visit = { id: crypto.randomUUID(), patientId, status: "Arrived", arrivedAt: new Date().toISOString() };
    addVisit(visit);
    refresh();
    toast.success("Patient marked as Arrived and added to Doctor's queue.");
  };

  // ── Register ─────────────────────────────────────────────────────────────────
  const handleRegister = (patient: Patient) => {
    addPatient(patient);

    // Add visit immediately as well
    const visit: Visit = {
      id: crypto.randomUUID(),
      patientId: patient.patientId,
      status: "Arrived",
      arrivedAt: new Date().toISOString()
    };
    addVisit(visit);

    refresh();
    toast.success(`Patient ${patient.firstName} registered and checked in.`);
  };

  // ── Replace Card / Map UID ───────────────────────────────────────────────────
  const handleReplaceCard = (patient: Patient) => {
    if (!scannedUid) return;

    updatePatient(patient.patientId, {
      rfidUid: scannedUid,
      rfidHistory: [{ uid: scannedUid, issuedAt: new Date().toISOString() }], // Erase old history
    });

    refresh();
    setScannedPatient(getPatients().find(p => p.patientId === patient.patientId) || null);
    toast.success(`RFID card mapped to ${patient.firstName} ${patient.lastName}`);
  };

  // ── Search ───────────────────────────────────────────────────────────────────
  const filteredPatients = searchQuery
    ? patients.filter(p =>
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.rfidUid.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="mx-auto max-w-6xl p-6 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Patients", value: patients.length, icon: Users, color: "text-primary" },
            { label: "Today's Arrivals", value: todayVisits.length, icon: UserCheck, color: "text-info" },
            { label: "In Queue", value: arrivedCount, icon: CreditCard, color: "text-warning" },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label} className="shadow-card">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* RFID Scanner */}
          <div className="space-y-4">
            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">RFID Card Scanner</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <RfidScanner
                  onScan={handleScan}
                  onScanStart={handleScanStart}
                  isScanning={isScanning}
                  setIsScanning={setIsScanning}
                  disabled={!!scannedUid}
                />
              </CardContent>
            </Card>

            {/* Dedicated Scan Result Card */}
            {scannedUid && (
              <Card className="shadow-medical border-primary/30 border-2 overflow-hidden bg-card">
                <CardHeader className="pb-2 bg-primary/5 border-b border-primary/10">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-primary" />
                      Latest Scan Result
                    </CardTitle>
                    <div className="flex items-center gap-2 bg-background px-2 py-1 rounded-md border border-border shadow-sm">
                      <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                      <span className="font-mono text-sm font-bold text-foreground uppercase tracking-widest">{scannedUid}</span>
                      {/* Manual Clear Button */}
                      <button
                        onClick={() => { setScannedUid(""); setScannedPatient(null); if (clearTimerRef.current) clearTimeout(clearTimerRef.current); }}
                        className="ml-1 p-1 hover:bg-destructive/10 rounded-full transition-colors text-muted-foreground hover:text-destructive group/btn"
                        title="Clear Result"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  {/* Cooldown Progress Bar - Only for known patients */}
                  {scannedPatient && (
                    <div className="absolute bottom-0 left-0 h-1 bg-primary/20 w-full overflow-hidden">
                      <div
                        key={scannedUid + lastScanTime}
                        className="h-full bg-primary animate-cooldown"
                        style={{ animationDuration: '5s' }}
                      />
                    </div>
                  )}
                </CardHeader>
                <CardContent className="p-4 pt-6">
                  {scannedPatient ? (
                    <div className="space-y-4">
                      <div className="flex gap-4 items-start">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary font-bold text-xl border border-primary/20 shadow-inner">
                          {scannedPatient.firstName[0]}{scannedPatient.lastName[0]}
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-bold text-lg text-foreground leading-none">
                            {scannedPatient.firstName} {scannedPatient.lastName}
                          </h3>
                          <p className="text-xs text-muted-foreground font-medium bg-secondary/50 inline-block px-2 py-0.5 rounded">
                            ID: {scannedPatient.patientId} • Age {scannedPatient.age} • {scannedPatient.gender}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="h-2 w-2 rounded-full bg-success" />
                            <span className="text-[10px] font-black text-success uppercase tracking-[0.15em]">Verified Identity</span>
                          </div>
                        </div>
                      </div>

                      <Button
                        className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground shadow-medical transition-all active:scale-[0.98] font-bold text-base"
                        onClick={() => handleMarkArrived(scannedPatient.patientId)}
                      >
                        <UserCheck className="mr-2 h-5 w-5" />
                        Check In & Add to Queue
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="rounded-xl bg-destructive/5 border border-destructive/10 p-4 flex gap-4 items-center">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                          <AlertTriangle className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-destructive uppercase tracking-tight">Record Not Found</p>
                          <p className="text-[10px] text-destructive/70 leading-relaxed font-medium">
                            Scanning card <span className="font-mono font-bold bg-destructive/10 px-1 rounded">{scannedUid}</span>...
                          </p>
                          <p className="text-[10px] text-destructive/70 leading-relaxed font-medium mt-1">
                            This UID isn't registered. If this is a known patient, <span className="font-bold underline">Try scan by Scan Known Card</span> or search below.
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Button size="lg" onClick={() => setShowRegister(true)} className="font-bold h-12 shadow-sm">
                          <UserPlus className="h-4 w-4 mr-2" />
                          New Profile
                        </Button>
                        <Button size="lg" variant="outline" onClick={() => { setSearchQuery(""); toast.info("Search for a patient and click 'Map Card' below."); }} className="font-bold h-12 shadow-sm transition-all border-primary/20 hover:bg-primary/5 hover:border-primary/40">
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Replace Card
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Search & Patient List */}
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Patient Search</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, ID, or RFID..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {(searchQuery ? filteredPatients : patients).map(patient => {
                  const visit = visits.find(v => v.patientId === patient.patientId && v.status === "Arrived");
                  return (
                    <div key={patient.id} className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-secondary/50 transition-colors">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{patient.firstName} {patient.lastName}</p>
                        <p className="text-xs text-muted-foreground">{patient.patientId} • {patient.phone}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {scannedUid && !scannedPatient && (
                          <Button size="sm" variant="secondary" onClick={() => handleReplaceCard(patient)}>
                            <CreditCard className="h-3 w-3 mr-1" /> Map Card
                          </Button>
                        )}
                        {visit && <StatusBadge status="Arrived" />}
                        {!visit && (
                          <Button size="sm" variant="outline" onClick={() => handleMarkArrived(patient.patientId)}>
                            Check In
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
                {searchQuery && filteredPatients.length === 0 && (
                  <p className="py-8 text-center text-sm text-muted-foreground">No patients found.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Patient Queue */}
        <Card className="shadow-card border-primary/10">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
              Live Patient Queue
            </CardTitle>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider bg-secondary px-2 py-1 rounded">
              Today: {todayVisits.length}
            </span>
          </CardHeader>
          <CardContent>
            {todayVisits.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No visits recorded today.</p>
            ) : (
              <div className="space-y-2">
                {todayVisits.sort((a, b) => new Date(b.arrivedAt).getTime() - new Date(a.arrivedAt).getTime()).map(visit => {
                  const patient = patients.find(p => p.patientId === visit.patientId);
                  const arrivalTime = new Date(visit.arrivedAt);
                  const diffMinutes = Math.floor((new Date().getTime() - arrivalTime.getTime()) / 60000);

                  return (
                    <div key={visit.id} className="group flex items-center justify-between rounded-xl border border-border p-4 hover:border-primary/20 hover:bg-primary/5 transition-all">
                      <div className="flex gap-4 items-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground font-bold text-sm">
                          {patient ? `${patient.firstName[0]}${patient.lastName[0]}` : "?"}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                            {patient ? `${patient.firstName} ${patient.lastName}` : visit.patientId}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-muted-foreground font-medium">#{visit.patientId}</span>
                            <span className="text-[10px] text-muted-foreground">•</span>
                            <span className="text-[10px] text-muted-foreground font-medium">
                              {arrivalTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Wait Time</p>
                          <p className={`text-xs font-bold ${diffMinutes > 30 ? "text-destructive" : diffMinutes > 15 ? "text-warning" : "text-success"}`}>
                            {diffMinutes < 1 ? "Just now" : `${diffMinutes}m`}
                          </p>
                        </div>
                        <StatusBadge status={visit.status} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <PatientRegistrationDialog
        open={showRegister}
        onClose={() => setShowRegister(false)}
        onRegister={handleRegister}
        scannedUid={scannedUid}
      />
    </div >
  );
};

export default ReceptionDashboard;
