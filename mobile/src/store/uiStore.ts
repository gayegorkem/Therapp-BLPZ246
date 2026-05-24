import { create } from 'zustand';
import { deleteSecure, getSecure, SecureKeys, setSecure } from '@/utils/secureStorage';

type UiState = {
  hasOnboarded: boolean;
  hydrated: boolean;

  hydrate: () => Promise<void>;
  setOnboarded: (value: boolean) => Promise<void>;
};

export const useUiStore = create<UiState>((set) => ({
  hasOnboarded: false,
  hydrated: false,

  hydrate: async () => {
    const value = await getSecure(SecureKeys.HasOnboarded);
    set({ hasOnboarded: value === '1', hydrated: true });
  },

  setOnboarded: async (value) => {
    if (value) {
      await setSecure(SecureKeys.HasOnboarded, '1');
    } else {
      await deleteSecure(SecureKeys.HasOnboarded);
    }
    set({ hasOnboarded: value });
  },
}));
