export type Specialization =
  | 'Panchakarma'
  | 'Kayachikitsa'
  | 'Nadi Pariksha'
  | 'Shalya Tantra'
  | 'Dravyaguna'
  | 'Prasuti & Stri Roga'
  | 'Kaumarbhritya'
  | 'Ayurvedic Dietetics';

export type TimeOfDay = 'Morning' | 'Afternoon' | 'Evening';

export interface Slot {
  id: string;
  doctorId: string;
  date: string;
  time: string;
  timeOfDay: TimeOfDay;
  isBooked: boolean;
  price: number;
}

export interface Doctor {
  id: string;
  name: string;
  title: string;
  specialization: Specialization;
  qualifications: string[];
  experienceYears: number;
  rating: number;
  reviewCount: number;
  consultationFee: number;
  languages: string[];
  clinicName: string;
  city: string;
  bio: string;
  avatarUrl: string;
  isAvailableToday: boolean;
  ratingCount: number;
}

export interface Booking {
  id: string;
  doctorId: string;
  doctorName: string;
  specialization: Specialization;
  slotId: string;
  date: string;
  time: string;
  patientName: string;
  patientPhone: string;
  patientAge: number;
  symptoms: string;
  consultationFee: number;
  status: 'confirmed' | 'cancelled' | 'completed' | 'queued_offline';
  bookedAt: string;
}

export interface DoctorFilterParams {
  query?: string;
  specialization?: Specialization;
  minExperience?: number;
  maxFee?: number;
  minRating?: number;
  availableToday?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'rating' | 'experience' | 'fee_asc' | 'fee_desc';
}
