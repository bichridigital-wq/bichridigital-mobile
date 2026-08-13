import { apiPost } from '@/services/api-client';

export type AccountDeviceProof = {
  installationId: string;
  expoPushToken: string;
};

const authHeaders = (accessToken: string) => ({ Authorization: `Bearer ${accessToken}` });

export async function linkAccountDevice(accessToken: string, proof: AccountDeviceProof) {
  await apiPost('/account/link-device', {
    headers: authHeaders(accessToken),
    body: proof,
    debugLabel: 'Account device link',
  });
}

export async function unlinkAccountDevice(accessToken: string, proof: AccountDeviceProof) {
  await apiPost('/account/unlink-device', {
    headers: authHeaders(accessToken),
    body: proof,
    debugLabel: 'Account device unlink',
  });
}

let beforeSignOut: ((accessToken: string) => Promise<void>) | null = null;

export function registerAccountDeviceUnlinkHandler(handler: typeof beforeSignOut) {
  beforeSignOut = handler;
  return () => {
    if (beforeSignOut === handler) beforeSignOut = null;
  };
}

export async function unlinkAccountDeviceBeforeSignOut(accessToken: string) {
  try {
    await beforeSignOut?.(accessToken);
  } catch {
    // Unlink is best-effort and must never prevent local sign-out.
  }
}
