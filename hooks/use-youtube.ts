import { useCallback, useEffect, useRef, useState } from 'react';

import {
  getFeaturedVideos,
  getLatestVideos,
  getLiveBroadcast,
  getPlaylistVideos,
  getPlaylists,
} from '@/services/youtube';
import type { LiveBroadcast, Playlist, Video } from '@/types/youtube';

type YoutubeQueryResult<T> = {
  data: T | null;
  loading: boolean;
  refreshing: boolean;
  error: Error | null;
  reload: () => void;
};

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}

function useYoutubeQuery<T>(loader: () => Promise<T>): YoutubeQueryResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [reloadCount, setReloadCount] = useState(0);
  const hasLoadedRef = useRef(false);
  const requestInFlightRef = useRef(false);

  const reload = useCallback(() => {
    if (requestInFlightRef.current) {
      return;
    }
    setReloadCount((currentCount) => currentCount + 1);
  }, []);

  useEffect(() => {
    let isMounted = true;

    requestInFlightRef.current = true;
    if (hasLoadedRef.current) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    loader()
      .then((result) => {
        if (isMounted) {
          setData(result);
        }
      })
      .catch((loadError: unknown) => {
        if (isMounted) {
          setError(toError(loadError));
        }
      })
      .finally(() => {
        requestInFlightRef.current = false;
        hasLoadedRef.current = true;
        if (isMounted) {
          setLoading(false);
          setRefreshing(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [loader, reloadCount]);

  return { data, loading, refreshing, error, reload };
}

export function useFeaturedVideos(): YoutubeQueryResult<Video[]> {
  return useYoutubeQuery(getFeaturedVideos);
}

export function useLatestVideos(): YoutubeQueryResult<Video[]> {
  return useYoutubeQuery(getLatestVideos);
}

export function usePlaylists(): YoutubeQueryResult<Playlist[]> {
  return useYoutubeQuery(getPlaylists);
}

export function useLiveBroadcast(): YoutubeQueryResult<LiveBroadcast | null> {
  return useYoutubeQuery(getLiveBroadcast);
}

export function usePlaylistVideos(playlistId: string): YoutubeQueryResult<Video[]> {
  const loadPlaylistVideos = useCallback(
    () => getPlaylistVideos(playlistId),
    [playlistId],
  );

  return useYoutubeQuery(loadPlaylistVideos);
}
