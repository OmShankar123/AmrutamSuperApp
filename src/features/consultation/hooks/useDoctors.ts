import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  bookConsultationSlot,
  cancelConsultationBooking,
  fetchDoctorDetail,
  fetchDoctors,
  fetchDoctorSlots,
  fetchMyBookings,
} from '../services';
import type { Booking, Doctor, DoctorFilterParams } from '../types';

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

export function useDoctorDetail(doctorId: string, initialDoctor?: Doctor) {
  const queryClient = useQueryClient();

  const findInListCache = (): Doctor | undefined => {
    if (initialDoctor) return initialDoctor;
    const listQueries = queryClient.getQueriesData<any>({
      queryKey: doctorKeys.lists(),
    });
    for (const [, data] of listQueries) {
      if (data?.pages) {
        for (const page of data.pages) {
          const match = page?.data?.find((d: any) => d.id === doctorId);
          if (match) return match;
        }
      } else if (Array.isArray(data?.data)) {
        const match = data.data.find((d: any) => d.id === doctorId);
        if (match) return match;
      }
    }
    return undefined;
  };

  return useQuery({
    queryKey: doctorKeys.detail(doctorId),
    queryFn: async () => {
      try {
        return await fetchDoctorDetail(doctorId);
      } catch (err) {
        const fallback = findInListCache();
        if (fallback) return fallback;
        throw err;
      }
    },
    initialData: findInListCache,
    initialDataUpdatedAt: () => Date.now(),
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
    placeholderData: keepPreviousData,
  });
}

export function useBookSlot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Booking, 'id' | 'bookedAt' | 'status'>) => bookConsultationSlot(data),
    onSuccess: (newBooking, variables) => {
      queryClient.setQueryData<Booking[]>(doctorKeys.myBookings(), (old = []) => [
        newBooking,
        ...old.filter((b) => b.id !== newBooking.id),
      ]);
      queryClient.invalidateQueries({
        queryKey: doctorKeys.slots(variables.doctorId, variables.date),
      });
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookingId: string) => cancelConsultationBooking(bookingId),
    onSuccess: (_, bookingId) => {
      queryClient.setQueryData<Booking[]>(doctorKeys.myBookings(), (old = []) =>
        old.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' } : b)),
      );
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
