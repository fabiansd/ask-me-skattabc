

export default function generatePromt(question: string, context: string[]) {

    let query = 'Du er en ekspert på norske skattelover og skal svare så nyaktig og konkret som mulig på spørsmål som anngår skatteabc. referer til paragrafene du bruker i konteksten og pek hvor man kan lete i skatteabc-dokumentet for å lese videre. Strukturer dette på en lesbar måte som tolkes av html';

    query += `\n\n Spørsmål: ${question} `;
    query += `\n\n Kontekst: ${context.join('\n')} `;

    return query;

}

