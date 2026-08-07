import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { parseApiError } from '../utils/api-error.ts';
import { buildApiUrl } from '../utils/api-url.ts';
import {
  isLegacyInstallationId,
  isUuidV4InstallationId,
  normalizeGeneratedUuid,
  resolveInstallationId,
} from '../utils/installation-id.ts';
import { getSafeNotificationDestination } from '../utils/push-navigation.ts';
import {
  createPushPreferences,
  createPushRegistrationPayload,
  getPushDeviceOsName,
  serializePushPreferences,
  shouldSyncPushPreferences,
} from '../utils/push-preferences.ts';

const UUID = '123e4567-e89b-42d3-a456-426614174000';
const UUID_2 = '223e4567-e89b-42d3-a456-426614174001';
const API_BASE_URL = 'https://www.bichridigital.com/api';

test('Push device OS names use stable lowercase server values', () => {
  assert.equal(getPushDeviceOsName('android'), 'android');
  assert.equal(getPushDeviceOsName('ios'), 'ios');
  assert.notEqual(getPushDeviceOsName('android'), 'Android');
  assert.notEqual(getPushDeviceOsName('ios'), 'iOS');
});

test('API URLs normalize the base and never duplicate the API prefix', () => {
  assert.equal(
    buildApiUrl(API_BASE_URL, '/push/register'),
    'https://www.bichridigital.com/api/push/register',
  );
  assert.equal(
    buildApiUrl(`${API_BASE_URL}/`, 'push/register'),
    'https://www.bichridigital.com/api/push/register',
  );
  assert.equal(
    buildApiUrl(API_BASE_URL, '/api/push/register'),
    'https://www.bichridigital.com/api/push/register',
  );
  assert.doesNotMatch(
    buildApiUrl(API_BASE_URL, '/api/push/register'),
    /\/api\/api\//,
  );
  assert.equal(
    buildApiUrl(API_BASE_URL, '/schedule/upcoming?fresh=123'),
    'https://www.bichridigital.com/api/schedule/upcoming?fresh=123',
  );
  assert.equal(
    buildApiUrl(API_BASE_URL, '/youtube/live'),
    'https://www.bichridigital.com/api/youtube/live',
  );
});

test('Push PATCH and DELETE routes use the normalized API endpoints', async () => {
  const serviceSource = await readFile(
    new URL('../services/push-registration.ts', import.meta.url),
    'utf8',
  );
  assert.match(serviceSource, /PUSH_PREFERENCES_PATH = '\/push\/preferences'/);
  assert.match(serviceSource, /PUSH_UNREGISTER_PATH = '\/push\/unregister'/);
  assert.equal(
    buildApiUrl(API_BASE_URL, '/push/preferences'),
    'https://www.bichridigital.com/api/push/preferences',
  );
  assert.equal(
    buildApiUrl(API_BASE_URL, '/push/unregister'),
    'https://www.bichridigital.com/api/push/unregister',
  );
});

test('Push registration payload matches the strict server contract', () => {
  const payload = createPushRegistrationPayload({
    installationId: UUID,
    expoPushToken: '[masked]',
    platform: 'android',
    runtimeEnvironment: 'development-build',
    appVersion: ' 1.0.0 ',
    device: {
      brand: ' Example ',
      modelName: null,
      osName: getPushDeviceOsName('android'),
      osVersion: undefined,
    },
    locale: ' fr-FR ',
    timezone: null,
    preferences: {
      notificationsEnabled: true,
      notifyNewVideos: true,
      notifyLiveStarts: false,
      notifyFollowedEmissions: true,
    },
    followedEmissionSlugs: [' Journal-Soir ', 'journal-soir'],
  });

  assert.deepEqual(Object.keys(payload).sort(), [
    'appVersion',
    'device',
    'expoPushToken',
    'installationId',
    'locale',
    'platform',
    'preferences',
    'runtimeEnvironment',
  ]);
  assert.equal(payload.runtimeEnvironment, 'development-build');
  assert.deepEqual(payload.device, { brand: 'Example', osName: 'android' });
  assert.equal('timezone' in payload, false);
  assert.deepEqual(payload.preferences.followedEmissionSlugs, ['journal-soir']);
});

test('structured API errors retain diagnostics without leaking identifiers', () => {
  const parsed = parseApiError({
    error: {
      code: 'VALIDATION_ERROR',
      message: `Environnement d’exécution invalide. ${UUID}`,
      fields: [UUID, 'unknownField'],
    },
  });
  const diagnostic = JSON.stringify(parsed);

  assert.equal(parsed.code, 'VALIDATION_ERROR');
  assert.deepEqual(parsed.fields, ['runtimeEnvironment']);
  assert.doesNotMatch(diagnostic, new RegExp(UUID));
});

test('absence creates one canonical UUIDv4', () => {
  let calls = 0;
  const result = resolveInstallationId(null, null, () => {
    calls += 1;
    return UUID.toUpperCase();
  });
  assert.equal(result.inspection.installationId, UUID);
  assert.equal(result.inspection.kind, 'uuid');
  assert.equal(result.shouldPersistPrimary, true);
  assert.equal(calls, 1);
});

