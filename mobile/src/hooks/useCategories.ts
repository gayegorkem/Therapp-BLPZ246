import { useQuery } from '@tanstack/react-query';
import { categoriesApi } from '@/api/categories.api';
import { queryKeys } from './queryKeys';

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: categoriesApi.list,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCategory(slug: string | undefined) {
  return useQuery({
    queryKey: slug ? queryKeys.categories.bySlug(slug) : ['categories', 'noop'],
    queryFn: () => categoriesApi.bySlug(slug as string),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}
