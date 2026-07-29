import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import {
  createEmptyUserLibrary,
  loadUserLibrary,
  saveUserLibrary,
} from '@/services/user-library-storage';
import type {
  FavoriteEmission,
  FavoriteVideo,
  LibraryEmissionInput,
  LibraryVideoInput,
  RecentlyWatchedVideo,
  UserLibraryData,
} from '@/types/user-library';

const MAX_RECENTLY_WATCHED = 30;

type UserLibraryContextValue = {
  isHydrated: boolean;
  storageError: boolean;
  favoriteVideos: FavoriteVideo[];
  favoriteEmissions: FavoriteEmission[];
  recentlyWatched: RecentlyWatchedVideo[];
  notificationsEnabled: boolean;
  isVideoFavorite: (videoId: string) => boolean;
  toggleVideoFavorite: (video: LibraryVideoInput) => void;
  isEmissionFavorite: (slug: string) => boolean;
  toggleEmissionFavorite: (emission: LibraryEmissionInput) => void;
  addRecentlyWatched: (video: LibraryVideoInput) => void;
  removeFavoriteVideo: (videoId: string) => void;
  removeFavoriteEmission: (slug: string) => void;
  clearRecentlyWatched: () => void;
  clearAllLibraryData: () => void;
  setNotificationsEnabled: (value: boolean) => void;
};

const UserLibraryContext = createContext<UserLibraryContextValue | null>(null);

export function UserLibraryProvider({ children }: { children: ReactNode }) {
  const [library, setLibrary] = useState(createEmptyUserLibrary);
  const [isHydrated, setIsHydrated] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const libraryRef = useRef(library);
  const hydratedRef = useRef(false);
  const writeQueueRef = useRef(Promise.resolve());

  useEffect(() => {
    let isMounted = true;

    loadUserLibrary()
      .then((storedLibrary) => {
        if (isMounted) {
          libraryRef.current = storedLibrary;
          setLibrary(storedLibrary);
        }
      })
      .catch(() => {
        if (isMounted) {
          setStorageError(true);
          console.error('User library hydration failed.');
        }
      })
      .finally(() => {
        if (isMounted) {
          hydratedRef.current = true;
          setIsHydrated(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const commit = useCallback(
    (update: (current: UserLibraryData) => UserLibraryData) => {
      if (!hydratedRef.current) {
        return;
      }

      const nextLibrary = update(libraryRef.current);
      libraryRef.current = nextLibrary;
      setLibrary(nextLibrary);
      writeQueueRef.current = writeQueueRef.current
        .catch(() => undefined)
        .then(() => saveUserLibrary(nextLibrary))
        .catch(() => {
          setStorageError(true);
          console.error('User library persistence failed.');
        });
    },
    [],
  );

  const removeFavoriteVideo = useCallback(
    (videoId: string) => {
      commit((current) => ({
        ...current,
        favoriteVideos: current.favoriteVideos.filter(
          (video) => video.videoId !== videoId,
        ),
      }));
    },
    [commit],
  );

  const toggleVideoFavorite = useCallback(
    (video: LibraryVideoInput) => {
      if (!video.videoId.trim()) {
        return;
      }
      commit((current) => {
        const exists = current.favoriteVideos.some(
          (favorite) => favorite.videoId === video.videoId,
        );
        return {
          ...current,
          favoriteVideos: exists
            ? current.favoriteVideos.filter(
                (favorite) => favorite.videoId !== video.videoId,
              )
            : [{ ...video, savedAt: new Date().toISOString() }, ...current.favoriteVideos],
        };
      });
    },
    [commit],
  );

  const removeFavoriteEmission = useCallback(
    (slug: string) => {
      commit((current) => ({
        ...current,
        favoriteEmissions: current.favoriteEmissions.filter(
          (emission) => emission.slug !== slug,
        ),
      }));
    },
    [commit],
  );

  const toggleEmissionFavorite = useCallback(
    (emission: LibraryEmissionInput) => {
      if (!emission.slug.trim()) {
        return;
      }
      commit((current) => {
        const exists = current.favoriteEmissions.some(
          (favorite) => favorite.slug === emission.slug,
        );
        return {
          ...current,
          favoriteEmissions: exists
            ? current.favoriteEmissions.filter(
                (favorite) => favorite.slug !== emission.slug,
              )
            : [
                { ...emission, savedAt: new Date().toISOString() },
                ...current.favoriteEmissions,
              ],
        };
      });
    },
    [commit],
  );

  const addRecentlyWatched = useCallback(
    (video: LibraryVideoInput) => {
      if (!video.videoId.trim()) {
        return;
      }
      commit((current) => ({
        ...current,
        recentlyWatched: [
          { ...video, watchedAt: new Date().toISOString() },
          ...current.recentlyWatched.filter(
            (recent) => recent.videoId !== video.videoId,
          ),
        ].slice(0, MAX_RECENTLY_WATCHED),
      }));
    },
    [commit],
  );

  const clearRecentlyWatched = useCallback(() => {
    commit((current) => ({ ...current, recentlyWatched: [] }));
  }, [commit]);

  const clearAllLibraryData = useCallback(() => {
    commit(() => createEmptyUserLibrary());
  }, [commit]);

  const setNotificationsEnabled = useCallback(
    (value: boolean) => {
      commit((current) => ({
        ...current,
        preferences: { ...current.preferences, notificationsEnabled: value },
      }));
    },
    [commit],
  );

  const value = useMemo<UserLibraryContextValue>(
    () => ({
      isHydrated,
      storageError,
      favoriteVideos: library.favoriteVideos,
      favoriteEmissions: library.favoriteEmissions,
      recentlyWatched: library.recentlyWatched,
      notificationsEnabled: library.preferences.notificationsEnabled,
      isVideoFavorite: (videoId) =>
        library.favoriteVideos.some((video) => video.videoId === videoId),
      toggleVideoFavorite,
      isEmissionFavorite: (slug) =>
        library.favoriteEmissions.some((emission) => emission.slug === slug),
      toggleEmissionFavorite,
      addRecentlyWatched,
      removeFavoriteVideo,
      removeFavoriteEmission,
      clearRecentlyWatched,
      clearAllLibraryData,
      setNotificationsEnabled,
    }),
    [
      addRecentlyWatched,
      clearAllLibraryData,
      clearRecentlyWatched,
      isHydrated,
      library,
      removeFavoriteEmission,
      removeFavoriteVideo,
      setNotificationsEnabled,
      storageError,
      toggleEmissionFavorite,
      toggleVideoFavorite,
    ],
  );

  return (
    <UserLibraryContext.Provider value={value}>
      {children}
    </UserLibraryContext.Provider>
  );
}

export function useUserLibrary(): UserLibraryContextValue {
  const context = useContext(UserLibraryContext);
  if (!context) {
    throw new Error('useUserLibrary must be used within UserLibraryProvider.');
  }
  return context;
}
