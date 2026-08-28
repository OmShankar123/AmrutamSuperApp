import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { type ProductsResponse, shopService } from '../services';
import type { Product, ProductFilterParams } from '../types';

export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters: ProductFilterParams) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
};

export function useInfiniteProducts(filters: ProductFilterParams = {}) {
  return useInfiniteQuery<ProductsResponse, Error>({
    queryKey: productKeys.list(filters),
    queryFn: ({ pageParam = 1 }) =>
      shopService.getProducts({ ...filters, page: pageParam as number, limit: 50 }),
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

export function useProductDetail(productId: string) {
  return useQuery<Product, Error>({
    queryKey: productKeys.detail(productId),
    queryFn: () => shopService.getProductDetail(productId),
    enabled: Boolean(productId),
    staleTime: 1000 * 60 * 10,
  });
}
