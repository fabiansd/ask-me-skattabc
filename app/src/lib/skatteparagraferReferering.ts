/* eslint-disable @typescript-eslint/no-unused-vars */
function generateSkattelovLink(paragraf: string): string {
  const baseURL = 'https://lovdata.no/lov/1999-03-26-14/§';
  return `${baseURL}${paragraf}`;
}

export function replaceParagraphsWithLinks(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  // First handle ranges like "§§ 8-1 til 8-3"
  const rangeRegex = /§§?\s*(\d+-\d+(?:-\d+)?)\s+til\s+(\d+-\d+(?:-\d+)?)/g;
  let result = text.replace(rangeRegex, (match, start, end) => {
    return `__RANGE_START__${start}__RANGE_MID__${end}__RANGE_END__`;
  });

  // Then handle individual paragraphs
  const paragrafRegex = /§\s*(\d+-\d+(?:-\d+)?)/g;
  result = result.replace(paragrafRegex, (match, paragraf) => {
    const link = generateSkattelovLink(paragraf);
    return `[${match}](${link})`;
  });

  // Finally restore the range placeholders with proper links
  result = result.replace(
    /__RANGE_START__(\d+-\d+(?:-\d+)?)__RANGE_MID__(\d+-\d+(?:-\d+)?)__RANGE_END__/g,
    (match, start, end) => {
      const startLink = generateSkattelovLink(start);
      const endLink = generateSkattelovLink(end);
      return `[§ ${start}](${startLink}) til [§ ${end}](${endLink})`;
    }
  );

  return result;
}
