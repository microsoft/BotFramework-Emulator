import { IMessageActivity } from '@bfemulator/sdk-shared';

export interface QnAMakerTraceInfo {
  message: IMessageActivity;
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