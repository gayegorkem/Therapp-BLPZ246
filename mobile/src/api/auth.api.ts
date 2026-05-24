import { apiClient, bareClient } from './client';
import { endpoints } from './endpoints';
import type { AuthUser } from '@/types/user.types';

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  user: AuthUser;
};

export type RegisterPayload = {
  username: string;
  email: string;
  password: string;
  displayName: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export const authApi = {
  register: async (payload: RegisterPayload) => {
    const { data } = await bareClient.post<AuthResponse>(endpoints.auth.register, payload);
    return data;
  },
  login: async (payload: LoginPayload) => {
    const { data } = await bareClient.post<AuthResponse>(endpoints.auth.login, payload);
    return data;
  },
  refresh: async (refreshToken: string) => {
    const { data } = await bareClient.post<AuthResponse>(endpoints.auth.refresh, { refreshToken });
    return data;
  },
  logout: async (refreshToken: string) => {
    await apiClient.post(endpoints.auth.logout, { refreshToken });
  },
};
