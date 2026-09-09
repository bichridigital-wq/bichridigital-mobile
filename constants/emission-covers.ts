// Static requires let Metro report a missing bundled cover at build time.
const EMISSION_COVERS: Readonly<Record<string, number>> = {
  'li-ci-biir-ndiagne': require('../assets/images/program-covers/li-ci-biir-ndiagne.png'),
};

export function getEmissionCoverSource(slug: string): number | undefined {
  return Object.prototype.hasOwnProperty.call(EMISSION_COVERS, slug)
    ? EMISSION_COVERS[slug]
    : undefined;
}
