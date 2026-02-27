import { Patient, Visit, Consultation } from "@/types/patient";

export const mockPatients: Patient[] = [
  {
    id: "1", patientId: "PT-2024-001",
    firstName: "Ramesh", lastName: "Kumar",
    age: 45, gender: "Male", phone: "+91 98765 43210", address: "Village Sundarpur, Block A",
    rfidUid: "A1B2C3D4",
    rfidHistory: [{ uid: "A1B2C3D4", issuedAt: "2024-01-15" }],
    registeredAt: "2024-01-15",
  },
  {
    id: "2", patientId: "PT-2024-002",
    firstName: "Lakshmi", lastName: "Devi",
    age: 32, gender: "Female", phone: "+91 87654 32109", address: "Village Rampur, Block B",
    rfidUid: "E5F6A7B8",
    rfidHistory: [{ uid: "E5F6A7B8", issuedAt: "2024-02-20" }],
    registeredAt: "2024-02-20",
  },
  {
    id: "3", patientId: "PT-2024-003",
    firstName: "Suresh", lastName: "Patel",
    age: 58, gender: "Male", phone: "+91 76543 21098", address: "Village Chandanpur, Block C",
    rfidUid: "C9D0E1F2",
    rfidHistory: [
      { uid: "1A2B3C4D", issuedAt: "2024-01-10", deactivatedAt: "2024-06-15" },
      { uid: "C9D0E1F2", issuedAt: "2024-06-15" },
    ],
    registeredAt: "2024-01-10",
  },
  {
    id: "4", patientId: "PT-2024-004",
    firstName: "Anita", lastName: "Sharma",
    age: 27, gender: "Female", phone: "+91 99001 12233", address: "Village Kotpur, Block A",
    rfidUid: "3F4A5B6C",
    rfidHistory: [{ uid: "3F4A5B6C", issuedAt: "2024-03-05" }],
    registeredAt: "2024-03-05",
  },
  {
    id: "5", patientId: "PT-2024-005",
    firstName: "Manoj", lastName: "Singh",
    age: 62, gender: "Male", phone: "+91 88776 65544", address: "Village Bhoomipur, Block D",
    rfidUid: "7D8E9F0A",
    rfidHistory: [{ uid: "7D8E9F0A", issuedAt: "2024-03-18" }],
    registeredAt: "2024-03-18",
  },
  {
    id: "6", patientId: "PT-2024-006",
    firstName: "Priya", lastName: "Verma",
    age: 34, gender: "Female", phone: "+91 77665 54433", address: "Village Lakshmipur, Block B",
    rfidUid: "B1C2D3E4",
    rfidHistory: [{ uid: "B1C2D3E4", issuedAt: "2024-04-01" }],
    registeredAt: "2024-04-01",
  },
  {
    id: "7", patientId: "PT-2024-007",
    firstName: "Vikram", lastName: "Yadav",
    age: 41, gender: "Male", phone: "+91 66554 43322", address: "Village Nandanpur, Block C",
    rfidUid: "F5061718",
    rfidHistory: [{ uid: "F5061718", issuedAt: "2024-04-15" }],
    registeredAt: "2024-04-15",
  },
  {
    id: "8", patientId: "PT-2024-008",
    firstName: "Sunita", lastName: "Gupta",
    age: 55, gender: "Female", phone: "+91 55443 32211", address: "Village Krishnapur, Block A",
    rfidUid: "29303132",
    rfidHistory: [{ uid: "29303132", issuedAt: "2024-05-02" }],
    registeredAt: "2024-05-02",
  },
  {
    id: "9", patientId: "PT-2024-009",
    firstName: "Rajendra", lastName: "Mishra",
    age: 49, gender: "Male", phone: "+91 44332 21100", address: "Village Shivpur, Block D",
    rfidUid: "A3B4C5D6",
    rfidHistory: [{ uid: "A3B4C5D6", issuedAt: "2024-05-20" }],
    registeredAt: "2024-05-20",
  },
  {
    id: "10", patientId: "PT-2024-010",
    firstName: "Kavitha", lastName: "Nair",
    age: 38, gender: "Female", phone: "+91 33221 10099", address: "Village Devipur, Block B",
    rfidUid: "E7F80911",
    rfidHistory: [{ uid: "E7F80911", issuedAt: "2024-06-08" }],
    registeredAt: "2024-06-08",
  },
  {
    id: "11", patientId: "PT-2024-011",
    firstName: "Mohan", lastName: "Pillai",
    age: 67, gender: "Male", phone: "+91 92345 67891", address: "Village Arjunpur, Block C",
    rfidUid: "12233445",
    rfidHistory: [{ uid: "12233445", issuedAt: "2024-06-22" }],
    registeredAt: "2024-06-22",
  },
  {
    id: "12", patientId: "PT-2024-012",
    firstName: "Deepa", lastName: "Reddy",
    age: 29, gender: "Female", phone: "+91 81234 56780", address: "Village Srinivaspur, Block A",
    rfidUid: "566778AB",
    rfidHistory: [{ uid: "566778AB", issuedAt: "2024-07-03" }],
    registeredAt: "2024-07-03",
  },
  {
    id: "13", patientId: "PT-2024-013",
    firstName: "Harish", lastName: "Tiwari",
    age: 53, gender: "Male", phone: "+91 70123 45679", address: "Village Gangapur, Block D",
    rfidUid: "CD9EAFC0",
    rfidHistory: [{ uid: "CD9EAFC0", issuedAt: "2024-07-19" }],
    registeredAt: "2024-07-19",
  },
  {
    id: "14", patientId: "PT-2024-014",
    firstName: "Meenakshi", lastName: "Iyer",
    age: 44, gender: "Female", phone: "+91 69012 34568", address: "Village Muruganpur, Block B",
    rfidUid: "1D2E3F40",
    rfidHistory: [{ uid: "1D2E3F40", issuedAt: "2024-08-05" }],
    registeredAt: "2024-08-05",
  },
  {
    id: "15", patientId: "PT-2024-015",
    firstName: "Arjun", lastName: "Mehta",
    age: 36, gender: "Male", phone: "+91 58901 23457", address: "Village Balrampur, Block C",
    rfidUid: "51627384",
    rfidHistory: [{ uid: "51627384", issuedAt: "2024-08-21" }],
    registeredAt: "2024-08-21",
  },
  {
    id: "16", patientId: "PT-2024-016",
    firstName: "Usha", lastName: "Pandey",
    age: 60, gender: "Female", phone: "+91 47890 12346", address: "Village Bhavanipur, Block A",
    rfidUid: "95A6B7C8",
    rfidHistory: [{ uid: "95A6B7C8", issuedAt: "2024-09-10" }],
    registeredAt: "2024-09-10",
  },
  {
    id: "17", patientId: "PT-2024-017",
    firstName: "Ganesh", lastName: "Joshi",
    age: 31, gender: "Male", phone: "+91 36789 01235", address: "Village Ramkrishnapur, Block D",
    rfidUid: "D9EAF00B",
    rfidHistory: [{ uid: "D9EAF00B", issuedAt: "2024-09-28" }],
    registeredAt: "2024-09-28",
  },
  {
    id: "18", patientId: "PT-2024-018",
    firstName: "Saritha", lastName: "Bose",
    age: 47, gender: "Female", phone: "+91 25678 90124", address: "Village Netajipur, Block B",
    rfidUid: "1C2D3E4F",
    rfidHistory: [{ uid: "1C2D3E4F", issuedAt: "2024-10-14" }],
    registeredAt: "2024-10-14",
  },
  {
    id: "19", patientId: "PT-2024-019",
    firstName: "Dinesh", lastName: "Patil",
    age: 72, gender: "Male", phone: "+91 14567 89013", address: "Village Chatrapatipur, Block C",
    rfidUid: "506172A3",
    rfidHistory: [{ uid: "506172A3", issuedAt: "2024-10-30" }],
    registeredAt: "2024-10-30",
  },
  {
    id: "20", patientId: "PT-2024-020",
    firstName: "Rekha", lastName: "Chauhan",
    age: 25, gender: "Female", phone: "+91 93456 78012", address: "Village Pratapur, Block A",
    rfidUid: "B4C5D6E7",
    rfidHistory: [{ uid: "B4C5D6E7", issuedAt: "2024-11-15" }],
    registeredAt: "2024-11-15",
  },
  {
    id: "21", patientId: "PT-2024-021",
    firstName: "Santosh", lastName: "Rao",
    age: 56, gender: "Male", phone: "+91 82345 67901", address: "Village Venkateshpur, Block D",
    rfidUid: "F80910A1",
    rfidHistory: [{ uid: "F80910A1", issuedAt: "2024-11-29" }],
    registeredAt: "2024-11-29",
  },
  {
    id: "22", patientId: "PT-2024-022",
    firstName: "Annapurna", lastName: "Das",
    age: 39, gender: "Female", phone: "+91 71234 56890", address: "Village Subhashpur, Block B",
    rfidUid: "822CE55C",
    rfidHistory: [{ uid: "822CE55C", issuedAt: "2024-12-10" }],
    registeredAt: "2024-12-10",
  },
  {
    id: "23", patientId: "PT-2024-023",
    firstName: "Balaji", lastName: "Krishnan",
    age: 33, gender: "Male", phone: "+91 60123 45678", address: "Village Muniswamypur, Block C",
    rfidUid: "2B375006",
    rfidHistory: [{ uid: "2B375006", issuedAt: "2025-01-08" }],
    registeredAt: "2025-01-08",
  },
];

