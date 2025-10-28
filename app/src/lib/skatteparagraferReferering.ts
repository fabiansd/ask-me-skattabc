function generateSkattelovLink(paragraf: string): string {
  const baseURL = 'https://lovdata.no/lov/1999-03-26-14/§';
  return `${baseURL}${paragraf}`;
}

export function replaceParagraphsWithLinks(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  const paragrafRegex = /§\s*(\d+-\d+)/g;

  return text.replace(paragrafRegex, (match, paragraf) => {
    const link = generateSkattelovLink(paragraf);
    return `[${match}](${link})`;
  });
}
