import type { ESDocument } from '@/app/src/clients/esUtil';

export const MOCK_SOURCE_INDEX = 'mock_skatt_para';

export const MOCK_SOURCES: ESDocument[] = [
  {
    _id: 'mock-1',
    _index: MOCK_SOURCE_INDEX,
    department: 'Skatteetaten',
    document_title: 'Skatteloven § 5-1 — Hovedregel om inntekt',
    article_number: '5-1',
    article_title: 'Hovedregel',
    content:
      'Som skattepliktig inntekt anses enhver fordel vunnet ved arbeid, kapital eller virksomhet, samt pensjon, føderåd og livrente.\\nSom inntekt av arbeid, kapital eller virksomhet regnes også gevinst ved realisasjon av formuesobjekt.',
  },
  {
    _id: 'mock-2',
    _index: MOCK_SOURCE_INDEX,
    department: 'Skatteetaten',
    document_title: 'Skatteloven § 6-1 — Hovedregel om fradrag',
    article_number: '6-1',
    article_title: 'Hovedregel',
    content:
      'Det gis fradrag for kostnad som er pådratt for å erverve, vedlikeholde eller sikre skattepliktig inntekt.\\nBestemmelser som presiserer, utvider eller innskrenker fradragsretten er gitt i §§ 6-10 til 6-32.',
  },
  {
    _id: 'mock-3',
    _index: MOCK_SOURCE_INDEX,
    department: 'Skatteetaten',
    document_title: 'Skatteloven § 6-13 — Merkostnader ved opphold utenfor hjemmet',
    article_number: '6-13',
    article_title: 'Merkostnader',
    content:
      'Skattyter som av hensyn til arbeidet må bo utenfor hjemmet, gis fradrag for merkostnader på grunn av fraværet.\\nFradrag gis etter satser fastsatt av departementet.',
  },
  {
    _id: 'mock-4',
    _index: MOCK_SOURCE_INDEX,
    department: 'Finansdepartementet',
    document_title: 'Skatteloven § 10-11 — Utbytte',
    article_number: '10-11',
    content:
      'Som utbytte regnes enhver utdeling som innebærer en vederlagsfri overføring av verdier fra selskap til aksjonær.\\nDet gjelder ikke for tilbakebetaling av innbetalt aksjekapital.',
  },
  {
    _id: 'mock-5',
    _index: MOCK_SOURCE_INDEX,
    department: 'Skatteetaten',
    document_title: 'Merverdiavgiftsloven § 3-1 — Hovedregel',
    article_number: '3-1',
    content:
      'Det skal beregnes merverdiavgift ved omsetning av varer og tjenester.\\nSatsene fastsettes av Stortinget.',
  },
  {
    _id: 'mock-6',
    _index: MOCK_SOURCE_INDEX,
    department: 'Skatteetaten',
    document_title: 'Skatteloven § 16-1 — Fradrag for skatt betalt i utlandet',
    article_number: '16-1',
    content:
      'Det gis fradrag i norsk skatt for skatt som er betalt til fremmed stat av inntekt med kilde der.\\nFradraget kan ikke overstige den norske skatten på den utenlandske inntekten.',
  },
  {
    _id: 'mock-7',
    _index: MOCK_SOURCE_INDEX,
    department: 'Skatteetaten',
    document_title: 'Skatteloven § 9-3 — Skattefri gevinst ved realisasjon av bolig',
    article_number: '9-3',
    content:
      'Gevinst ved realisasjon av boligeiendom er skattefri når eieren har eid boligen i minst ett år før realisasjonen og brukt den som egen bolig i minst ett av de to siste årene.',
  },
];

/**
 * Returns a deterministic subset of mock sources for the mock answer so the
 * Kilder pane has content to render when `USE_MOCK_DATA=true`.
 */
export const getMockSourceDocumentIds = (): string[] =>
  MOCK_SOURCES.slice(0, 4).map(doc => doc._id);

export const getMockQueryResponse = () => ({
  openaiResponse: `🧙‍♂️ MOCK ANSWER (Today's random number: ${Math.floor(Math.random() * 1000) + 1}) - Based on ancient dwarf financial wisdom:

1. Collect underpants
2. ???
3. Profit!

This foolproof tax strategy has been used by dwarfs for centuries.`,
  conversation_id: 1,
  sourceIndex: MOCK_SOURCE_INDEX,
  sourceDocumentIds: getMockSourceDocumentIds(),
});
