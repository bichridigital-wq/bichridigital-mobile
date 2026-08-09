import type { EnrichedEmission } from '@/types/program';
import type { FavoriteEmission } from '@/types/user-library';

export const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

export function enrichFavoriteEmissions(
  favorites: readonly FavoriteEmission[],
  catalog: readonly EnrichedEmission[],
): FavoriteEmission[] {
  const ids = new Map(catalog.map((item) => [item.slug, item.programId]));
  let changed = false;
  const result = favorites.map((favorite) => {
    const resolved = ids.get(favorite.slug);
    if (!resolved || favorite.programId === resolved) return favorite;
    changed = true;
    return { ...favorite, programId: resolved };
  });
  return changed ? result : (favorites as FavoriteEmission[]);
}

export function mergeFavoriteEmissionsByProgramIds(
  favorites: readonly FavoriteEmission[],
  programIds: readonly string[],
  catalog: readonly EnrichedEmission[],
  savedAt = new Date().toISOString(),
): FavoriteEmission[] {
  const byId = new Map(
    catalog.filter((item) => item.programId).map((item) => [item.programId!, item]),
  );
  const existing = new Set(favorites.map((item) => item.slug));
  const additions: FavoriteEmission[] = [];
  for (const programId of programIds) {
    const item = byId.get(programId);
    if (!item || existing.has(item.slug)) continue;
    existing.add(item.slug);
    additions.push({
      slug: item.slug,
      title: item.title,
      category: item.category,
      coverColor: item.coverColor,
      programId,
      savedAt,
    });
  }
  return additions.length ? [...additions, ...favorites] : (favorites as FavoriteEmission[]);
}
