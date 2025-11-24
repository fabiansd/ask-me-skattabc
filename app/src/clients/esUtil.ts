/* eslint-disable @typescript-eslint/no-explicit-any */

export interface ESDocument {
  _id: string;
  _index: string;
  content: string;
  department?: string;
  document_title?: string;
  article_number?: string;
  article_title?: string;
}

export function unwrapESResponse(response: any): string[] {
  return response.hits.hits.map((hit: any) => hit._source.content);
}

export function unwrapESResponseWithMetadata(response: any): ESDocument[] {
  return response.hits.hits.map((hit: any) => ({
    _id: hit._id,
    _index: hit._index,
    content: hit._source.content,
    department: hit._source.department,
    document_title: hit._source.document_title,
    article_number: hit._source.article_number,
    article_title: hit._source.article_title,
  }));
}
