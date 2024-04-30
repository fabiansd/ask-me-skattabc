

export default function generatePromt(question: string, context: string[]) {

    let query = 'Du er en ekspert på norske skattelover og skal svare konkret og kort på spørsmålet på norsk, bruk konteksten og referer til paragrafer. Del svaret opp i flere paragrafer. ';

    query += `\n\n Spørsmål: ${question} `;
    query += `\n\n Kontekst: ${context.join('\n')} `;

    return query;

}

