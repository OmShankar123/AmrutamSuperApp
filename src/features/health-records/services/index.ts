import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';

import type { HealthRecord, HealthRecordFilterParams, HealthRecordsResponse } from '../types';

export const healthRecordsService = {
  async getRecords(params: HealthRecordFilterParams = {}): Promise<HealthRecordsResponse> {
    const response = await apiClient.get<HealthRecordsResponse>(API_ENDPOINTS.HEALTH_RECORDS, {
      params: {
        query: params.query,
        type: params.type,
        tag: params.tag,
        page: params.page ?? 1,
        limit: params.limit ?? 50,
      },
    });
    return response.data;
  },

  async getRecordDetail(recordId: string): Promise<HealthRecord> {
    const response = await apiClient.get<HealthRecord>(
      API_ENDPOINTS.HEALTH_RECORD_DETAIL(recordId),
    );
    return response.data;
  },
};
