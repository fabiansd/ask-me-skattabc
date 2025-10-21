import extractParagraphNotations from "@/app/src/lib/extractParagraphNotation";

describe('extractParagraphNotations', () => {
  it('should extract all paragraph notations with accompanying numbers', () => {
    const inputText = `Basert på informasjonen du har gitt om din situasjon som IT-konsulent i Accenture, hvor du sykler til jobb, leier bolig og ikke har et eget aksjeselskap (AS), er det noen potensielle fradrag du kan vurdere for å redusere din inntektsskatt:

Fagforeningskontingent: Hvis du er medlem av en fagforening, kan du trekke fra kontingenten du betaler til fagforeningen. Dette fradraget er regulert i skatteloven § 6-48.

Gaver til frivillige organisasjoner: Du kan trekke fra gaver til visse frivillige organisasjoner, forutsatt at disse er godkjente og oppfyller visse krav fastsatt av skattemyndighetene. Dette er regulert i skatteloven § 6-50.

Minstefradrag: Du har rett til minstefradrag i lønnsinntekt, som automatisk beregnes av skattemyndighetene. Dette fradraget er ment å dekke generelle kostnader knyttet til å ha en inntekt, som for eksempel slitasje på klær, transport til og fra jobb (selv om du sykler) og andre småutgifter. Minstefradraget er regulert i skatteloven § 6-31.

Renteutgifter: Hvis du har lån, inkludert studielån eller boliglån, kan renteutgiftene på disse lånene trekkes fra. Dette er regulert i skatteloven § 6-40.`;

    const expectedOutput = '§ 6-48 § 6-50 § 6-31 § 6-40';
    expect(extractParagraphNotations(inputText)).toBe(expectedOutput);
  });

  it('should return "" if no notations are present', () => {
    const inputText = 'This text does not contain any paragraph notations.';
    const expectedOutput = '';
    expect(extractParagraphNotations(inputText)).toBe(expectedOutput);
  });
});
