import { router } from 'expo-router';
import { useCallback, useMemo } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DirectErrorState } from '@/components/direct/direct-error-state';
import { DirectHeader } from '@/components/direct/direct-header';
import { DirectLoadingState } from '@/components/direct/direct-loading-state';
import { DirectReplayCard } from '@/components/direct/direct-replay-card';
import { LivePlayerCard } from '@/components/direct/live-player-card';
import { OfflineLiveState } from '@/components/direct/offline-live-state';
import { UpcomingLiveCard } from '@/components/direct/upcoming-live-card';
import { FeaturedScheduleCard } from '@/components/schedule/featured-schedule-card';
import { ScheduleEventCard } from '@/components/schedule/schedule-event-card';
import { ScheduleLoadingState } from '@/components/schedule/schedule-loading-state';
import { getEmissionBySlug } from '@/constants/emissions-content';
import type { Replay } from '@/constants/replays-content';
import { theme } from '@/constants/theme';
import { useCountdown } from '@/hooks/use-countdown';
import { useLivePolling } from '@/hooks/use-live-polling';
import { useNotifications } from '@/hooks/use-notifications';
import { useSchedule } from '@/hooks/use-schedule';
import { useLatestVideos, useLiveBroadcast } from '@/hooks/use-youtube';
import type { ScheduleEventViewModel } from '@/types/schedule';
import {
  adaptLiveBroadcast,
  resolveLiveState,
} from '@/utils/live-broadcast-adapter';
import { playLightHaptic } from '@/utils/haptics';
import { adaptYoutubeVideo } from '@/utils/replay-video-adapter';
import { toScheduleViewModel } from '@/utils/schedule-adapter';
import { getMillisecondsUntilStart } from '@/utils/schedule-date';

const ACTIVE_POLL_INTERVAL_MS = 60_000;
const OFFLINE_POLL_INTERVAL_MS = 180_000;
const NEAR_SCHEDULE_POLL_INTERVAL_MS = 120_000;
const DEFAULT_SCHEDULE_POLL_INTERVAL_MS = 300_000;

