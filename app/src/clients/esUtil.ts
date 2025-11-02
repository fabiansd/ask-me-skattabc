interface ESHit {
  _source: {
    content: string;
  };
}

interface ESResponse {
  hits: {
    hits: ESHit[];
  };
}

export function unwrapESResponse(response: ESResponse): string[] {
  return response.hits.hits.map(hit => hit._source.content);
}
