import Ionicons from '@expo/vector-icons/Ionicons';
import { Redirect, Stack, router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Field, FormMessage } from '@/components/auth/auth-form';
import { theme } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { updateDisplayName } from '@/services/account';
import { ApiClientError } from '@/services/api-client';

export default function EditProfileScreen() {
  const { user, profile, session, isRestoring, refreshProfile } = useAuth();
  const insets = useSafeAreaInsets();
  // Keep an untouched field in sync if the profile arrives after the session.
  const [draft, setDraft] = useState<string | null>(null);
  const name = draft ?? profile?.displayName ?? '';
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const pending = useRef(false);
  const mounted = useRef(true);
  const currentUserId = useRef(user?.id);
  useEffect(() => { currentUserId.current = user?.id; }, [user?.id]);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  const save = async () => {
    if (pending.current || !session) return;
    const displayName = name.trim();
    if (!displayName) { setError('Saisissez un nom d’affichage.'); return; }
    const userId = session.user.id;
    pending.current = true;
    setSaving(true);
    setError('');
    try {
      const saved = await updateDisplayName(session.access_token, displayName);
      if (!mounted.current || currentUserId.current !== userId) return;
      await refreshProfile(saved);
      Alert.alert('Profil mis à jour', 'Vos modifications ont été enregistrées.');
      router.dismissTo('/(tabs)/profil');
    } catch (failure) {
      if (!mounted.current || currentUserId.current !== userId) return;
      if (failure instanceof ApiClientError && failure.kind === 'network') {
        setError('Enregistrement impossible. Vérifiez votre connexion puis réessayez.');
      } else if (failure instanceof ApiClientError && failure.status === 401) {
        setError('Votre session a expiré. Reconnectez-vous pour modifier votre profil.');
      } else if (failure instanceof ApiClientError && (failure.status === 400 || failure.status === 422)) {
        setError('Ce nom n’a pas été accepté. Vérifiez votre saisie puis réessayez.');
      } else {
        setError('Les modifications n’ont pas pu être enregistrées. Réessayez dans un instant.');
      }
    } finally {
      pending.current = false;
      if (mounted.current) setSaving(false);
    }
  };

  if (!isRestoring && !session) return <Redirect href="/(tabs)/profil" />;

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: !saving }} />
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24, paddingLeft: insets.left + 20, paddingRight: insets.right + 20 },
      ]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Retour au profil" disabled={saving}
          accessibilityState={{ disabled: saving }} onPress={() => router.dismissTo('/(tabs)/profil')}
          style={styles.back}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.yellow} />
          <Text style={styles.backText}>Retour</Text>
        </Pressable>
        <Text accessibilityRole="header" style={styles.title}>Modifier le profil</Text>
        {isRestoring ? <ActivityIndicator accessibilityLabel="Chargement du profil" color={theme.colors.yellow} /> : (
          <View style={styles.form}>
            <Field label="Nom d’affichage" value={name} onChangeText={setDraft} editable={!saving}
              autoCapitalize="words" autoComplete="name" returnKeyType="done" onSubmitEditing={() => void save()} />
            <View style={styles.email}>
              <Text style={styles.label}>Adresse email</Text>
              <Text selectable style={styles.muted}>{user?.email}</Text>
              <Text style={styles.muted}>L’adresse email ne peut pas être modifiée ici.</Text>
            </View>
            {error ? <FormMessage>{error}</FormMessage> : null}
            <Pressable accessibilityRole="button" accessibilityLabel="Enregistrer les modifications"
              accessibilityState={{ busy: saving, disabled: saving }} disabled={saving} onPress={() => void save()}
              style={({ pressed }) => [styles.save, (pressed || saving) && styles.dimmed]}>
              {saving ? <ActivityIndicator color={theme.colors.background} /> : null}
              <Text style={styles.saveText}>{saving ? 'Enregistrement…' : 'Enregistrer les modifications'}</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  content: { flexGrow: 1, gap: 24 },
  back: { minHeight: 48, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 8, paddingRight: 16 },
  backText: { color: theme.colors.yellow, fontSize: 15, fontWeight: '700' },
  title: { color: theme.colors.text, fontSize: 26, fontWeight: '900' },
  form: { gap: 22 },
  email: { gap: 8 },
  label: { color: theme.colors.text, fontSize: 13, fontWeight: '700' },
  muted: { color: theme.colors.muted, fontSize: 13, lineHeight: 20 },
  save: { minHeight: 52, padding: 14, borderRadius: 14, backgroundColor: theme.colors.yellow, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  saveText: { flexShrink: 1, textAlign: 'center', color: theme.colors.background, fontSize: 15, fontWeight: '800' },
  dimmed: { opacity: 0.65 },
});
