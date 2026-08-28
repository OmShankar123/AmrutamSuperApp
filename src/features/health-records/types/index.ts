export type RecordType = 'lab_report' | 'prescription' | 'consultation' | 'vaccination' | 'allergy';

export type Dosha = 'Vata' | 'Pitta' | 'Kapha' | 'Vata-Pitta' | 'Tridoshic';

export interface RecordAttachment {
  id: string;
  name: string;
  type: 'image' | 'pdf';
  url: string;
  size: string;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export interface PatientVitals {
  bp?: string;
  pulse?: number;
  weight?: number;
  dosha?: Dosha;
  temperature?: string;
}

export interface HealthRecord {
  id: string;
  patientId: string;
  type: RecordType;
  title: string;
  doctorName: string;
  clinicOrLabName: string;
  date: string; // ISO date string
  formattedDate: string;
  monthYearGroup: string; // e.g. "August 2026"
  summary: string;
  notes: string;
  tags: string[];
  vitals?: PatientVitals;
  medications?: Medication[];
  attachments: RecordAttachment[];
}

export interface HealthRecordFilterParams {
  query?: string;
  type?: RecordType;
  tag?: string;
  page?: number;
  limit?: number;
}

export interface HealthRecordsResponse {
  data: HealthRecord[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
