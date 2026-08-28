import { apiClient, type PaginatedResponse } from '@/core/api/client';

import type { Booking, Doctor, DoctorFilterParams, Slot } from '../types';

export async function fetchDoctors(params: DoctorFilterParams): Promise<PaginatedResponse<Doctor>> {
  const res = await apiClient.get<PaginatedResponse<Doctor>>('/doctors', { params });
  return res.data;
}

export async function fetchDoctorDetail(doctorId: string): Promise<Doctor> {
  const res = await apiClient.get<Doctor>(`/doctors/${doctorId}`);
  return res.data;
}

export async function fetchDoctorSlots(doctorId: string, date: string): Promise<Slot[]> {
  const res = await apiClient.get<Slot[]>(`/doctors/${doctorId}/slots`, { params: { date } });
  return res.data;
}

export async function bookConsultationSlot(
  data: Omit<Booking, 'id' | 'bookedAt' | 'status'>,
): Promise<Booking> {
  const res = await apiClient.post<Booking>('/consultations/book', data);
  return res.data;
}

export async function cancelConsultationBooking(bookingId: string): Promise<{ success: boolean }> {
  const res = await apiClient.post<{ success: boolean }>(`/consultations/${bookingId}/cancel`);
  return res.data;
}

export async function fetchMyBookings(): Promise<Booking[]> {
  const res = await apiClient.get<Booking[]>('/consultations/my-bookings');
  return res.data;
}
