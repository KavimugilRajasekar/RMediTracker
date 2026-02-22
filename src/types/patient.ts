export type PatientStatus = "Arrived" | "Completed" | "Waiting" | "No-Show";

export interface Patient {
  id: string;
  patientId: string;
  firstName: string;
  lastName: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  phone: string;
  address: string;
  rfidUid: string;
  rfidHistory: { uid: string; issuedAt: string; deactivatedAt?: string }[];
  registeredAt: string;
}

export interface Visit {
  id: string;
  patientId: string;
  status: PatientStatus;
  arrivedAt: string;
  completedAt?: string;
}

export interface Consultation {
  id: string;
  visitId: string;
  patientId: string;
  diagnosis: string;
  clinicalNotes: string;
  prescriptions: Prescription[];
  followUpDate?: string;
  createdAt: string;
}

export interface Prescription {
  id: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export type UserRole = "reception" | "doctor";
