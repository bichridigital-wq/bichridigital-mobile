import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { theme } from '@/constants/theme';

type ReplaySearchBarProps = {
  value: string;
  onChangeText: (value: string) => void;
  onClear: () => void;
};

export function ReplaySearchBar({ value, onChangeText, onClear }: ReplaySearchBarProps) {
  return (
    <View style={styles.container}>
      <Ionicons name="search" size={19} color={theme.colors.muted} />
      <TextInput
        accessibilityLabel="Rechercher un replay par titre ou émission"
        value={value}
        onChangeText={onChangeText}
        placeholder="Rechercher un replay..."
        placeholderTextColor={theme.colors.muted}
        returnKeyType="search"
        style={styles.input}
      />
      {value.length > 0 ? (
        <Pressable
          accessibilityLabel="Effacer la recherche"
          accessibilityRole="button"
          hitSlop={8}
          onPress={onClear}
          style={styles.clearButton}>
          <Ionicons name="close-circle" size={21} color={theme.colors.muted} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: theme.colors.secondary,
  },
  input: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 14,
    paddingVertical: 12,
  },
  clearButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
