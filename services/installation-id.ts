import AsyncStorage from '@react-native-async-storage/async-storage';

const INSTALLATION_ID_STORAGE_KEY = 'bichridigital:installation-id:v1';
let installationIdPromise: Promise<string> | null = null;

function createInstallationId() {
  const randomPart = Array.from({ length: 4 }, () =>
    Math.random().toString(36).slice(2),
  ).join('');

  return `install_${Date.now().toString(36)}_${randomPart}`;
}

async function loadOrCreateInstallationId() {
  const storedId = await AsyncStorage.getItem(INSTALLATION_ID_STORAGE_KEY);
  if (storedId?.startsWith('install_')) {
    return storedId;
  }

  const installationId = createInstallationId();
  await AsyncStorage.setItem(INSTALLATION_ID_STORAGE_KEY, installationId);
  return installationId;
}

export function getInstallationId() {
  installationIdPromise ??= loadOrCreateInstallationId().catch((error) => {
    installationIdPromise = null;
    throw error;
  });

  return installationIdPromise;
}

