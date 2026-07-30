import AsyncStorage from '@react-native-async-storage/async-storage';

import type { UserLibraryData } from '@/types/user-library';

export const USER_LIBRARY_STORAGE_KEY = 'bichridigital:user-library:v1';
export const USER_LIBRARY_VERSION = 1 as const;

export function createEmptyUserLibrary(): UserLibraryData {
  return {
    version: USER_LIBRARY_VERSION,
    favoriteVideos: [],
    favoriteEmissions: [],
    recentlyWatched: [],
    preferences: {
      notificationsEnabled: false,
      notifyNewVideos: true,
      notifyLiveStarts: true,
      notifyFollowedEmissions: true,
    },
  };
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function readStoredLibrary(value: unknown): UserLibraryData | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const candidate = value as Partial<UserLibraryData>;
  if (
    candidate.version !== USER_LIBRARY_VERSION ||
    !Array.isArray(candidate.favoriteVideos) ||
    !Array.isArray(candidate.favoriteEmissions) ||
    !Array.isArray(candidate.recentlyWatched) ||
    !candidate.preferences ||
    typeof candidate.preferences.notificationsEnabled !== 'boolean'
  ) {
    return null;
  }

  const favoriteVideos = candidate.favoriteVideos.filter(
    (video) =>
      isString(video?.videoId) &&
      isString(video.title) &&
      isString(video.channelTitle) &&
      isString(video.publishedAt) &&
      isString(video.duration) &&
      isString(video.savedAt),
  );
  const favoriteEmissions = candidate.favoriteEmissions.filter(
    (emission) =>
      isString(emission?.slug) &&
      isString(emission.title) &&
      isString(emission.category) &&
      isString(emission.coverColor) &&
      isString(emission.savedAt),
  );
  const recentlyWatched = candidate.recentlyWatched
    .filter(
      (video) =>
        isString(video?.videoId) &&
        isString(video.title) &&
        isString(video.channelTitle) &&
        isString(video.publishedAt) &&
        isString(video.duration) &&
        isString(video.watchedAt),
    )
    .slice(0, 30);

  return {
    version: USER_LIBRARY_VERSION,
    favoriteVideos,
    favoriteEmissions,
    recentlyWatched,
    preferences: {
      notificationsEnabled: candidate.preferences.notificationsEnabled,
      notifyNewVideos:
        typeof candidate.preferences.notifyNewVideos === 'boolean'
          ? candidate.preferences.notifyNewVideos
          : true,
      notifyLiveStarts:
        typeof candidate.preferences.notifyLiveStarts === 'boolean'
          ? candidate.preferences.notifyLiveStarts
          : true,
      notifyFollowedEmissions:
        typeof candidate.preferences.notifyFollowedEmissions === 'boolean'
          ? candidate.preferences.notifyFollowedEmissions
          : true,
    },
  };
}

export async function loadUserLibrary(): Promise<UserLibraryData> {
  const storedValue = await AsyncStorage.getItem(USER_LIBRARY_STORAGE_KEY);
  if (!storedValue) {
    return createEmptyUserLibrary();
  }

  const parsedValue: unknown = JSON.parse(storedValue);
  const library = readStoredLibrary(parsedValue);
  if (!library) {
    throw new Error('USER_LIBRARY_INVALID_DATA');
  }

  return library;
}

export async function saveUserLibrary(library: UserLibraryData): Promise<void> {
  await AsyncStorage.setItem(USER_LIBRARY_STORAGE_KEY, JSON.stringify(library));
}
