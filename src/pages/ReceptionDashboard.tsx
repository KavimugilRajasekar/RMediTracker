import { useState } from "react";
import { Patient, Visit } from "@/types/patient";
import { mockPatients, mockVisits } from "@/data/mockData";
import AppHeader from "@/components/AppHeader";
import RfidScanner from "@/components/RfidScanner";
import PatientRegistrationDialog from "@/components/PatientRegistrationDialog";
import StatusBadge from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Users, UserCheck, Search, CreditCard, AlertTriangle } from "lucide-react";

const ReceptionDashboard = () => {
  const [patients, setPatients] = useState<Patient[]>(mockPatients);
  const [visits, setVisits] = useState<Visit[]>(mockVisits);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedPatient, setScannedPatient] = useState<Patient | null>(null);
  const [scannedUid, setScannedUid] = useState<string>("");
  const [showRegister, setShowRegister] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const todayVisits = visits.filter((v) => {
    const today = new Date().toDateString();
    return new Date(v.arrivedAt).toDateString() === today;
  });
  const arrivedCount = todayVisits.filter(v => v.status === "Arrived").length;

  const handleScan = (uid: string) => {
    setScannedUid(uid);
    const found = patients.find((p) => p.rfidUid === uid);
    if (found) {
      setScannedPatient(found);
      toast.success(`Patient found: ${found.firstName} ${found.lastName}`);
    } else {
      setScannedPatient(null);
      toast.info("Unknown card. Register a new patient or replace a lost card.");
    }
  };

  const handleMarkArrived = (patientId: string) => {
    const existing = visits.find(v => v.patientId === patientId && v.status === "Arrived");
    if (existing) {
      toast.warning("Patient already marked as Arrived.");
      return;
    }
    const newVisit: Visit = {
      id: crypto.randomUUID(),
      patientId,
      status: "Arrived",
      arrivedAt: new Date().toISOString(),
    };
    setVisits((prev) => [...prev, newVisit]);
    toast.success("Patient marked as Arrived and added to Doctor's queue.");
  };

  const handleRegister = (patient: Patient) => {
    setPatients((prev) => [...prev, patient]);
    handleMarkArrived(patient.patientId);
    toast.success(`Patient ${patient.firstName} registered with ID ${patient.patientId}`);
  };

  const handleReplaceLostCard = () => {
    if (!scannedPatient) return;
    // In a real app this would deactivate old and assign new
    toast.success(`RFID card replaced for ${scannedPatient.firstName} ${scannedPatient.lastName}`);
  };

  const filteredPatients = searchQuery
    ? patients.filter(
      (p) =>
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.rfidUid.toLowerCase().includes(searchQuery.toLowerCase())
    )
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
          {/* RFID Scanner Section */}
          <div className="space-y-4">
            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">RFID Card Scanner</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <RfidScanner onScan={handleScan} isScanning={isScanning} setIsScanning={setIsScanning} />

                {scannedUid && !isScanning && (
                  <div className="rounded-lg border border-border p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Scanned UID</span>
                      <span className="font-mono text-sm font-semibold text-foreground">{scannedUid}</span>
                    </div>

                    {scannedPatient ? (
                      <div className="space-y-3">
                        <div className="rounded-lg bg-success/10 border border-success/20 p-3">
                          <p className="text-sm font-semibold text-foreground">
                            {scannedPatient.firstName} {scannedPatient.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {scannedPatient.patientId} • Age {scannedPatient.age} • {scannedPatient.gender}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleMarkArrived(scannedPatient.patientId)}>
                            Mark Arrived
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="rounded-lg bg-warning/10 border border-warning/20 p-3">
                          <p className="text-sm text-foreground">No patient found for this card.</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => setShowRegister(true)}>
                            Register New Patient
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleReplaceLostCard}>
                            <AlertTriangle className="h-3 w-3 mr-1" /> Replace Card
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
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
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {(searchQuery ? filteredPatients : patients).map((patient) => {
                  const visit = visits.find(v => v.patientId === patient.patientId && v.status === "Arrived");
                  return (
                    <div key={patient.id} className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-secondary/50 transition-colors">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {patient.firstName} {patient.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {patient.patientId} • {patient.phone}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
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

        {/* Today's Visits */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Today's Visits</CardTitle>
          </CardHeader>
          <CardContent>
            {todayVisits.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No visits recorded today.</p>
            ) : (
              <div className="space-y-2">
                {todayVisits.map((visit) => {
                  const patient = patients.find(p => p.patientId === visit.patientId);
                  return (
                    <div key={visit.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {patient ? `${patient.firstName} ${patient.lastName}` : visit.patientId}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Arrived: {new Date(visit.arrivedAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <StatusBadge status={visit.status} />
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
    </div>
  );
};

export default ReceptionDashboard;
