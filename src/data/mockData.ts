import { Patient, Visit, Consultation } from "@/types/patient";

export const mockPatients: Patient[] = [
  {
    id: "1",
    patientId: "PT-2024-001",
    firstName: "Ramesh",
    lastName: "Kumar",
    age: 45,
    gender: "Male",
    phone: "+91 98765 43210",
    address: "Village Sundarpur, Block A",
    rfidUid: "A1:B2:C3:D4",
    rfidHistory: [{ uid: "A1:B2:C3:D4", issuedAt: "2024-01-15" }],
    registeredAt: "2024-01-15",
  },
  {
    id: "2",
    patientId: "PT-2024-002",
    firstName: "Lakshmi",
    lastName: "Devi",
    age: 32,
    gender: "Female",
    phone: "+91 87654 32109",
    address: "Village Rampur, Block B",
    rfidUid: "E5:F6:G7:H8",
    rfidHistory: [{ uid: "E5:F6:G7:H8", issuedAt: "2024-02-20" }],
    registeredAt: "2024-02-20",
  },
  {
    id: "3",
    patientId: "PT-2024-003",
    firstName: "Suresh",
    lastName: "Patel",
    age: 58,
    gender: "Male",
    phone: "+91 76543 21098",
    address: "Village Chandanpur, Block C",
    rfidUid: "I9:J0:K1:L2",
    rfidHistory: [
      { uid: "X1:Y2:Z3:W4", issuedAt: "2024-01-10", deactivatedAt: "2024-06-15" },
      { uid: "I9:J0:K1:L2", issuedAt: "2024-06-15" },
    ],
    registeredAt: "2024-01-10",
  },
];

export const mockVisits: Visit[] = [
  {
    id: "v1",
    patientId: "PT-2024-001",
    status: "Arrived",
    arrivedAt: new Date().toISOString(),
  },
  {
    id: "v2",
    patientId: "PT-2024-003",
    status: "Arrived",
    arrivedAt: new Date(Date.now() - 1800000).toISOString(),
  },
];

export const mockConsultations: Consultation[] = [
  {
    id: "c1",
    visitId: "v-old-1",
    patientId: "PT-2024-001",
    diagnosis: "Upper Respiratory Tract Infection",
    clinicalNotes: "Patient presents with sore throat, mild fever, and nasal congestion for 3 days.",
    prescriptions: [
      { id: "p1", medication: "Paracetamol 500mg", dosage: "1 tablet", frequency: "3 times daily", duration: "5 days" },
      { id: "p2", medication: "Cetirizine 10mg", dosage: "1 tablet", frequency: "Once daily", duration: "5 days" },
    ],
    followUpDate: "2024-12-20",
    createdAt: "2024-12-10T10:30:00Z",
  },
];

let nextPatientNum = 4;
export const generatePatientId = () => {
  const id = `PT-2024-${String(nextPatientNum).padStart(3, "0")}`;
  nextPatientNum++;
  return id;
};

export const generateRfidUid = () => {
  const hex = () => Math.floor(Math.random() * 256).toString(16).toUpperCase().padStart(2, "0");
  return `${hex()}:${hex()}:${hex()}:${hex()}`;
};
