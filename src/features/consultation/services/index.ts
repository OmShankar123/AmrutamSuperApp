import { apiClient, type PaginatedResponse } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';
import { useNetworkStore } from '@/core/api/services/syncManager';
import { enqueueMutation } from '@/core/storage/queue';

import type { Booking, Doctor, DoctorFilterParams, Slot } from '../types';

export async function fetchDoctors(params: DoctorFilterParams): Promise<PaginatedResponse<Doctor>> {
  const res = await apiClient.get<PaginatedResponse<Doctor>>(API_ENDPOINTS.DOCTORS, { params });
  return res.data;
}

export async function fetchDoctorDetail(doctorId: string): Promise<Doctor> {
  const res = await apiClient.get<Doctor>(API_ENDPOINTS.DOCTOR_DETAIL(doctorId));
  return res.data;
}

export async function fetchDoctorSlots(doctorId: string, date: string): Promise<Slot[]> {
  const res = await apiClient.get<Slot[]>(API_ENDPOINTS.DOCTOR_SLOTS(doctorId), {
    params: { date },
  });
  return res.data;
}

export async function bookConsultationSlot(
  data: Omit<Booking, 'id' | 'bookedAt' | 'status'>,
): Promise<Booking> {
  // If offline, enqueue mutation for background sync & return optimistic booking
  if (!useNetworkStore.getState().isConnected) {
    enqueueMutation({
      type: 'BOOK_CONSULTATION',
      payload: data,
    });
    useNetworkStore.getState().updatePendingCount();

    const optimisticBooking: Booking = {
      ...data,
      id: `book_offline_${Date.now()}`,
      bookedAt: new Date().toISOString(),
      status: 'confirmed',
    };
    return optimisticBooking;
  }

  const res = await apiClient.post<Booking>(API_ENDPOINTS.BOOK_CONSULTATION, data);
  return res.data;
}

export async function cancelConsultationBooking(bookingId: string): Promise<{ success: boolean }> {
  // If offline, enqueue cancellation for background sync
  if (!useNetworkStore.getState().isConnected) {
    enqueueMutation({
      type: 'CANCEL_CONSULTATION',
      payload: { bookingId },
    });
    useNetworkStore.getState().updatePendingCount();
    return { success: true };
  }

  const res = await apiClient.post<{ success: boolean }>(
    API_ENDPOINTS.CANCEL_CONSULTATION(bookingId),
  );
  return res.data;
}

export async function fetchMyBookings(): Promise<Booking[]> {
  const res = await apiClient.get<Booking[]>(API_ENDPOINTS.MY_BOOKINGS);
  return res.data;
}
