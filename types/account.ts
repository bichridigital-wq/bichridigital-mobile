export type AccountProfile = { displayName: string; avatarUrl: string | null; createdAt: string; updatedAt: string };
export type MeResponse = { user: { id: string; email: string | null }; profile: AccountProfile };
