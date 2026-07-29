import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandCard } from '@/components/more/brand-card';
import { LegalLinkRow } from '@/components/more/legal-link-row';
import { MoreLinkRow } from '@/components/more/more-link-row';
import { NotificationPreferenceCard } from '@/components/more/notification-preference-card';
import { SocialLinkGrid } from '@/components/more/social-link-grid';
import { FavoriteEmissionCard } from '@/components/profile/favorite-emission-card';
import { FavoriteVideoCard } from '@/components/profile/favorite-video-card';
import { ProfileEmptyState } from '@/components/profile/profile-empty-state';
import { ProfileSectionHeader } from '@/components/profile/profile-section-header';
import { ProfileSummary } from '@/components/profile/profile-summary';
import { RecentVideoRow } from '@/components/profile/recent-video-row';
import { usefulLinks } from '@/constants/more-content';
import { theme } from '@/constants/theme';
import { useUserLibrary } from '@/hooks/use-user-library';
import type {
  FavoriteVideo,
  RecentlyWatchedVideo,
} from '@/types/user-library';

const usefulLinkIcons = {
  website: 'globe-outline',
  services: 'briefcase-outline',
  contact: 'chatbubble-ellipses-outline',
  youtube: 'logo-youtube',
} as const;

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const {
    isHydrated,
    storageError,
    favoriteVideos,
    favoriteEmissions,
    recentlyWatched,
    notificationsEnabled,
    removeFavoriteVideo,
    removeFavoriteEmission,
    clearRecentlyWatched,
    clearAllLibraryData,
    setNotificationsEnabled,
  } = useUserLibrary();

  const openExternalUrl = async (url: string) => {
    if (!url) {
      return;
    }
    try {
      if (await Linking.canOpenURL(url)) {
        await Linking.openURL(url);
      }
    } catch {
      // Official links are optional and must not interrupt the profile.
    }
  };

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

  const confirmClearAll = () => {
    Alert.alert(
      'Effacer mes données locales ?',
      'Vos favoris, votre historique et vos préférences seront supprimés uniquement de cet appareil.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Effacer',
          style: 'destructive',
          onPress: clearAllLibraryData,
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
          <Text style={styles.screenTitle}>Mon espace</Text>
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
              Données enregistrées uniquement sur cet appareil
            </Text>
          </View>
        </View>

        {!isHydrated ? (
          <ProfileLoadingState />
        ) : (
          <View style={styles.content}>
            {storageError ? (
              <Text accessibilityRole="alert" style={styles.storageError}>
                Certaines données locales n’ont pas pu être enregistrées.
              </Text>
            ) : null}

            <ProfileSummary
              favoriteEmissionCount={favoriteEmissions.length}
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
                      onRemove={() => removeFavoriteVideo(video.videoId)}
                      video={video}
                    />
                  ))}
                </ScrollView>
              ) : (
                <ProfileEmptyState message="Vous n’avez encore ajouté aucune vidéo aux favoris." />
              )}
            </View>

            <View style={styles.section}>
              <ProfileSectionHeader title="Émissions favorites" />
              {favoriteEmissions.length > 0 ? (
                <ScrollView
                  contentContainerStyle={styles.horizontalList}
                  horizontal
                  showsHorizontalScrollIndicator={false}>
                  {favoriteEmissions.map((emission) => (
                    <FavoriteEmissionCard
                      emission={emission}
                      key={emission.slug}
                      onOpen={() =>
                        router.push({
                          pathname: '/emission/[slug]',
                          params: { slug: emission.slug },
                        })
                      }
                      onRemove={() => removeFavoriteEmission(emission.slug)}
                    />
                  ))}
                </ScrollView>
              ) : (
                <ProfileEmptyState message="Vous n’avez encore ajouté aucune émission aux favoris." />
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

            <View style={styles.section}>
              <ProfileSectionHeader title="Préférences" />
              <NotificationPreferenceCard
                enabled={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
              />
            </View>

            <View style={styles.divider} />
            <ProfileSectionHeader title="Bichridigital et paramètres" />
            <BrandCard />

            <View style={styles.section}>
              <ProfileSectionHeader title="Liens officiels" />
              <View style={styles.list}>
                {usefulLinks.map((link) => (
                  <MoreLinkRow
                    icon={usefulLinkIcons[link.id]}
                    key={link.id}
                    onPress={() => openExternalUrl(link.url)}
                    subtitle={link.subtitle}
                    title={link.title}
                  />
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <ProfileSectionHeader title="Réseaux sociaux" />
              <SocialLinkGrid onOpen={openExternalUrl} />
            </View>

            <View style={styles.section}>
              <ProfileSectionHeader title="Informations légales" />
              <View style={styles.list}>
                <LegalLinkRow title="Mentions légales" />
                <LegalLinkRow title="Politique de confidentialité" />
              </View>
            </View>

            <Pressable
              accessibilityLabel="Effacer mes données locales"
              accessibilityRole="button"
              onPress={confirmClearAll}
              style={({ pressed }) => [
                styles.resetButton,
                pressed && styles.pressed,
              ]}>
              <Ionicons
                color={theme.colors.muted}
                name="trash-outline"
                size={18}
              />
              <Text style={styles.resetText}>Effacer mes données locales</Text>
            </Pressable>
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
  screenTitle: { color: theme.colors.text, fontSize: 24, fontWeight: '900' },
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
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.08)' },
  resetButton: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
    backgroundColor: theme.colors.secondary,
  },
  resetText: { color: theme.colors.muted, fontSize: 12, fontWeight: '700' },
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
