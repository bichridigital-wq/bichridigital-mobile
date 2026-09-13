# Audit et migration Expo SDK 54 vers 57

Date : 12 septembre 2026.

## État initial

- Branche initiale : main ; HEAD = origin/main = fd9747fb755fc9b071557e581e276daf4014e8a0 (référence locale, sans fetch).
- Node v24.16.0 ; npm 11.13.0. Minimum SDK 57 : Node 22.13.x.
- Expo installé 54.0.36 ; React 19.1.0 ; React Native 0.81.5.
- Tests : 48/48 ; lint : succès ; TypeScript : succès ; diff --check : succès.
- Expo Doctor 1.20.4 : 18/18, aucun problème. Premier essai bloqué par le sandbox EACCES, relance hors sandbox réussie.
- package.json, app.json, eas.json, tsconfig.json, eslint.config.js lus ; package-lock.json intégralement analysé (995 entrées, format v3).
- Aucun babel.config, metro.config ou app.config personnalisé. Aucun dossier android/ios présent ou versionné (CNG).
- New Architecture déjà activée ; typedRoutes et reactCompiler déjà activés. Aucun nouvel indicateur expérimental prévu.

## Travail local préservé

- assets/images/program-covers/firi-gent.png : 585580 → 2925092 octets.
- tests/emission-covers.test.mjs : ajout des attentes demb-ak-tay et apres-ndogou, retrait de apres-ndogou des fallbacks (3 insertions, 1 suppression).
- Ces deux modifications sont sauvegardées dans le stash nommé « backup pre Expo SDK 57 migration - local Firi Gent cover and cover tests », puis réappliquées sans supprimer le stash.
- Stash 13E-B existant conservé, objet 17f32ba62254b3469db83aaab19ab2cf8383a6f8.
- Contenu 13E-B : profil.tsx (4 insertions) et cinq fichiers non suivis : components/profile/account-devices-section.tsx, hooks/use-account-devices.ts, services/account-devices.ts, tests/phase13e-b-account-devices.test.mjs, types/account-device.ts.
- Branche dédiée : chore/expo-sdk-57-migration. Empreintes SHA-256 initiales conservées dans .expo/sdk-migration/initial-hashes.json (ignoré).

## Inventaire initial des dépendances directes

| Package | Déclaré | Résolu initial |
| --- | --- | --- |
| @expo/vector-icons | ^15.0.3 | 15.1.1 |
| @react-native-async-storage/async-storage | 2.2.0 | 2.2.0 |
| @react-navigation/bottom-tabs | ^7.4.0 | 7.18.14 |
| @react-navigation/elements | ^2.6.3 | 2.9.36 |
| @react-navigation/native | ^7.1.8 | 7.3.14 |
| @supabase/supabase-js | 2.112.3 | 2.112.3 |
| expo | ~54.0.35 | 54.0.36 |
| expo-constants | ~18.0.13 | 18.0.13 |
| expo-crypto | ~15.0.9 | 15.0.9 |
| expo-dev-client | ~6.0.21 | 6.0.21 |
| expo-device | ~8.0.10 | 8.0.10 |
| expo-font | ~14.0.12 | 14.0.12 |
| expo-haptics | ~15.0.8 | 15.0.8 |
| expo-image | ~3.0.11 | 3.0.11 |
| expo-linking | ~8.0.12 | 8.0.12 |
| expo-notifications | ~0.32.17 | 0.32.17 |
| expo-router | ~6.0.24 | 6.0.24 |
| expo-secure-store | ~15.0.8 | 15.0.8 |
| expo-splash-screen | ~31.0.13 | 31.0.13 |
| expo-status-bar | ~3.0.9 | 3.0.9 |
| expo-symbols | ~1.0.8 | 1.0.8 |
| expo-system-ui | ~6.0.9 | 6.0.9 |
| expo-web-browser | ~15.0.11 | 15.0.11 |
| react | 19.1.0 | 19.1.0 |
| react-dom | 19.1.0 | 19.1.0 |
| react-native | 0.81.5 | 0.81.5 |
| react-native-gesture-handler | ~2.28.0 | 2.28.0 |
| react-native-reanimated | ~4.1.1 | 4.1.7 |
| react-native-safe-area-context | ~5.6.0 | 5.6.2 |
| react-native-screens | ~4.16.0 | 4.16.0 |
| react-native-web | ~0.21.0 | 0.21.2 |
| react-native-webview | 13.15.0 | 13.15.0 |
| react-native-worklets | 0.5.1 | 0.5.1 |
| @types/react | ~19.1.0 | 19.1.17 |
| eslint | ^9.25.0 | 9.39.5 |
| eslint-config-expo | ~10.0.0 | 10.0.0 |
| typescript | ~5.9.2 | 5.9.3 |

Modules Expo natifs : constants, crypto, dev-client, device, font, haptics, image, linking, notifications, secure-store, splash-screen, symbols, system-ui, web-browser. Router et status-bar font partie de la couche Expo.
Modules communautaires natifs : AsyncStorage, gesture-handler, reanimated, safe-area-context, screens, webview, worklets. React Navigation apporte les composants/contexte de navigation ; Supabase JS reste épinglé à 2.112.3.
expo-application 7.0.8 et expo-file-system 19.0.23 sont transitifs (file-system sous node_modules/expo/node_modules). Aucun import applicatif direct détecté.

## Points de migration identifiés avant modification

- SDK 55 : Legacy Architecture retirée, edgeToEdgeEnabled supprimé ; projet déjà en New Architecture et edge-to-edge. Vérifier/supprimer uniquement les options devenues obsolètes.
- SDK 55 : notifications dans Expo Go Android deviennent une erreur ; garde Expo Go déjà présente avant acquisition de token. Aucun véritable push ni permission déclenchés par cet audit.
- SDK 56 : imports applicatifs @react-navigation déplacés vers expo-router. Sont concernés app/_layout.tsx et components/haptic-tab.tsx.
- SDK 56 : fetch global devient expo/fetch, Hermes v1 par défaut, TypeScript 6, iOS 16.4 minimum. Validation réseau et native sur appareil à prévoir.
- SDK 57 : utiliser le correctif stable récent pour les régressions Hermes (mémoire et démarrage) ; cible npm constatée 57.0.22.
- Reanimated/Worklets : alignement Expo requis ; Babel est configuré par babel-preset-expo, aucune config personnalisée à enlever.
- WebView : alignement Expo, aucune refonte de la lecture vidéo.

## Sources officielles consultées

- [Référence SDK 54](https://docs.expo.dev/versions/v54.0.0/)
- [Migration progressive](https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/)
- [SDK 55](https://expo.dev/changelog/sdk-55)
- [SDK 56](https://expo.dev/changelog/sdk-56)
- [SDK 57](https://expo.dev/changelog/sdk-57)
- [Référence SDK 57](https://docs.expo.dev/versions/v57.0.0/)
- [Migration Router 55 → 56](https://docs.expo.dev/router/migrate/sdk-55-to-56/)
- [Reanimated SDK 57](https://docs.expo.dev/versions/v57.0.0/sdk/reanimated/)
- [WebView SDK 57](https://docs.expo.dev/versions/v57.0.0/sdk/webview/)
- [Supabase Auth React Native](https://supabase.com/docs/guides/auth/quickstarts/react-native)
