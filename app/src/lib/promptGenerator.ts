

export function generateConcretePromt(question: string, context: string[]) {

    let query = 'Du er en ekspert på norske skattelover og skal svare konkret og kort på spørsmålet ' +
     'på norsk, bruk konteksten og referer til paragrafer. Del svaret opp i flere paragrafer ved å bruke \n. ';

    query += `\n\n Spørsmål: ${question} `;
    query += `\n\n Kontekst: ${context.join('\n')} `;

    return query;

}

export function generateDetailedPromt(question: string, context: string[]) {

    let query = 'Du er en ekspert på norske skattelover og skal svare utedypende på spørsmålet på norsk og oppgi alle stegene som må gjennomføres, ' +
     'slik at man vet alt man skal gjøre. bruk konteksten og referer til paragrafer. Del svaret opp i flere paragrafer ved å bruke \n. ';

    query += `\n\n Spørsmål: ${question} `;
    query += `\n\n Kontekst: ${context.join('\n')} `;

    return query;

}

