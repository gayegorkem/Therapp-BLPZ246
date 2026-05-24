import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { notificationsApi } from '@/api/notifications.api';
import type { PagedResult } from '@/types/api.types';
import type { AppNotification } from '@/types/notification.types';
import { queryKeys } from './queryKeys';

type InfiniteNotifs = { pages: PagedResult<AppNotification>[]; pageParams: number[] };

export function useNotifications() {
  return useInfiniteQuery({
    queryKey: queryKeys.notifications.list,
    queryFn: ({ pageParam }) => notificationsApi.list({ page: pageParam, pageSize: 20 }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.hasNext ? last.page + 1 : undefined),
  });
}

export function useUnreadCount(enabled = true) {
  return useQuery({
    queryKey: queryKeys.notifications.unreadCount,
    queryFn: notificationsApi.unreadCount,
    enabled,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

export function useMarkRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onMutate: async (id) => {
      qc.setQueryData<InfiniteNotifs>(queryKeys.notifications.list, (data) => {
        if (!data?.pages) return data;
        return {
          ...data,
          pages: data.pages.map((p) => ({
            ...p,
            items: p.items.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
          })),
        };
      });
      qc.setQueryData<number>(queryKeys.notifications.unreadCount, (c) =>
        c && c > 0 ? c - 1 : 0
      );
    },
    onError: () => {
      qc.invalidateQueries({ queryKey: queryKeys.notifications.list });
      qc.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount });
    },
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onMutate: async () => {
      qc.setQueryData<InfiniteNotifs>(queryKeys.notifications.list, (data) => {
        if (!data?.pages) return data;
        return {
          ...data,
          pages: data.pages.map((p) => ({
            ...p,
            items: p.items.map((n) => ({ ...n, isRead: true })),
          })),
        };
      });
      qc.setQueryData<number>(queryKeys.notifications.unreadCount, 0);
    },
    onError: () => {
      qc.invalidateQueries({ queryKey: queryKeys.notifications.list });
      qc.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount });
    },
  });
}
