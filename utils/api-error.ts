export type ParsedApiError = {
  code: string | null;
  message: string | null;
  fields: string[];
};

const SAFE_FIELD_NAMES = [
  'installationId',
  'expoPushToken',
  'platform',
  'runtimeEnvironment',
  'appVersion',
  'device',
  'device.brand',
  'device.modelName',
  'device.osName',
  'device.osVersion',
  'locale',
  'timezone',
  'preferences',
  'notificationsEnabled',
  'notifyNewVideos',
  'notifyLiveStarts',
  'notifyFollowedEmissions',
  'followedEmissionSlugs',
] as const;

const EXPO_TOKEN_PATTERN = /Expo(?:nent)?PushToken\[[^\]]+\]/gi;
const UUID_PATTERN = /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/gi;
const SERVER_FIELD_HINTS: ReadonlyArray<readonly [RegExp, string]> = [
  [/installationId/i, 'installationId'],
  [/ExpoPushToken/i, 'expoPushToken'],
  [/Plateforme/i, 'platform'],
  [/Environnement d[’']exécution/i, 'runtimeEnvironment'],
  [/appVersion/i, 'appVersion'],
  [/device\.brand/i, 'device.brand'],
  [/device\.modelName/i, 'device.modelName'],
  [/device\.osName/i, 'device.osName'],
  [/device\.osVersion/i, 'device.osVersion'],
  [/locale/i, 'locale'],
  [/timezone/i, 'timezone'],
  [/(?:Liste|slug).*émission/i, 'followedEmissionSlugs'],
];

function safeString(value: unknown, maxLength: number): string | null {
  if (typeof value !== 'string') return null;
  const sanitized = value
    .replace(EXPO_TOKEN_PATTERN, '[token masqué]')
    .replace(UUID_PATTERN, '[identifiant masqué]')
    .trim();
  return sanitized ? sanitized.slice(0, maxLength) : null;
}

export function parseApiError(value: unknown): ParsedApiError {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { code: null, message: null, fields: [] };
  }
  const container = value as Record<string, unknown>;
  const error =
    container.error && typeof container.error === 'object' && !Array.isArray(container.error)
      ? (container.error as Record<string, unknown>)
      : container;
  const code = safeString(error.code, 80);
  const message = safeString(error.message, 240);
  const suppliedFields = Array.isArray(error.fields) ? error.fields : [];
  const explicitFields = SAFE_FIELD_NAMES.filter(
    (field) => suppliedFields.includes(field) || message?.includes(field),
  );
  const inferredFields = message
    ? SERVER_FIELD_HINTS.filter(([pattern]) => pattern.test(message)).map(
        ([, field]) => field,
      )
    : [];
  const fields = [...new Set([...explicitFields, ...inferredFields])];
  return { code, message, fields };
}
