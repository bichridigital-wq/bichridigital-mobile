export type YoutubeDataMode = 'mock' | 'remote';

export const YOUTUBE_DATA_MODE: YoutubeDataMode = 'mock';

export const BICHRIDIGITAL_API_URL =
  process.env.EXPO_PUBLIC_BICHRIDIGITAL_API_URL?.trim() ?? '';

export const API_REQUEST_TIMEOUT_MS = 10_000;
