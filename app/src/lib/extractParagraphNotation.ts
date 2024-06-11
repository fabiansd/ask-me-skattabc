

export default function extractParagraphNotations(text: string): string {
    const regex = /§ \d+-\d+/g;
    
    const matches = text.match(regex);
    
    if (matches) {
        return matches.join(' ');
    } else {
        return '';
    }
}