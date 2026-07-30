import * as Haptics from 'expo-haptics';

export function playAddHaptic(): void {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
}

export function playRemoveHaptic(): void {
  Haptics.selectionAsync().catch(() => undefined);
}
