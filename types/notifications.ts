export type NotificationPermissionStatus =
  | 'undetermined'
  | 'granted'
  | 'denied'
  | 'unavailable';

export type NotificationTestFeedback = 'scheduled' | 'error' | null;

export type NotificationPermissionSnapshot = {
  status: NotificationPermissionStatus;
  canAskAgain: boolean;
};