export default function DirectScreen() {
  const insets = useSafeAreaInsets();
  const liveQuery = useLiveBroadcast();
  const latestQuery = useLatestVideos();
  const scheduleQuery = useSchedule();
  const refreshSchedule = scheduleQuery.refresh;
  const reloadLive = liveQuery.reload;
  const reloadReplays = latestQuery.reload;
  const { isPermissionGranted, notificationsEnabled } = useNotifications();

  const liveState = useMemo(
    () =>
      resolveLiveState({
        data: liveQuery.data,
        loading: liveQuery.loading,
        error: liveQuery.error,
        hasLoaded:
          !liveQuery.loading ||
          liveQuery.data !== null ||
          liveQuery.error !== null,
      }),
    [liveQuery.data, liveQuery.error, liveQuery.loading],
  );
  const pollInterval =
    liveState.status === 'live' || liveState.status === 'upcoming'
      ? ACTIVE_POLL_INTERVAL_MS
      : OFFLINE_POLL_INTERVAL_MS;
  const screenActive = useLivePolling({
    loading: liveQuery.loading,
    refreshing: liveQuery.refreshing,
    intervalMs: pollInterval,
    reload: reloadLive,
  });
  const schedulePollInterval =
    scheduleQuery.nextEvent &&
    getMillisecondsUntilStart(scheduleQuery.nextEvent.scheduledStartTime) <=
      30 * 60_000
      ? NEAR_SCHEDULE_POLL_INTERVAL_MS
      : DEFAULT_SCHEDULE_POLL_INTERVAL_MS;
  useLivePolling({
    loading: scheduleQuery.isLoading,
    refreshing: scheduleQuery.isRefreshing,
    intervalMs: schedulePollInterval,
    reload: refreshSchedule,
  });
  const presentation = useMemo(
    () =>
      liveState.status === 'live' || liveState.status === 'upcoming'
        ? adaptLiveBroadcast(liveState.broadcast)
        : null,
    [liveState],
  );
  const scheduledStartTime =
    liveState.status === 'upcoming'
      ? liveState.broadcast.scheduledStartTime
      : '';
  const refreshAtCountdownEnd = useCallback(() => {
    reloadLive();
  }, [reloadLive]);
  const countdown = useCountdown(
    scheduledStartTime,
    screenActive && liveState.status === 'upcoming',
    refreshAtCountdownEnd,
  );
  const latestReplays = useMemo(
    () =>
      (latestQuery.data ?? [])
        .slice(0, 5)
        .map((video) => adaptYoutubeVideo(video, false)),
    [latestQuery.data],
  );
  const liveVideoId =
    liveState.status === 'live' || liveState.status === 'upcoming'
      ? liveState.broadcast.id
      : null;
  const scheduleEvents = useMemo(
    () =>
      scheduleQuery.events
        .filter(
          (event) =>
            liveState.status !== 'live' ||
            !event.youtubeVideoId ||
            event.youtubeVideoId !== liveVideoId,
        )
        .map((event) => toScheduleViewModel(event)),
    [liveState.status, liveVideoId, scheduleQuery.events],
  );
  const youtubeUpcomingMatchedBySchedule =
    liveState.status === 'upcoming' &&
    scheduleQuery.events.some(
      (event) =>
        event.youtubeVideoId !== null &&
        event.youtubeVideoId !== undefined &&
        event.youtubeVideoId === liveVideoId,
    );
  const refreshing =
    liveQuery.refreshing ||
    latestQuery.refreshing ||
    scheduleQuery.isRefreshing;

  const refreshAll = useCallback(() => {
    playLightHaptic();
    reloadLive();
    reloadReplays();
    refreshSchedule();
  }, [refreshSchedule, reloadLive, reloadReplays]);

  const openReplay = useCallback((replay: Replay) => {
    router.push({
      pathname: '/video/[videoId]',
      params: {
        videoId: replay.id,
        title: replay.title,
        channelTitle: replay.showTitle,
        publishedAt: replay.publishedAt,
        duration: replay.duration,
        thumbnailUrl: replay.thumbnailUrl,
      },
    });
  }, []);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <DirectHeader status={liveState.status} />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            colors={[theme.colors.yellow]}
            onRefresh={refreshAll}
            progressBackgroundColor={theme.colors.secondary}
            refreshing={refreshing}
            tintColor={theme.colors.yellow}
          />
        }
        showsVerticalScrollIndicator={false}>
        {liveState.status === 'loading' ? (
          <DirectLoadingState />
        ) : liveState.status === 'error' ? (
          <DirectErrorState onRetry={reloadLive} />
        ) : liveState.status === 'live' && presentation ? (
          <LivePlayerCard presentation={presentation} />
        ) : liveState.status === 'upcoming' && presentation ? (
          youtubeUpcomingMatchedBySchedule ? null : (
            <UpcomingLiveCard
              countdown={countdown}
              presentation={presentation}
            />
          )
        ) : (
          <OfflineLiveState
            notificationsActive={
              isPermissionGranted && notificationsEnabled
            }
            onOpenProfile={() => router.push('/(tabs)/profil')}
            onOpenReplays={() => router.push('/(tabs)/replays')}
            onRefresh={() => {
              playLightHaptic();
              reloadLive();
            }}
          />
        )}

        {liveQuery.error &&
        liveQuery.data &&
        (liveState.status === 'live' || liveState.status === 'upcoming') ? (
          <Text accessibilityRole="alert" style={styles.refreshWarning}>
            La dernière actualisation a échoué. La diffusion déjà chargée reste
            affichée.
          </Text>
        ) : null}

        <AgendaSection
          error={scheduleQuery.error}
          events={scheduleEvents}
          loading={scheduleQuery.isLoading && scheduleEvents.length === 0}
          onRefresh={refreshSchedule}
          onRefreshLive={reloadLive}
          screenActive={screenActive}
        />

        <ReplaySection
          error={latestQuery.error}
          loading={latestQuery.loading && latestReplays.length === 0}
          onOpen={openReplay}
          onRetry={reloadReplays}
          replays={latestReplays}
        />
      </ScrollView>
    </View>
  );
}

type AgendaSectionProps = {
  error: Error | null;
  events: ScheduleEventViewModel[];
  loading: boolean;
  onRefresh: () => void;
  onRefreshLive: () => void;
  screenActive: boolean;
};

