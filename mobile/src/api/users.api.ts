import { apiClient } from './client';
import { endpoints } from './endpoints';
import type { UserMe, UserProfile } from '@/types/user.types';

export type UpdateProfilePayload = {
  displayName: string;
  bio?: string | null;
  avatarUrl?: string | null;
};

export const usersApi = {
  me: async () => {
    const { data } = await apiClient.get<UserMe>(endpoints.users.me);
    return data;
  },
  updateMe: async (payload: UpdateProfilePayload) => {
    const { data } = await apiClient.patch<UserMe>(endpoints.users.me, payload);
    return data;
  },
  deleteMe: async () => {
    await apiClient.delete(endpoints.users.me);
  },
  byUsername: async (username: string) => {
    const { data } = await apiClient.get<UserProfile>(endpoints.users.byUsername(username));
    return data;
  },
};
