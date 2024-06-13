import { QueryChatRequest } from "../interface/skattSokInterface";


export function generateConcretePrompt(queryChatRequest: QueryChatRequest, context: string[]): string {
    let query = 'Du er en ekspert på norske skattelover og skal svare konkret og kort på spørsmålet ' +
        'på norsk. Bruk konteksten og referer til paragrafer. Bruk tidligere spørsmål og svar til å bygge ' + 
        'videre dersom dette er med. Del svaret opp i flere paragrafer ved å bruke \\n.';

    query += `\n\nSpørsmål: ${queryChatRequest.searchText}`;

    if (queryChatRequest.history && queryChatRequest.history.length > 0) {
        query += '\n\nTidligere spørsmål og svar:';
        for (const historyItem of queryChatRequest.history) {
            query += `\n- Spørsmål: ${historyItem.searchInput}`;
            query += `\n- Svar: ${historyItem.queryResponse}`;
        }
    }

    if (context && context.length > 0) {
        query += `\n\nKontekst: ${context.join('\n')}`;
    }

    return query;
}

export function generateDetailedPromt(queryChatRequest: QueryChatRequest, context: string[]): string {
    let query = 'Du er en ekspert på norske skattelover og skal svare utedypende på spørsmålet på norsk' + 
        ' og oppgi alle stegene som må gjennomføres, gjerne med eksempler, ' +
        'på norsk. Bruk konteksten og referer til paragrafer. Bruk tidligere spørsmål og svar til å bygge ' + 
        'videre dersom dette er med. Del svaret opp i flere paragrafer ved å bruke \\n.';

    query += `\n\nSpørsmål: ${queryChatRequest.searchText}`;

    if (queryChatRequest.history && queryChatRequest.history.length > 0) {
        query += '\n\nTidligere spørsmål og svar:';
        for (const historyItem of queryChatRequest.history) {
            query += `\n- Spørsmål: ${historyItem.searchInput}`;
            query += `\n- Svar: ${historyItem.queryResponse}`;
        }
    }

    if (context && context.length > 0) {
        query += `\n\nKontekst: ${context.join('\n')}`;
    }

    return query;
}