function AgendaSection({
  error,
  events,
  loading,
  onRefresh,
  onRefreshLive,
  screenActive,
}: AgendaSectionProps) {
  const firstEvent = events[0] ?? null;
  const refreshAtStart = useCallback(() => {
    onRefresh();
    onRefreshLive();
  }, [onRefresh, onRefreshLive]);
  const countdown = useCountdown(
    firstEvent?.scheduledStartTime ?? '',
    screenActive && firstEvent !== null && !firstEvent.hasStarted,
    refreshAtStart,
  );

  const openEvent = useCallback((event: ScheduleEventViewModel) => {
    if (event.youtubeVideoId) {
      playLightHaptic();
      router.push({
        pathname: '/video/[videoId]',
        params: {
          videoId: event.youtubeVideoId,
          title: event.title,
          channelTitle: 'Bichridigital',
          publishedAt: event.scheduledStartTime,
          duration: 'Diffusion programmée',
          ...(event.thumbnailUrl ? { thumbnailUrl: event.thumbnailUrl } : {}),
        },
      });
      return;
    }

    const emission = getEmissionBySlug(event.slug ?? undefined);
    if (emission) {
      playLightHaptic();
      router.push({
        pathname: '/emission/[slug]',
        params: { slug: emission.slug },
      });
    }
  }, []);

  const hasAction = useCallback(
    (event: ScheduleEventViewModel) =>
      Boolean(event.youtubeVideoId || getEmissionBySlug(event.slug ?? undefined)),
    [],
  );

  return (
    <View accessibilityLabel="À l'agenda" style={styles.section}>
      <View style={styles.agendaHeader}>
        <Text accessibilityRole="header" style={styles.sectionTitle}>À l&apos;agenda</Text>
        <Text style={styles.agendaSubtitle}>
          Les prochains rendez-vous officiels de Bichridigital.
        </Text>
      </View>
      {loading ? (
        <ScheduleLoadingState />
      ) : firstEvent ? (
        <>
          <FeaturedScheduleCard
            countdown={countdown}
            event={firstEvent}
            hasReliableAction={hasAction(firstEvent)}
            onOpen={() => openEvent(firstEvent)}
            onRefreshLive={onRefreshLive}
          />
          {events.slice(1, 5).map((event) => (
            <ScheduleEventCard
              event={event}
              hasReliableAction={hasAction(event)}
              key={event.id}
              onOpen={() => openEvent(event)}
            />
          ))}
          {error ? (
            <Text accessibilityRole="alert" style={styles.refreshWarning}>
              L&apos;actualisation de l&apos;agenda a échoué. Les informations déjà
              chargées restent affichées.
            </Text>
          ) : null}
        </>
      ) : error ? (
        <View accessibilityRole="alert" style={styles.agendaMessage}>
          <Text style={styles.agendaMessageTitle}>Impossible de charger l&apos;agenda.</Text>
          <Pressable
            accessibilityLabel="Réessayer de charger l'agenda"
            accessibilityRole="button"
            onPress={onRefresh}
            style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}>
            <Text style={styles.retryText}>Réessayer</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.agendaMessage}>
          <Text style={styles.agendaMessageTitle}>Aucun rendez-vous programmé</Text>
          <Text style={styles.replayErrorText}>
            Les prochaines émissions et diffusions apparaîtront ici dès leur
            publication.
          </Text>
        </View>
      )}
    </View>
  );
}

type ReplaySectionProps = {
  error: Error | null;
  loading: boolean;
  onOpen: (replay: Replay) => void;
  onRetry: () => void;
  replays: Replay[];
};

function ReplaySection({
  error,
  loading,
  onOpen,
  onRetry,
  replays,
}: ReplaySectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Derniers replays</Text>
        <Pressable
          accessibilityLabel="Voir tous les replays"
          accessibilityRole="button"
          onPress={() => router.push('/(tabs)/replays')}
          style={({ pressed }) => pressed && styles.pressed}>
          <Text style={styles.link}>Voir tous les replays</Text>
        </Pressable>
      </View>
      {loading ? (
        <View style={styles.replaySkeletonRow}>
          <View style={styles.replaySkeleton} />
          <View style={styles.replaySkeleton} />
          <View style={styles.replaySkeleton} />
        </View>
      ) : replays.length > 0 ? (
        <ScrollView
          contentContainerStyle={styles.replayList}
          horizontal
          showsHorizontalScrollIndicator={false}>
          {replays.map((replay) => (
            <DirectReplayCard
              key={replay.id}
              onPress={() => onOpen(replay)}
              replay={replay}
            />
          ))}
        </ScrollView>
      ) : error ? (
        <View style={styles.replayError}>
          <Text style={styles.replayErrorText}>
            Impossible de charger les dernières vidéos.
          </Text>
          <Pressable
            accessibilityLabel="Réessayer de charger les replays"
            accessibilityRole="button"
            onPress={onRetry}
            style={({ pressed }) => [
              styles.retryButton,
              pressed && styles.pressed,
            ]}>
            <Text style={styles.retryText}>Réessayer</Text>
          </Pressable>
        </View>
      ) : (
        <Text style={styles.replayErrorText}>
          Aucun replay récent disponible.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  content: {
    gap: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: 140,
  },
  refreshWarning: {
    color: theme.colors.muted,
    fontSize: 12,
    lineHeight: 18,
    paddingHorizontal: 4,
  },
  section: { gap: 12 },
  agendaHeader: { gap: 4 },
  agendaSubtitle: { color: theme.colors.muted, fontSize: 12, lineHeight: 18 },
  agendaMessage: {
    alignItems: 'flex-start',
    gap: 10,
    padding: 16,
    borderRadius: 16,
    backgroundColor: theme.colors.secondary,
  },
  agendaMessageTitle: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  sectionTitle: { color: theme.colors.text, fontSize: 18, fontWeight: '800' },
  link: { color: theme.colors.yellow, fontSize: 12, fontWeight: '800' },
  replayList: { gap: 12, paddingRight: 8 },
  replaySkeletonRow: { flexDirection: 'row', gap: 12, overflow: 'hidden' },
  replaySkeleton: {
    width: 210,
    height: 188,
    borderRadius: 18,
    backgroundColor: theme.colors.secondary,
  },
  replayError: {
    alignItems: 'flex-start',
    gap: 10,
    padding: 16,
    borderRadius: 16,
    backgroundColor: theme.colors.secondary,
  },
  replayErrorText: { color: theme.colors.muted, fontSize: 12 },
  retryButton: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 17,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  retryText: { color: theme.colors.text, fontSize: 13, fontWeight: '800' },
  pressed: { opacity: 0.8 },
});
