import { useState, useEffect, useRef } from "react";
import { Patient, Visit, Consultation } from "@/types/patient";
import {
  getPatients, getVisits, getConsultations,
  addConsultation, updateVisit,
} from "@/lib/store";
import { useSerial } from "@/contexts/SerialContext";
import AppHeader from "@/components/AppHeader";
import ConsultationDialog from "@/components/ConsultationDialog";
import StatusBadge from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Search, Users, Clock, CheckCircle2, AlertCircle, CreditCard, X,
  Stethoscope, History, Calendar, ExternalLink, RefreshCw, LogOut,
  Bug, ChevronDown
} from "lucide-react";

const DoctorDashboard = () => {
  const [patients] = useState<Patient[]>(() => getPatients());
  const [visits, setVisits] = useState<Visit[]>(() => getVisits());
  const [consultations, setConsultations] = useState<Consultation[]>(() => getConsultations());
  const [selectedVisit, setSelectedVisit] = useState<{ visit: Visit; patient: Patient } | null>(null);

  // ── RFID scan state ──────────────────────────────────────────────────────────
  const [scanMode, setScanMode] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [waitingForScan, setWaitingForScan] = useState(false);
  const [lastRequestTime, setLastRequestTime] = useState(0); // For "at that time" check
  const [foundPatient, setFoundPatient] = useState<{ visit: Visit, patient: Patient } | null>(null);
  const [notFound, setNotFound] = useState(false);
  const highlightRef = useRef<string | null>(null);          // highlighted visit ID

  const { isConnected, lastScan, rawLog } = useSerial();

  // ── Derived ──────────────────────────────────────────────────────────────────
  const arrivedVisits = visits.filter(v => v.status === "Arrived");
  const completedToday = visits.filter(v => {
    const today = new Date().toDateString();
    return v.status === "Completed" && v.completedAt && new Date(v.completedAt).toDateString() === today;
  });

  // ── Triggered scan when serial UID arrives ────────────────────────────────
  useEffect(() => {
    if (!waitingForScan || !lastScan) return;

    console.log('[Scanner] UID arrived:', lastScan.uid);
    console.log('[Scanner] TS vs ReqTime:', lastScan.timestamp, lastRequestTime);

    // "At that time" check: ignore if data arrived before the button was pressed
    if (lastScan.timestamp < lastRequestTime) {
      console.log('[Scanner] Skipping stale scan');
      return;
    }

    console.log('[Scanner] Valid fresh scan! Capturing...');
    // Once we get FRESH data, stop waiting (one-shot)
    setWaitingForScan(false);
    performScan(lastScan.uid);
  }, [lastScan, waitingForScan, lastRequestTime]);

  const startWaiting = () => {
    setLastRequestTime(Date.now());
    setWaitingForScan(true);
    setFoundPatient(null);
    setNotFound(false);
  };

  // ── Core scan logic ──────────────────────────────────────────────────────────
  const performScan = (uid: string) => {
    setScanning(true);
    setFoundPatient(null);
    setNotFound(false);

    // Short delay for visual feedback
    setTimeout(() => {
      const visit = arrivedVisits.find(v => {
        const p = patients.find(pat => pat.patientId === v.patientId);
        return p?.rfidUid === uid;
      });

      if (visit) {
        const patient = patients.find(p => p.patientId === visit.patientId)!;
        setFoundPatient({ visit, patient });
        highlightRef.current = visit.id;
        toast.success(`Patient identified: ${patient.firstName}`);
        // Scroll to the patient in the queue
        const el = document.getElementById(`visit-${visit.id}`);
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        setNotFound(true);
        toast.error("No patient found in current queue for this card");
      }
      setScanning(false);
    }, 800);
  };

  const handleSimulateScan = () => {
    // PT-2024-001 (Ramesh) has UID A1B2C3D4 in mockData
    performScan("A1B2C3D4");
  };

  const closeScan = () => {
    setScanMode(false);
    setFoundPatient(null);
    setNotFound(false);
    highlightRef.current = null;
  };

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleOpenConsultation = (visit: Visit) => {
    const patient = patients.find(p => p.patientId === visit.patientId);
    if (patient) {
      setSelectedVisit({ visit, patient });
    }
  };

  const handleSaveConsultation = (data: any) => {
    const newConsultation: Consultation = {
      id: `c-${Date.now()}`,
      visitId: selectedVisit!.visit.id,
      patientId: selectedVisit!.patient.patientId,
      ...data,
      createdAt: new Date().toISOString(),
    };

    addConsultation(newConsultation);
    updateVisit(selectedVisit!.visit.id, { status: "Completed", completedAt: new Date().toISOString() });

    setConsultations([...getConsultations()]);
    setVisits([...getVisits()]);
    setSelectedVisit(null);
    toast.success("Consultation saved successfully");
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="container mx-auto p-4 pt-20 pb-32 space-y-6">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Doctor Dashboard</h1>
            <p className="text-muted-foreground italic">OPD Department • Community Health Center</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">Dr. Rajasekar</p>
              <p className="text-xs text-muted-foreground">General Physician</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
              <Users className="h-5 w-5 text-primary" />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="shadow-sm border-l-4 border-l-warning">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Waiting Queue</p>
                  <h3 className="text-2xl font-bold">{arrivedVisits.length}</h3>
                </div>
                <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-l-4 border-l-success">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Today Completed</p>
                  <h3 className="text-2xl font-bold">{completedToday.length}</h3>
                </div>
                <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-l-4 border-l-primary">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg. Time / Patient</p>
                  <h3 className="text-2xl font-bold">12m</h3>
                </div>
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-l-4 border-l-medical-accent">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">System Status</p>
                  <h3 className="text-2xl font-bold text-success font-mono">ACTIVE</h3>
                </div>
                <div className="h-10 w-10 rounded-full bg-medical-accent/10 flex items-center justify-center">
                  <ExternalLink className="h-5 w-5 text-medical-accent" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content: Scanning and Diagnostics */}
          <div className="lg:col-span-1 space-y-6">
            {scanMode && (
              <Card className="border-primary/50 shadow-md animate-in slide-in-from-top duration-300">
                <CardHeader className="pb-2 space-y-0">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-primary" />
                      RFID Patient Search
                    </CardTitle>
                    <button onClick={closeScan} className="text-muted-foreground hover:text-foreground">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Scanner visual */}
                  <div className="flex flex-col items-center gap-3 py-4">
                    <div className={`flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-300 ${(scanning || waitingForScan) ? "gradient-medical animate-pulse scale-110" : "bg-secondary"
                      }`}>
                      {waitingForScan ? (
                        <RefreshCw className="h-8 w-8 text-primary animate-spin-slow" />
                      ) : (
                        <CreditCard className={`h-8 w-8 ${(scanning || waitingForScan) ? "text-primary-foreground" : "text-muted-foreground"}`} />
                      )}
                    </div>

                    {waitingForScan ? (
                      <div className="space-y-1 text-center">
                        <p className="text-sm font-medium text-primary">Ready to Read Card…</p>
                        <p className="text-[10px] text-muted-foreground italic">Place card near the scanner now</p>
                      </div>
                    ) : scanning ? (
                      <div className="space-y-1 text-center">
                        <p className="text-sm font-medium text-primary">Processing RFID Data…</p>
                        <div className="mx-auto h-1 w-32 overflow-hidden rounded-full bg-primary/20">
                          <div className="h-full animate-scan rounded-full bg-primary" />
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <p className="text-xs text-muted-foreground text-center">
                          {isConnected
                            ? "🟢 Reader Ready"
                            : "Connect Reader in Header"}
                        </p>
                        {isConnected && !foundPatient && (
                          <Button size="sm" variant="outline" className="h-8 px-4 font-bold border-primary/30 text-primary hover:bg-primary/5" onClick={startWaiting}>
                            Tap to Start Scanner
                          </Button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Result: found */}
                  {foundPatient && (
                    <div className="rounded-lg bg-success/10 border border-success/20 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold uppercase tracking-wide text-success">Patient found ✓</p>
                        <button
                          onClick={startWaiting}
                          className="text-[10px] text-primary hover:underline font-bold"
                        >
                          Scan Another
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-foreground">
                            {foundPatient.patient.firstName} {foundPatient.patient.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {foundPatient.patient.patientId} • Age {foundPatient.patient.age}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => {
                            handleOpenConsultation(foundPatient.visit);
                            closeScan();
                          }}
                        >
                          <Stethoscope className="h-3 w-3 mr-1" /> Consult
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Result: not found */}
                  {notFound && !scanning && !waitingForScan && (
                    <div className="rounded-lg bg-warning/10 border border-warning/20 p-3 text-center space-y-2">
                      <p className="text-sm text-foreground font-medium">No record found for this card.</p>
                      <Button size="sm" variant="ghost" className="text-[10px] h-7 underline" onClick={() => setWaitingForScan(true)}>
                        Try Again
                      </Button>
                    </div>
                  )}

                  <div className="pt-2 border-t border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1.5 px-1">
                        <Bug className="h-3 w-3" /> Live Hardware output
                      </span>
                      <button
                        onClick={() => window.electronAPI.pingSerialBridge()}
                        className="text-[9px] px-2 py-0.5 rounded border border-border hover:bg-secondary transition-colors"
                      >
                        Test Bridge
                      </button>
                    </div>

                    <div className="h-32 rounded border border-border bg-secondary/20 p-2 font-mono text-[9px] overflow-y-auto space-y-1 select-text">
                      {rawLog.length === 0 ? (
                        <p className="text-muted-foreground italic">Connect COM port to see data...</p>
                      ) : (
                        rawLog.map((log, i) => (
                          <div key={i} className="flex gap-2">
                            <span className="text-muted-foreground opacity-50">[{rawLog.length - i}]</span>
                            <span className={log.startsWith('---') ? "text-primary font-bold" : "text-foreground"}>
                              {log}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Simulate button */}
                  <Button variant="outline" size="sm" className="w-full h-8 text-[10px] mt-4 opacity-50 hover:opacity-100" onClick={handleSimulateScan}>
                    Simulate Scan for UI testing
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* If scan mode is not open, show instructions */}
            {!scanMode && (
              <Card className="bg-primary/5 border-dashed">
                <CardContent className="pt-6 text-center space-y-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <CreditCard className="h-6 w-6 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold">RFID Quick Scan</p>
                    <p className="text-xs text-muted-foreground">Scan a patient's card to find them in the queue instantly.</p>
                  </div>
                  <Button size="sm" className="w-full" onClick={() => setScanMode(true)}>Open Scan Panel</Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column: Patient Queue */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-card overflow-hidden">
              <CardHeader className="bg-secondary/30 pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="h-4 w-4 text-warning" />
                    Patient Queue ({arrivedVisits.length})
                  </CardTitle>
                  <Button
                    size="sm"
                    variant={scanMode ? "default" : "outline"}
                    onClick={() => { setScanMode(v => !v); setFoundPatient(null); setNotFound(false); }}
                    className="gap-1.5"
                    disabled={!isConnected}
                    title={!isConnected ? "Connect a COM port from the header first" : ""}
                  >
                    <CreditCard className="h-3.5 w-3.5" />
                    {scanMode ? "Close Scan" : "Scan Card"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {arrivedVisits.length === 0 ? (
                  <div className="py-16 text-center space-y-2">
                    <CheckCircle2 className="h-10 w-10 mx-auto text-success/50" />
                    <p className="text-sm text-muted-foreground">No patients in queue. All caught up!</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {arrivedVisits.map((visit, index) => {
                      const patient = patients.find(p => p.patientId === visit.patientId)!;
                      const isHighlighted = highlightRef.current === visit.id;

                      return (
                        <div
                          key={visit.id}
                          id={`visit-${visit.id}`}
                          className={`group p-4 flex items-center justify-between transition-all duration-300 ${isHighlighted ? "bg-primary/5 ring-2 ring-primary ring-inset" : "hover:bg-secondary/50"
                            }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex flex-col items-center">
                              <span className="text-xs font-bold text-muted-foreground">#{index + 1}</span>
                              <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center font-bold text-sm">
                                {patient.firstName[0]}{patient.lastName[0]}
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-bold text-foreground">
                                  {patient.firstName} {patient.lastName}
                                </p>
                                <StatusBadge status={visit.status} />
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {patient.patientId} • {patient.gender}, {patient.age}y
                              </p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">
                                Arrived: {new Date(visit.arrivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                          <Button size="sm" className="shadow-sm" onClick={() => handleOpenConsultation(visit)}>
                            Consult
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recently Completed */}
            <Card className="shadow-card border-none bg-secondary/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
                  <CheckCircle2 className="h-4 w-4" />
                  Completed Today ({completedToday.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {completedToday.slice(0, 5).map(visit => {
                    const patient = patients.find(p => p.patientId === visit.patientId)!;
                    return (
                      <div key={visit.id} className="flex items-center justify-between text-sm py-1">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-success" />
                          <span className="font-medium">{patient.firstName} {patient.lastName}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(visit.completedAt!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })}
                  {completedToday.length === 0 && (
                    <p className="text-xs text-muted-foreground italic">No patients completed yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <ConsultationDialog
        open={!!selectedVisit}
        onClose={() => setSelectedVisit(null)}
        onSave={handleSaveConsultation}
        patient={selectedVisit?.patient || null}
        visitId={selectedVisit?.visit.id || ""}
      />
    </div>
  );
};

export default DoctorDashboard;
