import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { emissions as localEmissions } from '@/constants/emissions-content';
import { getPublicPrograms } from '@/services/programs';
import type { EnrichedEmission, PublicProgram } from '@/types/program';
import { enrichEmissions } from '@/utils/program-catalog';

type ProgramCatalogContextValue = {
  programs: PublicProgram[];
  emissions: EnrichedEmission[];
  isLoaded: boolean;
  isOfflineFallback: boolean;
  getEmissionBySlug: (slug: string) => EnrichedEmission | undefined;
};

const ProgramCatalogContext = createContext<ProgramCatalogContextValue | null>(null);

export function ProgramCatalogProvider({ children }: { children: ReactNode }) {
  const [programs, setPrograms] = useState<PublicProgram[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isOfflineFallback, setIsOfflineFallback] = useState(false);

  useEffect(() => {
    let mounted = true;
    getPublicPrograms()
      .then((result) => {
        if (!mounted) return;
        setPrograms(result);
        setIsOfflineFallback(false);
        if (__DEV__) {
          const resolved = enrichEmissions(localEmissions, result);
          console.info('[Programmes] Catalogue synchronisé.', {
            webPrograms: result.length,
            resolvedLocalEmissions: resolved.filter((item) => item.programId).length,
            unmatchedLocalSlugs: resolved.filter((item) => !item.programId).map((item) => item.slug),
          });
        }
      })
      .catch(() => {
        if (mounted) setIsOfflineFallback(true);
      })
      .finally(() => {
        if (mounted) setIsLoaded(true);
      });
    return () => { mounted = false; };
  }, []);

  const emissions = useMemo(
    () => enrichEmissions(localEmissions, programs),
    [programs],
  );
  const value = useMemo<ProgramCatalogContextValue>(() => ({
    programs,
    emissions,
    isLoaded,
    isOfflineFallback,
    getEmissionBySlug: (slug) => emissions.find((item) => item.slug === slug),
  }), [emissions, isLoaded, isOfflineFallback, programs]);

  return <ProgramCatalogContext.Provider value={value}>{children}</ProgramCatalogContext.Provider>;
}

export function useProgramCatalog() {
  const context = useContext(ProgramCatalogContext);
  if (!context) throw new Error('useProgramCatalog must be used within ProgramCatalogProvider.');
  return context;
}
