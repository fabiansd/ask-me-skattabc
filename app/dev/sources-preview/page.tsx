import { notFound } from 'next/navigation';

import { ESDocument } from '../../src/clients/esUtil';

import SourcesPreviewClient from './SourcesPreviewClient';

// Evaluate the env-var gate at request time (not build time) so this page can
// ship in the production bundle while remaining 404 unless ENABLE_DEV_PREVIEWS
// is explicitly set on the running server.
export const dynamic = 'force-dynamic';

// Mock source data used only by the dev preview page. Shape matches what
// `/api/messages/[id]/sources` returns in production.
const mockSources: ESDocument[] = [
  {
    _id: '1',
    _index: 'skatt_para',
    department: 'Skatteetaten',
    document_title: 'Skatteloven § 5-1 — Hovedregel om inntekt',
    article_number: '5-1',
    article_title: 'Hovedregel',
    content:
      'Som skattepliktig inntekt anses enhver fordel vunnet ved arbeid, kapital eller virksomhet, samt pensjon, føderåd og livrente.\\nSom inntekt av arbeid, kapital eller virksomhet regnes også gevinst ved realisasjon av formuesobjekt.',
  },
  {
    _id: '2',
    _index: 'skatt_para',
    department: 'Skatteetaten',
    document_title: 'Skatteloven § 6-1 — Hovedregel om fradrag',
    article_number: '6-1',
    article_title: 'Hovedregel',
    content:
      'Det gis fradrag for kostnad som er pådratt for å erverve, vedlikeholde eller sikre skattepliktig inntekt.\\nBestemmelser som presiserer, utvider eller innskrenker fradragsretten er gitt i §§ 6-10 til 6-32.',
  },
  {
    _id: '3',
    _index: 'skatt_para',
    department: 'Skatteetaten',
    document_title: 'Skatteloven § 6-13 — Merkostnader ved opphold utenfor hjemmet',
    article_number: '6-13',
    article_title: 'Merkostnader',
    content:
      'Skattyter som av hensyn til arbeidet må bo utenfor hjemmet, gis fradrag for merkostnader på grunn av fraværet.\\nFradrag gis etter satser fastsatt av departementet.',
  },
  {
    _id: '4',
    _index: 'skatt_para',
    department: 'Finansdepartementet',
    document_title: 'Skatteloven § 10-11 — Utbytte',
    article_number: '10-11',
    content:
      'Som utbytte regnes enhver utdeling som innebærer en vederlagsfri overføring av verdier fra selskap til aksjonær.\\nDet gjelder ikke for tilbakebetaling av innbetalt aksjekapital.',
  },
  {
    _id: '5',
    _index: 'skatt_para',
    department: 'Skatteetaten',
    document_title: 'Merverdiavgiftsloven § 3-1 — Hovedregel',
    article_number: '3-1',
    content:
      'Det skal beregnes merverdiavgift ved omsetning av varer og tjenester.\\nSatsene fastsettes av Stortinget.',
  },
  {
    _id: '6',
    _index: 'skatt_para',
    department: 'Skatteetaten',
    document_title: 'Skatteloven § 16-1 — Fradrag for skatt betalt i utlandet',
    article_number: '16-1',
    content:
      'Det gis fradrag i norsk skatt for skatt som er betalt til fremmed stat av inntekt med kilde der.\\nFradraget kan ikke overstige den norske skatten på den utenlandske inntekten.',
  },
  {
    _id: '7',
    _index: 'skatt_para',
    department: 'Skatteetaten',
    document_title: 'Skatteloven § 2-1 — Personlig skatteplikt',
    article_number: '2-1',
    content:
      'Personer som er bosatt i riket, har plikt til å svare skatt av hele sin formue og inntekt her i riket og i utlandet.',
  },
  {
    _id: '8',
    _index: 'skatt_para',
    department: 'Skatteetaten',
    document_title: 'Skatteloven § 9-3 — Skattefri gevinst ved realisasjon av bolig',
    article_number: '9-3',
    content:
      'Gevinst ved realisasjon av boligeiendom er skattefri når eieren har eid boligen i minst ett år før realisasjonen og brukt den som egen bolig i minst ett av de to siste årene.',
  },
  {
    _id: '9',
    _index: 'skatt_para',
    department: 'Skatteetaten',
    document_title: 'Skatteloven § 14-2 — Tidfesting av inntekt',
    article_number: '14-2',
    content:
      'Inntekt skal tas til beskatning i det inntektsår fordelen er innvunnet.\\nFordelen anses innvunnet når skattyter har ervervet en ubetinget rett til ytelsen.',
  },
  {
    _id: '10',
    _index: 'skatt_para',
    department: 'Skatteetaten',
    document_title: 'Skattebetalingsloven § 10-10 — Forfall av forskuddstrekk',
    article_number: '10-10',
    content:
      'Forskuddstrekk forfaller til betaling den 15. i måneden etter trekkperioden.\\nFor arbeidsgivere med månedlige trekkperioder gjelder særregler.',
  },
];

// The /dev/* routes are only available when ENABLE_DEV_PREVIEWS=true. This
// keeps dev preview pages out of the production app even if they ship in the
// deployed bundle.
export default function SourcesPreviewPage() {
  if (process.env.ENABLE_DEV_PREVIEWS !== 'true') {
    notFound();
  }

  return <SourcesPreviewClient initialSources={mockSources} />;
}
