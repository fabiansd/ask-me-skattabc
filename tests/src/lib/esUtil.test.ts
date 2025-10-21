import { unwrapESResponse } from '@/app/src/lib/esUtil';

describe('esUtil', () => {
  describe('unwrapESResponse', () => {
    it('should extract content from Elasticsearch response hits', () => {
      const mockESResponse = {
        hits: {
          hits: [
            {
              _source: {
                content: 'Første dokument om skatteloven',
              },
            },
            {
              _source: {
                content: 'Andre dokument om mva',
              },
            },
            {
              _source: {
                content: 'Tredje dokument om fradrag',
              },
            },
          ],
        },
      };

      const result = unwrapESResponse(mockESResponse);

      expect(result).toHaveLength(3);
      expect(result[0]).toBe('Første dokument om skatteloven');
      expect(result[1]).toBe('Andre dokument om mva');
      expect(result[2]).toBe('Tredje dokument om fradrag');
    });

    it('should handle empty hits array', () => {
      const mockESResponse = {
        hits: {
          hits: [],
        },
      };

      const result = unwrapESResponse(mockESResponse);

      expect(result).toHaveLength(0);
      expect(result).toEqual([]);
    });

    it('should handle single hit', () => {
      const mockESResponse = {
        hits: {
          hits: [
            {
              _source: {
                content: 'Enkelt dokument',
              },
            },
          ],
        },
      };

      const result = unwrapESResponse(mockESResponse);

      expect(result).toHaveLength(1);
      expect(result[0]).toBe('Enkelt dokument');
    });

    it('should handle content with special characters and Norwegian text', () => {
      const mockESResponse = {
        hits: {
          hits: [
            {
              _source: {
                content: 'Dokument med æøå og § 5-1 skatteloven',
              },
            },
            {
              _source: {
                content: 'Tekst med "sitater" og (parenteser)',
              },
            },
          ],
        },
      };

      const result = unwrapESResponse(mockESResponse);

      expect(result).toHaveLength(2);
      expect(result[0]).toBe('Dokument med æøå og § 5-1 skatteloven');
      expect(result[1]).toBe('Tekst med "sitater" og (parenteser)');
    });

    it('should handle content with newlines and whitespace', () => {
      const mockESResponse = {
        hits: {
          hits: [
            {
              _source: {
                content: 'Linje 1\nLinje 2\n\nLinje 4 med ekstra mellomrom',
              },
            },
          ],
        },
      };

      const result = unwrapESResponse(mockESResponse);

      expect(result[0]).toBe('Linje 1\nLinje 2\n\nLinje 4 med ekstra mellomrom');
    });

    it('should handle empty content strings', () => {
      const mockESResponse = {
        hits: {
          hits: [
            {
              _source: {
                content: '',
              },
            },
            {
              _source: {
                content: 'Normal innhold',
              },
            },
          ],
        },
      };

      const result = unwrapESResponse(mockESResponse);

      expect(result).toHaveLength(2);
      expect(result[0]).toBe('');
      expect(result[1]).toBe('Normal innhold');
    });

    it('should maintain order of hits', () => {
      const mockESResponse = {
        hits: {
          hits: [
            { _source: { content: 'Første' } },
            { _source: { content: 'Andre' } },
            { _source: { content: 'Tredje' } },
            { _source: { content: 'Fjerde' } },
            { _source: { content: 'Femte' } },
          ],
        },
      };

      const result = unwrapESResponse(mockESResponse);

      expect(result).toEqual(['Første', 'Andre', 'Tredje', 'Fjerde', 'Femte']);
    });

    it('should handle large content strings', () => {
      const largeContent = 'A'.repeat(10000);
      const mockESResponse = {
        hits: {
          hits: [
            {
              _source: {
                content: largeContent,
              },
            },
          ],
        },
      };

      const result = unwrapESResponse(mockESResponse);

      expect(result[0]).toBe(largeContent);
      expect(result[0]).toHaveLength(10000);
    });
  });
});
