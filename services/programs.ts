import { apiGet } from '@/services/api-client';
import type { PublicProgram } from '@/types/program';
import { parseProgramsResponse } from '@/utils/program-catalog';

export const PROGRAMS_PATH = '/programs';

export async function getPublicPrograms(): Promise<PublicProgram[]> {
  const response = await apiGet<unknown>(PROGRAMS_PATH, {
    debugLabel: 'Programmes',
  });
  return parseProgramsResponse(response);
}
