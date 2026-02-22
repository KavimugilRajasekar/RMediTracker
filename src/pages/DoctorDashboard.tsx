import { useState } from "react";
import { Patient, Visit, Consultation } from "@/types/patient";
import { mockPatients, mockVisits } from "@/data/mockData";
import AppHeader from "@/components/AppHeader";
import ConsultationDialog from "@/components/ConsultationDialog";
import StatusBadge from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Stethoscope, Clock, CheckCircle2, Users } from "lucide-react";

const DoctorDashboard = () => {
  const [patients] = useState<Patient[]>(mockPatients);
  const [visits, setVisits] = useState<Visit[]>(mockVisits);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [selectedVisit, setSelectedVisit] = useState<{ visit: Visit; patient: Patient } | null>(null);

  const arrivedVisits = visits.filter((v) => v.status === "Arrived");
  const completedToday = visits.filter((v) => {
    const today = new Date().toDateString();
    return v.status === "Completed" && v.completedAt && new Date(v.completedAt).toDateString() === today;
  });

  const handleOpenConsultation = (visit: Visit) => {
    const patient = patients.find((p) => p.patientId === visit.patientId);
    if (patient) {
      setSelectedVisit({ visit, patient });
    }
  };

  const handleSaveConsultation = (consultation: Consultation) => {
    setConsultations((prev) => [...prev, consultation]);
    setVisits((prev) =>
      prev.map((v) =>
        v.id === selectedVisit?.visit.id
          ? { ...v, status: "Completed" as const, completedAt: new Date().toISOString() }
          : v
      )
    );
    setSelectedVisit(null);
    toast.success("Consultation saved. Visit marked as Completed.");
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="mx-auto max-w-5xl p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Patients in Queue", value: arrivedVisits.length, icon: Users, color: "text-warning" },
            { label: "Completed Today", value: completedToday.length, icon: CheckCircle2, color: "text-success" },
            { label: "Total Consultations", value: consultations.length, icon: Stethoscope, color: "text-primary" },
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

        {/* Patient Queue */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-warning" />
              Patient Queue
            </CardTitle>
          </CardHeader>
          <CardContent>
            {arrivedVisits.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <CheckCircle2 className="h-10 w-10 mx-auto text-success/50" />
                <p className="text-sm text-muted-foreground">No patients in queue. All caught up!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {arrivedVisits.map((visit, index) => {
                  const patient = patients.find((p) => p.patientId === visit.patientId);
                  return (
                    <div
                      key={visit.id}
                      className="flex items-center justify-between rounded-lg border border-border p-4 hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {patient ? `${patient.firstName} ${patient.lastName}` : visit.patientId}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {patient && `${patient.patientId} • Age ${patient.age} • ${patient.gender}`}
                            {" • "}Arrived {new Date(visit.arrivedAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={visit.status} />
                        <Button size="sm" onClick={() => handleOpenConsultation(visit)}>
                          <Stethoscope className="h-3 w-3 mr-1" /> Consult
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Completed */}
        {completedToday.length > 0 && (
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                Completed Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {completedToday.map((visit) => {
                  const patient = patients.find((p) => p.patientId === visit.patientId);
                  const consultation = consultations.find((c) => c.visitId === visit.id);
                  return (
                    <div key={visit.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {patient ? `${patient.firstName} ${patient.lastName}` : visit.patientId}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {consultation?.diagnosis || "No diagnosis recorded"}
                        </p>
                      </div>
                      <StatusBadge status="Completed" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <ConsultationDialog
        open={!!selectedVisit}
        onClose={() => setSelectedVisit(null)}
        patient={selectedVisit?.patient || null}
        visitId={selectedVisit?.visit.id || ""}
        onSave={handleSaveConsultation}
      />
    </div>
  );
};

export default DoctorDashboard;
