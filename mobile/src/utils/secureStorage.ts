import * as SecureStore from 'expo-secure-store';

export const SecureKeys = {
  AccessToken: 'therapp_access_token',
  RefreshToken: 'therapp_refresh_token',
  User: 'therapp_user',
  HasOnboarded: 'therapp_has_onboarded',
} as const;

export type SecureKey = (typeof SecureKeys)[keyof typeof SecureKeys];

export async function getSecure(key: SecureKey): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

export async function setSecure(key: SecureKey, value: string): Promise<void> {
  await SecureStore.setItemAsync(key, value);
}

export async function deleteSecure(key: SecureKey): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch {
    // ignore
  }
}
