import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  bookConsultationSlot,
  cancelConsultationBooking,
  fetchDoctorDetail,
  fetchDoctors,
  fetchDoctorSlots,
  fetchMyBookings,
} from '../services';
import type { Booking, DoctorFilterParams } from '../types';

export const doctorKeys = {
  all: ['doctors'] as const,
  lists: () => [...doctorKeys.all, 'list'] as const,
  list: (filters: DoctorFilterParams) => [...doctorKeys.lists(), filters] as const,
  details: () => [...doctorKeys.all, 'detail'] as const,
  detail: (id: string) => [...doctorKeys.details(), id] as const,
  slots: (doctorId: string, date: string) =>
    [...doctorKeys.detail(doctorId), 'slots', date] as const,
  myBookings: () => ['consultations', 'my-bookings'] as const,
};

export function useInfiniteDoctors(filters: DoctorFilterParams = {}) {
  return useInfiniteQuery({
    queryKey: doctorKeys.list(filters),
    queryFn: ({ pageParam = 1 }) =>
      fetchDoctors({ ...filters, page: pageParam as number, limit: 50 }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.hasMore) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    staleTime: 1000 * 60 * 10,
  });
}

export function useDoctorDetail(doctorId: string) {
  return useQuery({
    queryKey: doctorKeys.detail(doctorId),
    queryFn: () => fetchDoctorDetail(doctorId),
    enabled: Boolean(doctorId),
    staleTime: 1000 * 60 * 10,
  });
}

export function useDoctorSlots(doctorId: string, date: string) {
  return useQuery({
    queryKey: doctorKeys.slots(doctorId, date),
    queryFn: () => fetchDoctorSlots(doctorId, date),
    enabled: Boolean(doctorId) && Boolean(date),
    staleTime: 1000 * 60 * 2,
  });
}

export function useBookSlot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Booking, 'id' | 'bookedAt' | 'status'>) => bookConsultationSlot(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: doctorKeys.slots(variables.doctorId, variables.date),
      });
      queryClient.invalidateQueries({ queryKey: doctorKeys.myBookings() });
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookingId: string) => cancelConsultationBooking(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: doctorKeys.myBookings() });
    },
  });
}

export function useMyBookings() {
  return useQuery({
    queryKey: doctorKeys.myBookings(),
    queryFn: fetchMyBookings,
    staleTime: 1000 * 60 * 2,
  });
}
