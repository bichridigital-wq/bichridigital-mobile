import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { socialLinks } from '@/constants/more-content';
import { theme } from '@/constants/theme';

const socialIcons: Record<(typeof socialLinks)[number]['id'], ComponentProps<typeof Ionicons>['name']> = {
  facebook: 'logo-facebook',
  instagram: 'logo-instagram',
  tiktok: 'logo-tiktok',
  youtube: 'logo-youtube',
  x: 'logo-twitter',
  snapchat: 'logo-snapchat',
  linkedin: 'logo-linkedin',
};

type SocialLinkGridProps = {
  onOpen: (url: string) => void;
};

export function SocialLinkGrid({ onOpen }: SocialLinkGridProps) {
  return (
    <View style={styles.grid}>
      {socialLinks.map((social) => {
        const configured = social.url.length > 0;

        return (
          <Pressable
            key={social.id}
            accessibilityLabel={`${social.name}. ${configured ? 'Ouvrir le profil officiel' : 'Lien non configuré'}`}
            accessibilityRole={configured ? 'link' : 'button'}
            accessibilityState={{ disabled: !configured }}
            disabled={!configured}
            onPress={() => onOpen(social.url)}
            style={({ pressed }) => [
              styles.item,
              !configured && styles.disabledItem,
              pressed && styles.pressed,
            ]}>
            <Ionicons
              name={socialIcons[social.id]}
              size={24}
              color={configured ? theme.colors.yellow : theme.colors.muted}
            />
            <Text style={styles.name}>{social.name}</Text>
            <Text style={styles.status}>{configured ? 'Voir le profil' : 'Non configuré'}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  item: {
    minHeight: 104,
    width: '48.5%',
    justifyContent: 'center',
    gap: 6,
    padding: 14,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: theme.colors.secondary,
  },
  disabledItem: {
    opacity: 0.58,
  },
  pressed: {
    opacity: 0.72,
  },
  name: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  status: {
    color: theme.colors.muted,
    fontSize: 10,
  },
});
