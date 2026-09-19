import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useAccountProgramSync } from '@/hooks/use-account-program-sync';

export function AccountCard() {
  const { user, profile, isAuthenticated, isRestoring, isConfigured, signOut } = useAuth();
  const { status } = useAccountProgramSync();
  const [loading, setLoading] = useState(false);
  const [failedAvatar, setFailedAvatar] = useState<string | null>(null);
  const displayName = profile?.displayName?.trim() || user?.email?.split('@')[0] || 'Votre compte Bichridigital';
  const initial = Array.from(profile?.displayName?.trim() || user?.email?.trim() || '?')[0].toLocaleUpperCase();
  const avatarUrl = profile?.avatarUrl;
  if (isRestoring) return <View accessibilityLabel="Restauration de la session" style={[styles.card, styles.loading]}><ActivityIndicator color={theme.colors.yellow} /><Text style={styles.muted}>Vérification de votre session…</Text></View>;
  if (isAuthenticated) return (
    <View style={styles.card}>
      <View style={accountStyles.identity}>
        <View accessible accessibilityRole="image" accessibilityLabel={`Avatar de ${displayName}`} style={accountStyles.avatar}>
          {avatarUrl && avatarUrl !== failedAvatar ? (
            <Image source={{ uri: avatarUrl }} style={StyleSheet.absoluteFill} contentFit="cover"
              accessible={false} onError={() => setFailedAvatar(avatarUrl)} />
          ) : <Text style={accountStyles.initial}>{initial}</Text>}
        </View>
        <View style={accountStyles.details}>
          <Text style={styles.title}>{displayName}</Text>
          <Text selectable style={styles.email}>{user?.email}</Text>
          <Text style={styles.connected}>● Compte connecté</Text>
        </View>
      </View>
      <Text style={styles.muted}>{status === 'synced' ? 'Émissions synchronisées' : status === 'syncing' ? 'Synchronisation en cours…' : 'Synchronisation en attente'}</Text>
      <Pressable accessibilityRole="button" onPress={() => router.push('/profile/edit')}
        style={({ pressed }) => [styles.secondary, accountStyles.edit, pressed && accountStyles.pressed]}>
        <Text style={accountStyles.editText}>Modifier le profil</Text>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityState={{ busy: loading, disabled: loading }} disabled={loading}
        onPress={() => {
          setLoading(true);
          void signOut().catch(() => Alert.alert('Déconnexion impossible', 'Veuillez réessayer dans un instant.')).finally(() => setLoading(false));
        }} style={({ pressed }) => [accountStyles.signOut, pressed && accountStyles.pressed]}>
        <Text style={accountStyles.signOutText}>{loading ? 'Déconnexion…' : 'Déconnexion'}</Text>
      </Pressable>
    </View>
  );
return <View style={styles.card}><Text style={styles.title}>Votre compte Bichridigital</Text><Text style={styles.muted}>Créez un compte pour préparer la récupération de vos émissions suivies sur vos appareils. La synchronisation sera activée dans une prochaine étape.</Text>{!isConfigured?<Text style={styles.notice}>La connexion n’est pas configurée dans cet environnement.</Text>:null}<View style={styles.actions}><Pressable accessibilityRole="button" onPress={()=>router.push('/auth/register')} style={styles.primary}><Text style={styles.primaryText}>Créer un compte</Text></Pressable><Pressable accessibilityRole="button" onPress={()=>router.push('/auth/login')} style={styles.secondary}><Text style={styles.secondaryText}>Se connecter</Text></Pressable></View></View>}
const styles=StyleSheet.create({card:{gap:10,padding:18,borderRadius:18,backgroundColor:theme.colors.card,borderWidth:1,borderColor:'rgba(255,255,255,0.09)'},loading:{minHeight:90,alignItems:'center',justifyContent:'center',flexDirection:'row'},title:{color:theme.colors.text,fontSize:18,fontWeight:'900'},email:{color:theme.colors.muted,fontSize:13},muted:{color:theme.colors.muted,fontSize:13,lineHeight:19},connected:{color:'#71E6B8',fontSize:12,fontWeight:'700'},notice:{color:theme.colors.yellow,fontSize:12},actions:{gap:10,marginTop:4},primary:{minHeight:46,alignItems:'center',justifyContent:'center',borderRadius:13,backgroundColor:theme.colors.yellow},primaryText:{color:theme.colors.background,fontWeight:'900'},secondary:{minHeight:46,alignItems:'center',justifyContent:'center',borderRadius:13,borderWidth:1,borderColor:'rgba(255,255,255,0.18)'},secondaryText:{color:theme.colors.text,fontWeight:'800'}});

const accountStyles = StyleSheet.create({
  identity: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: { width: 58, height: 58, borderRadius: 29, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(252,205,18,0.12)', borderWidth: 1, borderColor: 'rgba(252,205,18,0.4)' },
  initial: { color: theme.colors.yellow, fontSize: 26, fontWeight: '800' },
  details: { flex: 1, minWidth: 0, gap: 6 },
  edit: { borderColor: 'rgba(252,205,18,0.4)', paddingHorizontal: 12, paddingVertical: 12 },
  editText: { color: theme.colors.yellow, fontWeight: '700', textAlign: 'center' },
  signOut: { minHeight: 48, paddingHorizontal: 14, alignSelf: 'center', alignItems: 'center', justifyContent: 'center' },
  signOutText: { color: theme.colors.muted, fontSize: 13, textDecorationLine: 'underline' },
  pressed: { opacity: 0.65 },
});
