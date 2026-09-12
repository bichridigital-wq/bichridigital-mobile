// Static requires let Metro report a missing bundled cover at build time.
const EMISSION_COVERS: Readonly<Record<string, number>> = {
  'li-ci-biir-ndiagne': require('../assets/images/program-covers/li-ci-biir-ndiagne.png'),
  'jotaayu-bichri': require('../assets/images/program-covers/jotaayu-bichri.png'),
  'talaatay-cheikh-ibra': require('../assets/images/program-covers/talaatay-cheikh-ibra.png'),
  'firi-gent': require('../assets/images/program-covers/firi-gent.png'),

  'ettu-jigeen-ni': require('../assets/images/program-covers/ettu-jigeen-ni.png'),
  'seen-wergu-yaram': require('../assets/images/program-covers/seen-wer-gu-yaram.png'),
  'xam-ndiagne-jotna': require('../assets/images/program-covers/xam-ndiagne-jotna.png'),
  'ettu-sport': require('../assets/images/program-covers/ettu-sport.png'),
  'gattandu-magal': require('../assets/images/program-covers/gattandu-maggal.png'),
  'demb-ak-tay': require('../assets/images/program-covers/demb-ak-tay.png'),
  'apres-ndogou': require('../assets/images/program-covers/apres-ndogou.png'),
};
export function getEmissionCoverSource(slug: string): number | undefined {
  return Object.prototype.hasOwnProperty.call(EMISSION_COVERS, slug)
    ? EMISSION_COVERS[slug]
    : undefined;
}
