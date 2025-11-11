import { replaceParagraphsWithLinks } from '@/app/src/lib/skatteparagraferReferering';

describe('replaceParagraphsWithLinks', () => {
  it('should convert single two-level paragraphs to links', () => {
    const inputText = 'Se § 8-1 for mer informasjon.';
    const expectedOutput =
      'Se [§ 8-1](https://lovdata.no/lov/1999-03-26-14/§8-1) for mer informasjon.';
    expect(replaceParagraphsWithLinks(inputText)).toBe(expectedOutput);
  });

  it('should convert single three-level paragraphs to links', () => {
    const inputText = '§ 1-3-26 annet ledd beskriver dette.';
    const expectedOutput =
      '[§ 1-3-26](https://lovdata.no/lov/1999-03-26-14/§1-3-26) annet ledd beskriver dette.';
    expect(replaceParagraphsWithLinks(inputText)).toBe(expectedOutput);
  });

  it('should convert paragraph ranges to separate links', () => {
    const inputText =
      'Registrerte har fradragsrett for inngående mva på anskaffelser til bruk i den registrerte virksomheten (§§ 8-1 til 8-3).';
    const expectedOutput =
      'Registrerte har fradragsrett for inngående mva på anskaffelser til bruk i den registrerte virksomheten ([§ 8-1](https://lovdata.no/lov/1999-03-26-14/§8-1) til [§ 8-3](https://lovdata.no/lov/1999-03-26-14/§8-3)).';
    expect(replaceParagraphsWithLinks(inputText)).toBe(expectedOutput);
  });

  it('should handle both ranges and individual paragraphs in same text', () => {
    const inputText = 'Se §§ 8-1 til 8-3 og også § 11-5 for detaljer.';
    const expectedOutput =
      'Se [§ 8-1](https://lovdata.no/lov/1999-03-26-14/§8-1) til [§ 8-3](https://lovdata.no/lov/1999-03-26-14/§8-3) og også [§ 11-5](https://lovdata.no/lov/1999-03-26-14/§11-5) for detaljer.';
    expect(replaceParagraphsWithLinks(inputText)).toBe(expectedOutput);
  });

  it('should handle multiple individual paragraphs', () => {
    const inputText = 'Se § 6-48, § 6-50 og § 6-31 for informasjon.';
    const expectedOutput =
      'Se [§ 6-48](https://lovdata.no/lov/1999-03-26-14/§6-48), [§ 6-50](https://lovdata.no/lov/1999-03-26-14/§6-50) og [§ 6-31](https://lovdata.no/lov/1999-03-26-14/§6-31) for informasjon.';
    expect(replaceParagraphsWithLinks(inputText)).toBe(expectedOutput);
  });

  it('should handle text with no paragraph references', () => {
    const inputText = 'This text has no paragraph references.';
    const expectedOutput = 'This text has no paragraph references.';
    expect(replaceParagraphsWithLinks(inputText)).toBe(expectedOutput);
  });

  it('should handle empty or null input', () => {
    expect(replaceParagraphsWithLinks('')).toBe('');
    expect(replaceParagraphsWithLinks(null as any)).toBe('');
    expect(replaceParagraphsWithLinks(undefined as any)).toBe('');
  });

  it('should handle paragraph ranges with three-level references', () => {
    const inputText = 'Se §§ 1-3-26 til 1-3-28 for detaljer.';
    const expectedOutput =
      'Se [§ 1-3-26](https://lovdata.no/lov/1999-03-26-14/§1-3-26) til [§ 1-3-28](https://lovdata.no/lov/1999-03-26-14/§1-3-28) for detaljer.';
    expect(replaceParagraphsWithLinks(inputText)).toBe(expectedOutput);
  });
});
