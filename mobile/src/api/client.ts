import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { getApiUrl } from '@/utils/getApiUrl';
import { logger } from '@/utils/logger';
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

// ---------- Auth wiring (registered by the auth store) ----------
// We intentionally do NOT import the auth store here. That would create a
// require cycle (auth.api -> client -> authStore -> auth.api) which can leave
// modules uninitialized under the new architecture. Instead the store
// registers its handlers at startup via configureAuth().
type AuthHandlers = {
  getToken: () => string | null;
  refresh: () => Promise<string | null>;
  onAuthFailure: () => Promise<void>;
};

let authHandlers: AuthHandlers = {
  getToken: () => null,
  refresh: async () => null,
  onAuthFailure: async () => {},
};

export function configureAuth(handlers: AuthHandlers) {
  authHandlers = handlers;
}

// ---------- Request: attach token ----------
apiClient.interceptors.request.use((config) => {
  const token = authHandlers.getToken();
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
        refreshInFlight = authHandlers.refresh().finally(() => {
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
      await authHandlers.onAuthFailure();
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
