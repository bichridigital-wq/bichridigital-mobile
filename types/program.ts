export type PublicProgram = {
  id: string;
  name: string;
  slug: string;
  category: string;
  defaultDescription: string | null;
  defaultThumbnailUrl: string | null;
  defaultDurationMinutes: number;
};

export type EnrichedEmission = import('@/constants/emissions-content').EmissionItem & {
  programId: string | null;
};