export const mockVisits: Visit[] = [
  {
    id: "v1", patientId: "PT-2024-001",
    status: "Arrived", arrivedAt: new Date().toISOString(),
  },
  {
    id: "v2", patientId: "PT-2024-003",
    status: "Arrived", arrivedAt: new Date(Date.now() - 18 * 60000).toISOString(),
  },
  {
    id: "v3", patientId: "PT-2024-007",
    status: "Arrived", arrivedAt: new Date(Date.now() - 35 * 60000).toISOString(),
  },
  {
    id: "v4", patientId: "PT-2024-012",
    status: "Arrived", arrivedAt: new Date(Date.now() - 52 * 60000).toISOString(),
  },
];

export const mockConsultations: Consultation[] = [
  {
    id: "c1", visitId: "v-old-1", patientId: "PT-2024-001",
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

let nextPatientNum = 23;
export const generatePatientId = () => {
  const id = `PT-2024-${String(nextPatientNum).padStart(3, "0")}`;
  nextPatientNum++;
  return id;
};

// Generates a random 4-byte hex UID (e.g. "822CE55C") — no colons, uppercase
export const generateRfidUid = (): string => {
  return Array.from({ length: 4 }, () =>
    Math.floor(Math.random() * 256).toString(16).toUpperCase().padStart(2, "0")
  ).join("");
};
