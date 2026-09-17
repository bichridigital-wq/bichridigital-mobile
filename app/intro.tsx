import { Redirect, router } from 'expo-router';

import { IntroLoading } from '@/components/onboarding/intro-loading';
import { IntroScreen } from '@/components/onboarding/intro-screen';
import { useIntroSeen } from '@/hooks/use-intro-seen';
import { introState } from '@/services/intro-storage';

export default function IntroRoute() {
  const seen = useIntroSeen();
  if (seen === null) return <IntroLoading />;
  if (seen) return <Redirect href="/(tabs)" />;
  return <IntroScreen onEnter={async () => {
    await introState.complete();
    router.replace('/(tabs)');
  }} />;
}
