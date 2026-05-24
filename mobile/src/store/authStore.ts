import { create } from 'zustand';
import { authApi, AuthResponse } from '@/api/auth.api';
import { deleteSecure, getSecure, SecureKeys, setSecure } from '@/utils/secureStorage';
import { logger } from '@/utils/logger';
import type { AuthUser } from '@/types/user.types';

type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  hydrated: boolean;
  isAuthenticated: boolean;

  hydrate: () => Promise<void>;
  setSession: (data: AuthResponse) => Promise<void>;
  refresh: () => Promise<string | null>;
  logout: () => Promise<void>;
  clearSession: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  hydrated: false,
  isAuthenticated: false,

  hydrate: async () => {
    const [access, refresh, userJson] = await Promise.all([
      getSecure(SecureKeys.AccessToken),
      getSecure(SecureKeys.RefreshToken),
      getSecure(SecureKeys.User),
    ]);

    let user: AuthUser | null = null;
    if (userJson) {
      try {
        user = JSON.parse(userJson) as AuthUser;
      } catch {
        user = null;
      }
    }

    set({
      accessToken: access,
      refreshToken: refresh,
      user,
      isAuthenticated: !!access && !!user,
      hydrated: true,
    });
  },

  setSession: async (data) => {
    await Promise.all([
      setSecure(SecureKeys.AccessToken, data.accessToken),
      setSecure(SecureKeys.RefreshToken, data.refreshToken),
      setSecure(SecureKeys.User, JSON.stringify(data.user)),
    ]);
    set({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      user: data.user,
      isAuthenticated: true,
    });
  },

  refresh: async () => {
    const rt = get().refreshToken;
    if (!rt) return null;
    try {
      const data = await authApi.refresh(rt);
      await get().setSession(data);
      return data.accessToken;
    } catch (e) {
      logger.warn('Token refresh failed', e);
      await get().clearSession();
      return null;
    }
  },

  logout: async () => {
    const rt = get().refreshToken;
    if (rt) {
      try {
        await authApi.logout(rt);
      } catch (e) {
        logger.warn('Logout API call failed', e);
      }
    }
    await get().clearSession();
  },

  clearSession: async () => {
    await Promise.all([
      deleteSecure(SecureKeys.AccessToken),
      deleteSecure(SecureKeys.RefreshToken),
      deleteSecure(SecureKeys.User),
    ]);
    set({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
    });
  },
}));
