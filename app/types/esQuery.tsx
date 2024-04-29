export interface EsQuery {
    index: string;
    body: {
      query: {
          match: {
              [key: string]: string;
          };
      };
  }
}

export interface EsMatchAllQuery {
    query: {
        match_all: {};
      };
      size: number;    
}
