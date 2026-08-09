export type ScheduleEventStatus = 'scheduled';

export type ScheduleEvent = {
  id: string;
  programId?: string | null;
  title: string;
  slug?: string | null;
  description?: string | null;
  category?: string | null;
  scheduledStartTime: string;
  scheduledEndTime?: string | null;
  status: ScheduleEventStatus;
  youtubeVideoId?: string | null;
  thumbnailUrl?: string | null;
  location?: string | null;
};

export type ScheduleResponse = {
  data: ScheduleEvent[];
  source: 'schedule';
};

export type ScheduleEventViewModel = {
  id: string;
  programId: string | null;
  title: string;
  slug: string | null;
  description: string | null;
  category: string | null;
  scheduledStartTime: string;
  scheduledEndTime: string | null;
  youtubeVideoId: string | null;
  thumbnailUrl: string | null;
  location: string | null;
  hasStarted: boolean;
};
