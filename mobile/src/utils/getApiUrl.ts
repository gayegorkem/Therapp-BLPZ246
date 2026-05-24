import Constants from 'expo-constants';

export function getApiUrl(): string {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl && envUrl.trim().length > 0) return envUrl;

  const extra = (Constants.expoConfig?.extra ?? {}) as { apiUrl?: string };
  return extra.apiUrl ?? 'http://localhost:5080/api';
}
