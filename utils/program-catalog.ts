import type { EmissionItem } from '@/constants/emissions-content';
import type { EnrichedEmission, PublicProgram } from '@/types/program';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function optionalString(value: unknown): string | null | undefined {
  if (value === null) return null;
  return typeof value === 'string' ? value : undefined;
}

function safeThumbnail(value: unknown): string | null | undefined {
  const thumbnail = optionalString(value);
  if (thumbnail === null || thumbnail === undefined) return thumbnail;
  try {
    return new URL(thumbnail).protocol === 'https:' ? thumbnail : undefined;
  } catch {
    return undefined;
  }
}

export function parseProgramsResponse(value: unknown): PublicProgram[] {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('PROGRAMS_RESPONSE_INVALID');
  }
  const response = value as Record<string, unknown>;
  if (response.source !== 'programs' || !Array.isArray(response.data)) {
    throw new Error('PROGRAMS_RESPONSE_INVALID');
  }
  const programs: PublicProgram[] = [];
  const seen = new Set<string>();
  for (const item of response.data) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) continue;
    const row = item as Record<string, unknown>;
    const id = typeof row.id === 'string' ? row.id : '';
    const name = typeof row.name === 'string' ? row.name.trim() : '';
    const slug = typeof row.slug === 'string' ? row.slug.trim() : '';
    const category = typeof row.category === 'string' ? row.category.trim() : '';
    const description = optionalString(row.defaultDescription);
    const thumbnail = safeThumbnail(row.defaultThumbnailUrl);
    const duration = row.defaultDurationMinutes;
    if (
      !UUID_PATTERN.test(id) || !name || !SLUG_PATTERN.test(slug) || !category ||
      description === undefined || thumbnail === undefined ||
      !Number.isInteger(duration) || Number(duration) < 15 || Number(duration) > 360 ||
      seen.has(id)
    ) continue;
    seen.add(id);
    programs.push({
      id, name, slug, category,
      defaultDescription: description,
      defaultThumbnailUrl: thumbnail,
      defaultDurationMinutes: Number(duration),
    });
  }
  return programs;
}

export function enrichEmissions(
  localEmissions: readonly EmissionItem[],
  programs: readonly PublicProgram[],
): EnrichedEmission[] {
  const bySlug = new Map(programs.map((program) => [program.slug, program.id]));
  return localEmissions.map((emission) => ({
    ...emission,
    programId: bySlug.get(emission.slug) ?? null,
  }));
}
