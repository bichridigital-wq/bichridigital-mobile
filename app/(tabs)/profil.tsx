import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FollowedEmissionCard } from '@/components/profile/favorite-emission-card';
import { FavoriteVideoCard } from '@/components/profile/favorite-video-card';
import { ProfileEmptyState } from '@/components/profile/profile-empty-state';
import { ProfileSectionHeader } from '@/components/profile/profile-section-header';
import { ProfileSummary } from '@/components/profile/profile-summary';
import { AccountCard } from '@/components/profile/account-card';
import { RecentVideoRow } from '@/components/profile/recent-video-row';
import { theme } from '@/constants/theme';
import { useUserLibrary } from '@/hooks/use-user-library';
import { useAccountProgramSync } from '@/hooks/use-account-program-sync';
import type {
  FavoriteVideo,
  RecentlyWatchedVideo,
} from '@/types/user-library';
import { playRemoveHaptic } from '@/utils/haptics';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const {
    isHydrated,
    storageError,
    favoriteVideos,
    followedEmissions,
    recentlyWatched,
    removeFavoriteVideo,
    clearRecentlyWatched,
  } = useUserLibrary();
  const { removeFollowedEmission } = useAccountProgramSync();
  const openVideo = (video: FavoriteVideo | RecentlyWatchedVideo) => {
    router.push({
      pathname: '/video/[videoId]',
      params: {
        videoId: video.videoId,
        title: video.title,
        channelTitle: video.channelTitle,
        publishedAt: video.publishedAt,
        duration: video.duration,
        thumbnailUrl: video.thumbnailUrl,
      },
    });
  };

  const confirmClearHistory = () => {
    Alert.alert(
      'Effacer l’historique ?',
      'Les vidéos récemment ouvertes seront retirées de cet appareil.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Effacer',
          style: 'destructive',
          onPress: clearRecentlyWatched,
        },
      ],
    );
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Text style={styles.screenTitle}>Mon espace</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Paramètres"
              accessibilityHint="Ouvre les paramètres de Bichridigital"
              onPress={() => router.push('/settings')}
              style={({ pressed }) => [styles.settingsButton, pressed && styles.pressed]}>
              <Ionicons name="settings-outline" size={24} color={theme.colors.yellow} />
            </Pressable>
          </View>
          <Text style={styles.subtitle}>
            Retrouvez vos favoris et vos dernières vidéos.
          </Text>
          <View style={styles.localNotice}>
            <Ionicons
              color={theme.colors.yellow}
              name="phone-portrait-outline"
              size={16}
            />
            <Text style={styles.localNoticeText}>
              Certaines données sont enregistrées sur cet appareil
            </Text>
          </View>
        </View>

        {!isHydrated ? (
          <ProfileLoadingState />
        ) : (
          <View style={styles.content}>
            <AccountCard />
            {storageError ? (
              <Text accessibilityRole="alert" style={styles.storageError}>
                Certaines données locales n’ont pas pu être enregistrées.
              </Text>
            ) : null}

            <ProfileSummary
              followedEmissionCount={followedEmissions.length}
              favoriteVideoCount={favoriteVideos.length}
              recentCount={recentlyWatched.length}
            />

            <View style={styles.section}>
              <ProfileSectionHeader title="Vidéos favorites" />
              {favoriteVideos.length > 0 ? (
                <ScrollView
                  contentContainerStyle={styles.horizontalList}
                  horizontal
                  showsHorizontalScrollIndicator={false}>
                  {favoriteVideos.map((video) => (
                    <FavoriteVideoCard
                      key={video.videoId}
                      onOpen={() => openVideo(video)}
                      onRemove={() => {
                        playRemoveHaptic();
                        removeFavoriteVideo(video.videoId);
                      }}
                      video={video}
                    />
                  ))}
                </ScrollView>
              ) : (
                <ProfileEmptyState message="Vous n’avez encore ajouté aucune vidéo aux favoris." />
              )}
            </View>

            <View style={styles.section}>
              <ProfileSectionHeader title="Émissions suivies" />
              {followedEmissions.length > 0 ? (
                <ScrollView
                  contentContainerStyle={styles.horizontalList}
                  horizontal
                  showsHorizontalScrollIndicator={false}>
                  {followedEmissions.map((emission) => (
                    <FollowedEmissionCard
                      emission={emission}
                      key={emission.slug}
                      onOpen={() =>
                        router.push({
                          pathname: '/emission/[slug]',
                          params: { slug: emission.slug },
                        })
                      }
                      onRemove={() => {
                        playRemoveHaptic();
                        removeFollowedEmission(emission.slug);
                      }}
                    />
                  ))}
                </ScrollView>
              ) : (
                <ProfileEmptyState message="Vous ne suivez encore aucune émission." />
              )}
            </View>

            <View style={styles.section}>
              <ProfileSectionHeader
                actionLabel={
                  recentlyWatched.length > 0 ? 'Effacer l’historique' : undefined
                }
                onAction={
                  recentlyWatched.length > 0 ? confirmClearHistory : undefined
                }
                title="Récemment regardées"
              />
              {recentlyWatched.length > 0 ? (
                <View style={styles.list}>
                  {recentlyWatched.slice(0, 10).map((video) => (
                    <RecentVideoRow
                      key={video.videoId}
                      onOpen={() => openVideo(video)}
                      video={video}
                    />
                  ))}
                </View>
              ) : (
                <ProfileEmptyState message="Votre historique de lecture apparaîtra ici." />
              )}
            </View>

          </View>
        )}
      </ScrollView>
    </View>
  );
}

function ProfileLoadingState() {
  return (
    <View
      accessibilityLabel="Chargement de votre espace"
      style={styles.loadingContent}>
      <View style={[styles.skeleton, styles.summarySkeleton]} />
      <View style={styles.titleSkeleton} />
      <View style={styles.cardSkeletons}>
        <View style={[styles.skeleton, styles.cardSkeleton]} />
        <View style={[styles.skeleton, styles.cardSkeleton]} />
      </View>
      <View style={styles.titleSkeleton} />
      <View style={[styles.skeleton, styles.rowSkeleton]} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  scrollContent: { paddingBottom: 150 },
  header: {
    gap: 5,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  settingsButton: { minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(252,205,18,0.25)', backgroundColor: theme.colors.secondary },
  screenTitle: { flex: 1, color: theme.colors.text, fontSize: 24, fontWeight: '900' },
  subtitle: { color: theme.colors.muted, fontSize: 12, lineHeight: 18 },
  localNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 7,
  },
  localNoticeText: { color: theme.colors.yellow, fontSize: 11, fontWeight: '600' },
  content: { gap: theme.spacing.xl, paddingHorizontal: theme.spacing.lg },
  section: { gap: 11 },
  horizontalList: { gap: 12, paddingRight: 8 },
  list: { gap: 10 },
  storageError: {
    padding: 11,
    borderRadius: 12,
    color: theme.colors.muted,
    backgroundColor: theme.colors.secondary,
    fontSize: 11,
    lineHeight: 16,
  },
  pressed: { opacity: 0.75 },
  loadingContent: { gap: 14, paddingHorizontal: theme.spacing.lg },
  skeleton: {
    borderRadius: 18,
    backgroundColor: theme.colors.secondary,
  },
  summarySkeleton: { height: 94 },
  titleSkeleton: {
    width: 145,
    height: 17,
    borderRadius: 8,
    backgroundColor: theme.colors.secondary,
  },
  cardSkeletons: { flexDirection: 'row', gap: 12, overflow: 'hidden' },
  cardSkeleton: { width: 190, height: 196 },
  rowSkeleton: { height: 88 },
});
