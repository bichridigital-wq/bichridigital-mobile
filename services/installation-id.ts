import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

import {
  parseInstallationIdMigration,
  resolveInstallationId,
  type InstallationIdInspection,
  type InstallationIdResolution,
} from '@/utils/installation-id';

export type {
  InstallationIdInspection,
  InstallationIdKind,
  InstallationIdStatus,
} from '@/utils/installation-id';
export {
  isLegacyInstallationId,
  isUuidV4InstallationId,
  normalizeGeneratedUuid,
} from '@/utils/installation-id';

export const INSTALLATION_ID_STORAGE_KEY = 'bichridigital:installation-id:v1';
export const INSTALLATION_ID_MIGRATION_STORAGE_KEY =
  'bichridigital:installation-id-migration:v1';
export const LEGACY_INSTALLATION_ID_STORAGE_KEY =
  'bichridigital:installation-id-legacy:v1';

let inspectionPromise: Promise<InstallationIdInspection> | null = null;

function createSecureInstallationId() {
  return Crypto.randomUUID();
}

async function persistResolution(resolution: InstallationIdResolution) {
  const migration = resolution.inspection;

  if (resolution.legacyBackup) {
    await AsyncStorage.multiSet([
      [LEGACY_INSTALLATION_ID_STORAGE_KEY, resolution.legacyBackup],
      [INSTALLATION_ID_MIGRATION_STORAGE_KEY, JSON.stringify(migration)],
    ]);
  } else if (resolution.shouldPersistMigration) {
    await AsyncStorage.setItem(
      INSTALLATION_ID_MIGRATION_STORAGE_KEY,
      JSON.stringify(migration),
    );
  }
  if (resolution.shouldPersistPrimary) {
    await AsyncStorage.setItem(
      INSTALLATION_ID_STORAGE_KEY,
      migration.installationId,
    );
  }
  return migration;
}

export async function inspectInstallationIdMigration(): Promise<InstallationIdInspection> {
  const [storedId, storedMigrationValue] = await Promise.all([
    AsyncStorage.getItem(INSTALLATION_ID_STORAGE_KEY),
    AsyncStorage.getItem(INSTALLATION_ID_MIGRATION_STORAGE_KEY),
  ]);
  return persistResolution(resolveInstallationId(
    storedId,
    parseInstallationIdMigration(storedMigrationValue),
    createSecureInstallationId,
  ));
}

export function getOrCreateInstallationId() {
  inspectionPromise ??= inspectInstallationIdMigration().catch((error) => {
    inspectionPromise = null;
    throw error;
  });
  return inspectionPromise;
}

export async function completeInstallationIdMigration() {
  const inspection = await getOrCreateInstallationId();
  if (inspection.status !== 'migration-pending') return inspection;

  const completed: InstallationIdInspection = {
    ...inspection,
    status: 'ready',
  };
  await AsyncStorage.multiSet([
    [INSTALLATION_ID_MIGRATION_STORAGE_KEY, JSON.stringify(completed)],
  ]);
  await AsyncStorage.removeItem(LEGACY_INSTALLATION_ID_STORAGE_KEY);
  inspectionPromise = Promise.resolve(completed);
  return completed;
}

export async function getInstallationId() {
  return (await getOrCreateInstallationId()).installationId;
}
