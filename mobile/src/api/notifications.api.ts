import { apiClient } from './client';
import { endpoints } from './endpoints';
import type { PagedResult } from '@/types/api.types';
import type { AppNotification } from '@/types/notification.types';

type PageParams = { page?: number; pageSize?: number };

export const notificationsApi = {
  list: async (params?: PageParams) => {
    const { data } = await apiClient.get<PagedResult<AppNotification>>(endpoints.notifications.list, {
      params: { page: params?.page ?? 1, pageSize: params?.pageSize ?? 20 },
    });
    return data;
  },
  unreadCount: async () => {
    const { data } = await apiClient.get<{ count: number }>(endpoints.notifications.unreadCount);
    return data.count;
  },
  markRead: async (id: string) => {
    await apiClient.post(endpoints.notifications.read(id));
  },
  markAllRead: async () => {
    await apiClient.post(endpoints.notifications.readAll);
  },
};
