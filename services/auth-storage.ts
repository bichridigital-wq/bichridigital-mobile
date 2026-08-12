import * as SecureStore from 'expo-secure-store';
import { createChunkedSecureStorage } from '@/services/chunked-secure-storage';

const OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
};

export const authStorage = createChunkedSecureStorage({
  getItemAsync: (key) => SecureStore.getItemAsync(key, OPTIONS),
  setItemAsync: (key, value) => SecureStore.setItemAsync(key, value, OPTIONS),
  deleteItemAsync: (key) => SecureStore.deleteItemAsync(key, OPTIONS),
});

export const PENDING_DISPLAY_NAME_KEY = 'bichridigital:auth:pending-display-name:v1';
