const LEGACY_INSTALLATION_PATTERN = /^install_[a-z0-9]+_[a-z0-9]{8,160}$/;
const UUID_V4_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

export type InstallationIdKind =
  | 'uuid'
  | 'legacy-migrated'
  | 'invalid-migrated';
export type InstallationIdStatus = 'ready' | 'migration-pending';
export type InstallationIdInspection = {
  installationId: string;
  kind: InstallationIdKind;
  status: InstallationIdStatus;
};
export type StoredInstallationIdMigration = InstallationIdInspection;
export type InstallationIdResolution = {
  inspection: InstallationIdInspection;
  shouldPersistPrimary: boolean;
  legacyBackup: string | null;
  shouldPersistMigration: boolean;
};

export function isLegacyInstallationId(value: unknown): value is string {
  return typeof value === 'string' && LEGACY_INSTALLATION_PATTERN.test(value);
}

export function isUuidV4InstallationId(value: unknown): value is string {
  return typeof value === 'string' && UUID_V4_PATTERN.test(value);
}

export function normalizeGeneratedUuid(value: string) {
  const normalized = value.toLowerCase();
  if (!isUuidV4InstallationId(normalized)) {
    throw new Error('INSTALLATION_ID_GENERATION_FAILED');
  }
  return normalized;
}

export function parseInstallationIdMigration(
  value: string | null,
): StoredInstallationIdMigration | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as Partial<StoredInstallationIdMigration>;
    if (
      isUuidV4InstallationId(parsed.installationId) &&
      (parsed.kind === 'legacy-migrated' || parsed.kind === 'invalid-migrated') &&
      (parsed.status === 'ready' || parsed.status === 'migration-pending')
    ) return parsed as StoredInstallationIdMigration;
  } catch {
    // Invalid diagnostic data is deliberately ignored.
  }
  return null;
}

export function resolveInstallationId(
  storedId: string | null,
  existingMigration: StoredInstallationIdMigration | null,
  generateUuid: () => string,
): InstallationIdResolution {
  if (isUuidV4InstallationId(storedId)) {
    return {
      inspection: existingMigration?.installationId === storedId
        ? existingMigration
        : { installationId: storedId, kind: 'uuid', status: 'ready' },
      shouldPersistPrimary: false,
      legacyBackup: null,
      shouldPersistMigration: false,
    };
  }
  if (!storedId) {
    return {
      inspection: { installationId: normalizeGeneratedUuid(generateUuid()), kind: 'uuid', status: 'ready' },
      shouldPersistPrimary: true,
      legacyBackup: null,
      shouldPersistMigration: false,
    };
  }
  const kind = isLegacyInstallationId(storedId) ? 'legacy-migrated' : 'invalid-migrated';
  return {
    inspection: {
      installationId: existingMigration?.status === 'migration-pending'
        ? existingMigration.installationId
        : normalizeGeneratedUuid(generateUuid()),
      kind,
      status: 'migration-pending',
    },
    shouldPersistPrimary: true,
    legacyBackup: kind === 'legacy-migrated' ? storedId : null,
    shouldPersistMigration: true,
  };
}
