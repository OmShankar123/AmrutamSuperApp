import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';

import type { Product, ProductFilterParams } from '../types';

export interface ProductsResponse {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export const shopService = {
  getProducts: async (params: ProductFilterParams = {}): Promise<ProductsResponse> => {
    const response = await apiClient.get<ProductsResponse>(API_ENDPOINTS.PRODUCTS, {
      params: {
        page: params.page ?? 1,
        limit: params.limit ?? 50,
        query: params.query,
        category: params.category,
        healthConcern: params.healthConcern,
        minPrice: params.minPrice,
        maxPrice: params.maxPrice,
        minRating: params.minRating,
        inStockOnly: params.inStockOnly,
        sortBy: params.sortBy,
      },
    });
    return response.data;
  },

  getProductDetail: async (id: string): Promise<Product> => {
    const response = await apiClient.get<Product>(API_ENDPOINTS.PRODUCT_DETAIL(id));
    return response.data;
  },
};