test('existing UUID is stable and is not rewritten', () => {
  const result = resolveInstallationId(UUID, null, () => UUID_2);
  assert.equal(result.inspection.installationId, UUID);
  assert.equal(result.shouldPersistPrimary, false);
});

test('legacy identifier migrates once and retains its pending UUID', () => {
  const legacy = 'install_abc_12345678';
  const first = resolveInstallationId(legacy, null, () => UUID);
  const second = resolveInstallationId(legacy, first.inspection, () => UUID_2);
  assert.equal(isLegacyInstallationId(legacy), true);
  assert.equal(first.inspection.kind, 'legacy-migrated');
  assert.equal(first.legacyBackup, legacy);
  assert.equal(second.inspection.installationId, UUID);
});

test('invalid identifier is replaced once without retaining it as legacy proof', () => {
  const first = resolveInstallationId('invalid-private-value', null, () => UUID);
  const second = resolveInstallationId('invalid-private-value', first.inspection, () => UUID_2);
  assert.equal(first.inspection.kind, 'invalid-migrated');
  assert.equal(first.legacyBackup, null);
  assert.equal(second.inspection.installationId, UUID);
});

test('UUID validation is strict and normalization is lowercase', () => {
  assert.equal(isUuidV4InstallationId(UUID), true);
  assert.equal(normalizeGeneratedUuid(UUID.toUpperCase()), UUID);
  assert.equal(isUuidV4InstallationId('123e4567-e89b-12d3-a456-426614174000'), false);
});

test('notification navigation accepts only known validated destinations', () => {
  assert.deepEqual(getSafeNotificationDestination({ type: 'profile' }), { pathname: '/(tabs)/profil' });
  assert.deepEqual(getSafeNotificationDestination({ type: 'live' }), { pathname: '/(tabs)/direct' });
  assert.deepEqual(getSafeNotificationDestination({ type: 'emission', emissionSlug: 'journal-soir' }), { pathname: '/emission/[slug]', params: { slug: 'journal-soir' } });
  assert.deepEqual(getSafeNotificationDestination({ type: 'video', videoId: 'AbCdEf123_-' }), { pathname: '/video/[videoId]', params: { videoId: 'AbCdEf123_-' } });
  assert.equal(getSafeNotificationDestination({ type: 'video', videoId: 'https://bad' }), null);
  assert.equal(getSafeNotificationDestination({ type: 'external', route: 'https://bad.example' }), null);
});

test('preferences deduplicate followed emissions and identical snapshots do not PATCH', () => {
  const preferences = createPushPreferences(
    {
      notificationsEnabled: true,
      notifyNewVideos: true,
      notifyLiveStarts: false,
      notifyFollowedEmissions: true,
    },
    ['journal-soir', ' Journal-Soir ', 'matin'],
  );
  assert.deepEqual(preferences.followedEmissionSlugs, ['journal-soir', 'matin']);
  assert.equal(
    shouldSyncPushPreferences(serializePushPreferences(preferences), preferences),
    false,
  );
  assert.equal(shouldSyncPushPreferences(null, preferences), true);
});

test('push source uses the required HTTP methods and lifecycle safeguards', async () => {
  const [installationSource, serviceSource, providerSource, tabsSource] = await Promise.all([
    readFile(new URL('../services/installation-id.ts', import.meta.url), 'utf8'),
    readFile(new URL('../services/push-registration.ts', import.meta.url), 'utf8'),
    readFile(new URL('../hooks/use-notifications.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../app/(tabs)/_layout.tsx', import.meta.url), 'utf8'),
  ]);
  assert.doesNotMatch(installationSource, /Math\.random/);
  assert.match(installationSource, /Crypto\.randomUUID\(\)/);
  assert.match(serviceSource, /apiPost<void>\(PUSH_REGISTRATION_PATH/);
  assert.match(serviceSource, /apiPatch<void>\(PUSH_PREFERENCES_PATH/);
  assert.match(serviceSource, /apiDelete<void>\(PUSH_UNREGISTER_PATH/);
  assert.match(serviceSource, /skipIfExpoToken/);
  assert.match(serviceSource, /ExecutionEnvironment\.StoreClient/);
  assert.match(serviceSource, /if \(!getEasProjectId\(\)\) return 'missing-project-id'/);
  assert.match(providerSource, /addPushTokenListener/);
  assert.match(providerSource, /subscription\.remove\(\)/);
  assert.match(providerSource, /setPushRegistrationStatus\('unregistering'\)/);
  assert.match(providerSource, /setNotificationsEnabled\(false\)/);
  assert.match(providerSource, /return false/);
  assert.equal((providerSource.match(/requestNotificationPermissionSnapshot\(\)/g) ?? []).length, 1);
  assert.match(providerSource, /\.catch\(\(error\) => \{/);
  assert.doesNotMatch(providerSource, /console\.(?:log|info|warn|error).*Token/);
  assert.equal((tabsSource.match(/<Tabs\.Screen/g) ?? []).length, 5);
});
