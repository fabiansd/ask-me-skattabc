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
    'Du er en ekspert på norske skattelover. Svar kortfattet og rett på sak. ' +
    'Gi kun det nødvendige svaret uten unødvendige forklaringer. ' +
    'Bruk konteksten og referer til paragrafer. Del svaret opp i flere paragrafer ved å bruke \\n.';

  query += `\n\nSpørsmål: ${queryChatRequest.searchText}`;

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
    'Du er en ekspert på norske skattelover. Bruk folkelig språk og forklar grundig og utdypende. ' +
    'Anta at jeg ikke har forkunnskaper om skatt. Gi detaljerte steg-for-steg instruksjoner for hva brukeren må gjøre. ' +
    'Inkluder praktiske eksempler og forklar hvorfor ting er som de er. ' +
    'Bruk konteksten og referer til paragrafer. Del svaret opp i flere paragrafer ved å bruke \\n.';

  query += `\n\nSpørsmål: ${queryChatRequest.searchText}`;

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
