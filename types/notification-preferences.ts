export type NotificationPreferenceKey =
  | 'notifyNewVideos'
  | 'notifyLiveStarts'
  | 'notifyFollowedEmissions';

export type NotificationPreferences = {
  notificationsEnabled: boolean;
  notifyNewVideos: boolean;
  notifyLiveStarts: boolean;
  notifyFollowedEmissions: boolean;
};
