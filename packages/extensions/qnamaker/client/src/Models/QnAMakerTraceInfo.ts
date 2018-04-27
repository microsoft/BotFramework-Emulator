
export interface QnAMakerTraceInfo {
  queryResults: QueryResult[];
  knowledgeBaseId: string;
  scoreThreshold: number;
  top: number;
  strictFilters: any;
  metadataBoost: any;
}

export interface QueryResult {
  questions: string[];
  answer: string;
  score: number;
  metadata: any;
  source: string;
  qnaId: number;
}