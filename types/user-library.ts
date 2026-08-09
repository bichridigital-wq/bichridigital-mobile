import type { NotificationPreferences } from '@/types/notification-preferences';

export type LibraryVideoInput = {
  videoId: string;
  title: string;
  thumbnailUrl?: string;
  channelTitle: string;
  publishedAt: string;
  duration: string;
};

export type FavoriteVideo = LibraryVideoInput & {
  savedAt: string;
};

export type RecentlyWatchedVideo = LibraryVideoInput & {
  watchedAt: string;
};

export type LibraryEmissionInput = {
  slug: string;
  title: string;
  category: string;
  coverColor: string;
  programId?: string | null;
};

export type FavoriteEmission = LibraryEmissionInput & {
  savedAt: string;
};

export type UserLibraryData = {
  version: 1;
  favoriteVideos: FavoriteVideo[];
  favoriteEmissions: FavoriteEmission[];
  recentlyWatched: RecentlyWatchedVideo[];
  preferences: NotificationPreferences;
};
