import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Consultation, Patient, Prescription } from "@/types/patient";
import { mockConsultations } from "@/data/mockData";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, FileText, Pill, Calendar } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  patient: Patient | null;
  visitId: string;
  onSave: (consultation: Consultation) => void;
}

const ConsultationDialog = ({ open, onClose, patient, visitId, onSave }: Props) => {
  const [diagnosis, setDiagnosis] = useState("");
  const [clinicalNotes, setClinicalNotes] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [prescriptions, setPrescriptions] = useState<Omit<Prescription, "id">[]>([
    { medication: "", dosage: "", frequency: "", duration: "" },
  ]);

  const pastConsultations = patient
    ? mockConsultations.filter((c) => c.patientId === patient.patientId)
    : [];

  const addPrescription = () => {
    setPrescriptions((prev) => [...prev, { medication: "", dosage: "", frequency: "", duration: "" }]);
  };

  const removePrescription = (index: number) => {
    setPrescriptions((prev) => prev.filter((_, i) => i !== index));
  };

  const updatePrescription = (index: number, field: keyof Omit<Prescription, "id">, value: string) => {
    setPrescriptions((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p))
    );
  };

  const handleSave = () => {
    if (!diagnosis.trim()) return;
    const consultation: Consultation = {
      id: crypto.randomUUID(),
      visitId,
      patientId: patient?.patientId || "",
      diagnosis,
      clinicalNotes,
      prescriptions: prescriptions
        .filter((p) => p.medication.trim())
        .map((p) => ({ ...p, id: crypto.randomUUID() })),
      followUpDate: followUpDate || undefined,
      createdAt: new Date().toISOString(),
    };
    onSave(consultation);
    setDiagnosis("");
    setClinicalNotes("");
    setFollowUpDate("");
    setPrescriptions([{ medication: "", dosage: "", frequency: "", duration: "" }]);
    onClose();
  };

  if (!patient) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Consultation — {patient.firstName} {patient.lastName}
          </DialogTitle>
        </DialogHeader>

        {/* Patient Info */}
        <div className="rounded-lg bg-secondary/50 border border-border p-3 flex gap-6 text-sm">
          <div>
            <span className="text-muted-foreground">ID:</span>{" "}
            <span className="font-semibold text-foreground">{patient.patientId}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Age:</span>{" "}
            <span className="font-semibold text-foreground">{patient.age}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Gender:</span>{" "}
            <span className="font-semibold text-foreground">{patient.gender}</span>
          </div>
        </div>

        {/* Past Records */}
        {pastConsultations.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Past Consultations
            </h4>
            {pastConsultations.map((c) => (
              <div key={c.id} className="rounded-lg border border-border p-3 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-foreground">{c.diagnosis}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{c.clinicalNotes}</p>
                {c.prescriptions.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {c.prescriptions.map((p) => (
                      <span key={p.id} className="inline-flex items-center gap-1 rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">
                        <Pill className="h-3 w-3" /> {p.medication}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <Separator />

        {/* New Consultation */}
        <div className="space-y-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            New Consultation
          </h4>

          <div className="space-y-1.5">
            <Label className="text-xs">Diagnosis *</Label>
            <Input value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} placeholder="Primary diagnosis" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Clinical Notes</Label>
            <Textarea
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              placeholder="Symptoms, observations, findings..."
              rows={3}
            />
          </div>

          {/* Prescriptions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs flex items-center gap-1">
                <Pill className="h-3 w-3" /> Prescriptions
              </Label>
              <Button type="button" variant="ghost" size="sm" onClick={addPrescription}>
                <Plus className="h-3 w-3 mr-1" /> Add
              </Button>
            </div>
            {prescriptions.map((p, i) => (
              <div key={i} className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-2 items-end">
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Medication</Label>
                  <Input value={p.medication} onChange={(e) => updatePrescription(i, "medication", e.target.value)} className="h-8 text-xs" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Dosage</Label>
                  <Input value={p.dosage} onChange={(e) => updatePrescription(i, "dosage", e.target.value)} className="h-8 text-xs w-20" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Frequency</Label>
                  <Input value={p.frequency} onChange={(e) => updatePrescription(i, "frequency", e.target.value)} className="h-8 text-xs w-24" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Duration</Label>
                  <Input value={p.duration} onChange={(e) => updatePrescription(i, "duration", e.target.value)} className="h-8 text-xs w-20" />
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={() => removePrescription(i)} className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs flex items-center gap-1">
              <Calendar className="h-3 w-3" /> Follow-Up Date
            </Label>
            <Input type="date" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!diagnosis.trim()}>
            Save & Complete Visit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConsultationDialog;
