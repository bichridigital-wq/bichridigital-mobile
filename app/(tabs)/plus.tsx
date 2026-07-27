import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandCard } from '@/components/more/brand-card';
import { LegalLinkRow } from '@/components/more/legal-link-row';
import { MoreLinkRow } from '@/components/more/more-link-row';
import { MoreSection } from '@/components/more/more-section';
import { NotificationPreferenceCard } from '@/components/more/notification-preference-card';
import { SocialLinkGrid } from '@/components/more/social-link-grid';
import { brandInfo, usefulLinks } from '@/constants/more-content';
import { theme } from '@/constants/theme';

const usefulLinkIcons = {
  website: 'globe-outline',
  services: 'briefcase-outline',
  contact: 'chatbubble-ellipses-outline',
  youtube: 'logo-youtube',
} as const;

export default function PlusScreen() {
  const insets = useSafeAreaInsets();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const openExternalUrl = async (url: string) => {
    if (!url) {
      return;
    }

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    } catch {
      // External links are optional and must never interrupt the screen.
    }
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.screenTitle}>Plus</Text>
          <Text style={styles.subtitle}>
            Découvrez Bichridigital et accédez à nos services.
          </Text>
        </View>

        <View style={styles.content}>
          <BrandCard />

          <MoreSection title="Liens utiles">
            <View style={styles.list}>
              {usefulLinks.map((link) => (
                <MoreLinkRow
                  key={link.id}
                  icon={usefulLinkIcons[link.id]}
                  onPress={() => openExternalUrl(link.url)}
                  subtitle={link.subtitle}
                  title={link.title}
                />
              ))}
            </View>
          </MoreSection>

          <MoreSection title="Réseaux sociaux">
            <SocialLinkGrid onOpen={openExternalUrl} />
          </MoreSection>

          <MoreSection title="Préférences">
            <NotificationPreferenceCard
              enabled={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
            />
          </MoreSection>

          <MoreSection title="Informations légales">
            <View style={styles.list}>
              <LegalLinkRow title="Mentions légales" />
              <LegalLinkRow title="Politique de confidentialité" />
            </View>
          </MoreSection>

          <View style={styles.finalCard}>
            <Text style={styles.finalName}>{brandInfo.name}</Text>
            <Text style={styles.finalSlogan}>{brandInfo.slogan}</Text>
            <Pressable
              accessibilityHint="Ouvre le site officiel dans votre navigateur"
              accessibilityLabel="Visiter le site officiel de Bichridigital"
              accessibilityRole="link"
              onPress={() => openExternalUrl(usefulLinks[0].url)}
              style={({ pressed }) => [styles.websiteButton, pressed && styles.pressed]}>
              <Text style={styles.websiteButtonText}>Visiter le site officiel</Text>
              <Ionicons name="open-outline" size={16} color={theme.colors.background} />
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 140,
  },
  header: {
    gap: 4,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
  },
  screenTitle: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: '800',
  },
  subtitle: {
    color: theme.colors.muted,
    fontSize: 12,
    lineHeight: 18,
  },
  content: {
    gap: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
  },
  list: {
    gap: 10,
  },
  finalCard: {
    alignItems: 'center',
    gap: 7,
    padding: 22,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(252,205,18,0.24)',
    backgroundColor: theme.colors.secondary,
  },
  finalName: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  finalSlogan: {
    color: theme.colors.muted,
    fontSize: 12,
    textAlign: 'center',
  },
  websiteButton: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 7,
    paddingHorizontal: 17,
    borderRadius: 999,
    backgroundColor: theme.colors.yellow,
  },
  websiteButtonText: {
    color: theme.colors.background,
    fontSize: 12,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.75,
  },
});
