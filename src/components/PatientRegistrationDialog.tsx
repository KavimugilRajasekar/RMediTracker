import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Patient } from "@/types/patient";
import { generatePatientId, generateRfidUid } from "@/data/mockData";
import { UserPlus } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onRegister: (patient: Patient) => void;
  scannedUid?: string;
}

const PatientRegistrationDialog = ({ open, onClose, onRegister, scannedUid }: Props) => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    age: "",
    gender: "" as "Male" | "Female" | "Other" | "",
    phone: "",
    address: "",
  });

  const rfidUid = scannedUid || generateRfidUid();

  const handleSubmit = () => {
    if (!form.firstName || !form.lastName || !form.age || !form.gender) return;
    
    const patient: Patient = {
      id: crypto.randomUUID(),
      patientId: generatePatientId(),
      firstName: form.firstName,
      lastName: form.lastName,
      age: parseInt(form.age),
      gender: form.gender as "Male" | "Female" | "Other",
      phone: form.phone,
      address: form.address,
      rfidUid: rfidUid,
      rfidHistory: [{ uid: rfidUid, issuedAt: new Date().toISOString() }],
      registeredAt: new Date().toISOString(),
    };

    onRegister(patient);
    setForm({ firstName: "", lastName: "", age: "", gender: "", phone: "", address: "" });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Register New Patient
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-lg bg-primary/5 border border-primary/20 p-3">
            <p className="text-xs text-muted-foreground">RFID Card UID</p>
            <p className="font-mono text-sm font-semibold text-primary">{rfidUid}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">First Name *</Label>
              <Input value={form.firstName} onChange={(e) => setForm(f => ({ ...f, firstName: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Last Name *</Label>
              <Input value={form.lastName} onChange={(e) => setForm(f => ({ ...f, lastName: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Age *</Label>
              <Input type="number" value={form.age} onChange={(e) => setForm(f => ({ ...f, age: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Gender *</Label>
              <Select value={form.gender} onValueChange={(v) => setForm(f => ({ ...f, gender: v as any }))}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Phone</Label>
            <Input value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Address</Label>
            <Input value={form.address} onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!form.firstName || !form.lastName || !form.age || !form.gender}>
            Register & Issue Card
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PatientRegistrationDialog;
