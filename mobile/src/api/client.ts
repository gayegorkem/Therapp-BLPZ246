import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { getApiUrl } from '@/utils/getApiUrl';
import { logger } from '@/utils/logger';
import { useAuthStore } from '@/store/authStore';
import type { ApiError } from '@/types/api.types';

const baseURL = getApiUrl();

export const apiClient = axios.create({
  baseURL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Bare client for refresh (avoids interceptor recursion)
export const bareClient = axios.create({
  baseURL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ---------- Request: attach token ----------
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ---------- Response: auto-refresh on 401 ----------
let refreshInFlight: Promise<string | null> | null = null;

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as AxiosRequestConfig & { _retried?: boolean };
    const status = error.response?.status;

    // Don't intercept the refresh / login / register endpoints themselves
    const url = original?.url ?? '';
    const isAuthCall =
      url.includes('/auth/refresh') ||
      url.includes('/auth/login') ||
      url.includes('/auth/register');

    if (status === 401 && !original._retried && !isAuthCall) {
      original._retried = true;

      if (!refreshInFlight) {
        refreshInFlight = useAuthStore
          .getState()
          .refresh()
          .finally(() => {
            refreshInFlight = null;
          });
      }

      try {
        const newToken = await refreshInFlight;
        if (newToken && original.headers) {
          (original.headers as Record<string, string>).Authorization = `Bearer ${newToken}`;
          return apiClient(original);
        }
      } catch (e) {
        logger.warn('Refresh failed', e);
      }

      // refresh failed -> clear session, let caller handle
      await useAuthStore.getState().clearSession();
    }

    return Promise.reject(error);
  }
);

// ---------- Helpers ----------
export function toApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiError | undefined;
    if (data?.message) return data;
    return {
      code: 'NETWORK_ERROR',
      message: error.message || 'Bağlantı hatası, lütfen tekrar deneyin.',
    };
  }
  return {
    code: 'UNKNOWN',
    message: 'Beklenmeyen bir hata oluştu.',
  };
}
