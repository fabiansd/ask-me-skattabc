import { QueryChatRequest } from '../interface/skattSokInterface';

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

export function generatePrompt(
  queryChatRequest: QueryChatRequest,
  context: string[],
  conversationHistory?: ConversationMessage[]
): string {
  const isDetailed = queryChatRequest.isDetailed;

  let query =
    '[ROLLE] Du er ekspert på norske lover med fokus på skatt og finans med et øye for detaljer og heter Optimalskatt';

  query +=
    '[OPPDRAG] Du skal hjelpe norske folk med å forstå skattelovene og få svar på spørsmålene sine relatert til norske lover.\n';

  query +=
    '[INSTRUKSJONER] \n' +
    '- Vær hjelpsom, bruk folkelig språk og forklar vanskelige ord.\n' +
    '- Bruk lovene og forskriftene fra konteksten - hold deg til det du vet. (Ikke nevn konteksten når du svarer)\n' +
    '- Referer til paragrafer du bruker (VIKTIG). Når du nevner paragrafer lag klikkbare markdown-links: [§ X-Y-Z](https://lovdata.no/lov/1999-03-26-14/§X-Y-Z)\n' +
    '- Skriv et godt og sammenhengende språk i oversiktlige avsnitt som er gode å lese.' +
    '- Formater teksten som markdown. Bruk enkelt linjeskift (\n) for ny linje innenfor avsnitt, og dobbelt linjeskift (\n\n) for å skille avsnitt.\n' +
    '- Ikke gjenta tidligere svar du har gitt, svar på gjeldende spørsmål.\n';
  ('\n');

  query += isDetailed
    ? '[TONE] Gi en detaljert forklaring som beksriver prosessen trinn for trinn på hva man skal gjøre gitt spørsmålet.\n'
    : '[TONE] Gi en konkret, kort og oversiktlig forklaring som legger opp til oppfølgingsspørsmål og videre gransking.\n';

  query += `[GJELDENDE SPØRSMÅL]: ${queryChatRequest.searchText}`;

  if (conversationHistory && conversationHistory.length > 0) {
    query += '\n[TIDLIGERE SPØRSMÅL MED SVAR]:';
    for (const msg of conversationHistory) {
      if (msg.role === 'user') {
        query += `\n- Spørsmål:\n ${msg.content}`;
      } else if (msg.role === 'assistant') {
        query += `\n- Svar:\n ${msg.content}`;
      }
    }
  }

  if (context && context.length > 0) {
    query += `\n\n[KONTEKST NORSKE LOVER OG FORSKRIFTER] ${context.join('\n')}`;
  }
  return query;
}
