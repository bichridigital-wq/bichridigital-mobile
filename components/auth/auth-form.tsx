import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, type TextInputProps, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@/constants/theme';

export function AuthForm({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  const insets = useSafeAreaInsets();
  return <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.screen}>
    <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 12 }]} keyboardShouldPersistTaps="handled">
      <Pressable accessibilityLabel="Revenir en arrière" accessibilityRole="button" hitSlop={12} onPress={() => router.back()}><Text style={styles.back}>‹ Retour</Text></Pressable>
      <View><Text style={styles.title}>{title}</Text><Text style={styles.subtitle}>{subtitle}</Text></View>{children}
    </ScrollView>
  </KeyboardAvoidingView>;
}
export function Field({ label, ...props }: TextInputProps & { label: string }) {
  return <View style={styles.field}><Text style={styles.label}>{label}</Text><TextInput accessibilityLabel={label} placeholderTextColor="#65739B" style={styles.input} {...props} /></View>;
}
export function Submit({ label, loading, disabled, onPress }: { label: string; loading: boolean; disabled?: boolean; onPress(): void }) {
  return <Pressable accessibilityRole="button" disabled={disabled || loading} onPress={onPress} style={({ pressed }) => [styles.submit, (disabled || loading) && styles.disabled, pressed && styles.pressed]}>{loading ? <ActivityIndicator color="#020B2E" /> : <Text style={styles.submitText}>{label}</Text>}</Pressable>;
}
export function FormMessage({ children, success = false }: { children: ReactNode; success?: boolean }) { return <Text accessibilityRole={success ? 'text' : 'alert'} style={[styles.message, success && styles.success]}>{children}</Text>; }
export function TextAction({ label, onPress }: { label: string; onPress(): void }) { return <Pressable accessibilityRole="button" hitSlop={8} onPress={onPress}><Text style={styles.action}>{label}</Text></Pressable>; }
export const formStyles = StyleSheet.create({ fields: { gap: 14 }, actions: { alignItems: 'center', gap: 15 } });
const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: theme.colors.background }, content: { flexGrow: 1, gap: 26, padding: theme.spacing.lg, paddingBottom: 40 }, back: { color: theme.colors.yellow, fontSize: 16, fontWeight: '700' }, title: { color: theme.colors.text, fontSize: 28, fontWeight: '900', marginBottom: 7 }, subtitle: { color: theme.colors.muted, fontSize: 14, lineHeight: 21 }, field: { gap: 7 }, label: { color: theme.colors.text, fontSize: 13, fontWeight: '700' }, input: { minHeight: 52, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.13)', backgroundColor: theme.colors.secondary, color: theme.colors.text, paddingHorizontal: 15, fontSize: 16 }, submit: { minHeight: 52, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: theme.colors.yellow }, submitText: { color: theme.colors.background, fontWeight: '900', fontSize: 15 }, disabled: { opacity: 0.5 }, pressed: { opacity: 0.8 }, message: { borderRadius: 12, backgroundColor: '#3B1520', color: '#FFD5DD', padding: 12, lineHeight: 19 }, success: { backgroundColor: '#123A31', color: '#C8FFEB' }, action: { color: theme.colors.yellow, fontSize: 14, fontWeight: '700' } });
