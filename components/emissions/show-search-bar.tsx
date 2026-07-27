import { StyleSheet, TextInput, View } from 'react-native';

import { theme } from '@/constants/theme';

type ShowSearchBarProps = {
  value: string;
  onChangeText: (value: string) => void;
};

export function ShowSearchBar({ value, onChangeText }: ShowSearchBarProps) {
  return (
    <View style={styles.searchBox}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Rechercher..."
        placeholderTextColor={theme.colors.muted}
        style={styles.input}
        accessibilityLabel="Rechercher des émissions"
        returnKeyType="search"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  searchBox: {
    borderRadius: 16,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 12,
  },
  input: {
    color: theme.colors.text,
    paddingVertical: 12,
  },
});
