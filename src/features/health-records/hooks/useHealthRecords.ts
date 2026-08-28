import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { healthRecordsService } from '../services';
import type { HealthRecord, HealthRecordFilterParams, HealthRecordsResponse } from '../types';

export const recordKeys = {
  all: ['health-records'] as const,
  lists: () => [...recordKeys.all, 'list'] as const,
  list: (filters: HealthRecordFilterParams) => [...recordKeys.lists(), filters] as const,
  details: () => [...recordKeys.all, 'detail'] as const,
  detail: (id: string) => [...recordKeys.details(), id] as const,
};

export function useInfiniteHealthRecords(filters: HealthRecordFilterParams = {}) {
  return useInfiniteQuery<HealthRecordsResponse, Error>({
    queryKey: recordKeys.list(filters),
    queryFn: ({ pageParam = 1 }) =>
      healthRecordsService.getRecords({ ...filters, page: pageParam as number, limit: 50 }),
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

export function useHealthRecordDetail(recordId: string) {
  return useQuery<HealthRecord, Error>({
    queryKey: recordKeys.detail(recordId),
    queryFn: () => healthRecordsService.getRecordDetail(recordId),
    enabled: Boolean(recordId),
    staleTime: 1000 * 60 * 10,
  });
}
