

export interface queryHistory {
    history: queryEntry[]
}

export interface queryEntry {
    question: string,
    answer: string,
}