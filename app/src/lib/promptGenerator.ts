import { QueryChatRequest } from '../interface/skattSokInterface';

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

export function generateConcretePrompt(
  queryChatRequest: QueryChatRequest,
  context: string[],
  conversationHistory?: ConversationMessage[]
): string {
  let query =
    'Du er en ekspert på norske skattelover. Svar kortfattet med enkelt, hverdagslig språk uten juss-fagord. ' +
    'Oversett vanskelige skatteloven-ord til vanlig norsk folk forstår. ' +
    'Bruk KUN informasjon fra konteksten - ikke finn på noe. ' +
    'Når du nevner paragrafer, lag klikkbare markdown-links: [§ X-Y-Z](https://lovdata.no/lov/1999-03-26-14/§X-Y-Z). ' +
    'Del svaret opp i paragrafer.';

  query += `\n\nSpørsmål: ${queryChatRequest.searchText}`;

  query += 'Ikke gjenta tidligere svar - vær kreativ med forklaringen.\n';

  if (conversationHistory && conversationHistory.length > 0) {
    query += '\n\nTidligere spørsmål og svar:';
    for (const msg of conversationHistory) {
      if (msg.role === 'user') {
        query += `\n- Spørsmål: ${msg.content}`;
      } else if (msg.role === 'assistant') {
        query += `\n- Svar: ${msg.content}`;
      }
    }
  }

  if (context && context.length > 0) {
    query += `\n\nKontekst: ${context.join('\n')}`;
  }

  return query;
}

export function generateDetailedPromt(
  queryChatRequest: QueryChatRequest,
  context: string[],
  conversationHistory?: ConversationMessage[]
): string {
  let query =
    'Du er en ekspert på norske skattelover som forklarer ting enkelt og forståelig. ' +
    'Bruk hverdagsord i stedet for juss-språk. Oversett faguttrykk til vanlig norsk. ' +
    'Forklar trinn-for-trinn som til en vanlig person uten skattekunnskap. ' +
    'Bruk KUN informasjon fra konteksten - ikke finn på noe. ' +
    'Når du nevner paragrafer, lag klikkbare markdown-links: [§ X-Y-Z](https://lovdata.no/lov/1999-03-26-14/§X-Y-Z). ' +
    'Del svaret opp i paragrafer.';

  query += `\n\nSpørsmål: ${queryChatRequest.searchText}\n`;

  query += 'Ikke gjenta tidligere svar - vær kreativ med forklaringen.\n';

  if (conversationHistory && conversationHistory.length > 0) {
    query += '\n\nTidligere spørsmål og svar:';
    for (const msg of conversationHistory) {
      if (msg.role === 'user') {
        query += `\n- Spørsmål: ${msg.content}`;
      } else if (msg.role === 'assistant') {
        query += `\n- Svar: ${msg.content}`;
      }
    }
  }

  if (context && context.length > 0) {
    query += `\n\nKontekst: ${context.join('\n')}`;
  }

  return query;
}
