import { apiClient } from './client';
import { endpoints } from './endpoints';
import type { Category } from '@/types/category.types';

export const categoriesApi = {
  list: async (): Promise<Category[]> => {
    const { data } = await apiClient.get<Category[]>(endpoints.categories.list);
    return data;
  },
  bySlug: async (slug: string): Promise<Category> => {
    const { data } = await apiClient.get<Category>(endpoints.categories.bySlug(slug));
    return data;
  },
};
