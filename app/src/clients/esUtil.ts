/* eslint-disable @typescript-eslint/no-explicit-any */
export function unwrapESResponse(response: any): string[] {
  return response.hits.hits.map((hit: any) => hit._source.content);
}
