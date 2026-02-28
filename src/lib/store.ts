// ─── In-Memory Store ──────────────────────────────────────────────────────────
// Data lives here for the lifetime of the Electron app session.
// Initialized from mockData on first import.

import { Patient, Visit, Consultation } from "@/types/patient";
import { mockPatients, mockVisits, mockConsultations } from "@/data/mockData";

// ── State ─────────────────────────────────────────────────────────────────────
let patients: Patient[] = [...mockPatients];
let visits: Visit[] = [...mockVisits];
let consultations: Consultation[] = [...mockConsultations];

// ── Patients ──────────────────────────────────────────────────────────────────
export const getPatients = (): Patient[] => [...patients];
export const addPatient = (p: Patient) => { patients = [...patients, p]; };
export const updatePatient = (patientId: string, changes: Partial<Patient>) => {
    patients = patients.map(p => p.patientId === patientId ? { ...p, ...changes } : p);
};
export const deletePatient = (patientId: string) => {
    patients = patients.filter(p => p.patientId !== patientId);
};

// ── Visits ────────────────────────────────────────────────────────────────────
export const getVisits = (): Visit[] => [...visits];
export const addVisit = (v: Visit) => { visits = [...visits, v]; };
export const updateVisit = (id: string, changes: Partial<Visit>) => {
    visits = visits.map(v => v.id === id ? { ...v, ...changes } : v);
};

// ── Consultations ─────────────────────────────────────────────────────────────
export const getConsultations = (): Consultation[] => [...consultations];
export const addConsultation = (c: Consultation) => { consultations = [...consultations, c]; };
