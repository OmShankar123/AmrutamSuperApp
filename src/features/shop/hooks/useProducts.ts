import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';

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

export function useProductDetail(productId?: string, initialProduct?: Product) {
  const queryClient = useQueryClient();

  const findInListCache = (): Product | undefined => {
    if (initialProduct) return initialProduct;
    if (!productId) return undefined;
    const listQueries = queryClient.getQueriesData<any>({
      queryKey: productKeys.lists(),
    });
    for (const [, data] of listQueries) {
      if (data?.pages) {
        for (const page of data.pages) {
          const match = page?.data?.find((p: any) => p.id === productId);
          if (match) return match;
        }
      } else if (Array.isArray(data?.data)) {
        const match = data.data.find((p: any) => p.id === productId);
        if (match) return match;
      }
    }
    return undefined;
  };

  const initialFallback = findInListCache();

  return useQuery<Product, Error>({
    queryKey: productId ? productKeys.detail(productId) : ['products', 'detail', 'unknown'],
    queryFn: async () => {
      if (!productId) throw new Error('Missing product ID');
      try {
        return await shopService.getProductDetail(productId);
      } catch (err) {
        const fallback = findInListCache();
        if (fallback) return fallback;
        throw err;
      }
    },
    enabled: Boolean(productId),
    initialData: initialFallback,
    initialDataUpdatedAt: initialFallback ? Date.now() : undefined,
    staleTime: 1000 * 60 * 10,
  });
}
