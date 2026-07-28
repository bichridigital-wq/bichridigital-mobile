export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  publishedAt: string;
  duration: string;
  channelTitle: string;
  playlistId?: string;
  isLive: boolean;
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  itemCount: number;
}

export interface LiveBroadcast {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  scheduledStartTime: string;
  actualStartTime?: string;
  status: 'upcoming' | 'live' | 'completed';
}

export interface Channel {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  subscriberCount?: number;
  videoCount?: number;
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
  source: 'youtube';
}
