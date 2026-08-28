import { apiClient } from '@/core/api/client';

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
    const response = await apiClient.get<ProductsResponse>('/products', {
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
    const response = await apiClient.get<Product>(`/products/${id}`);
    return response.data;
  },
};
