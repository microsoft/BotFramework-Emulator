import { AppState, PersistentAppState } from './App';
import { QnAMakerTraceInfo, QueryResult } from './Models/QnAMakerTraceInfo';
import { Answer } from './Models/QnAMakerModels';
import { ITraceActivity } from '@bfemulator/sdk-shared';

const TraceActivity = 'trace';
const QnaMakerTracerType = 'https://www.qnamaker.ai/schemas/trace';

interface QnaMakerModel {
  ModelID: string;
  SubscriptionKey: string;
}

export default class AppStateAdapter implements AppState {
  id: string;
  traceInfo: QnAMakerTraceInfo;
  subscriptionKey: string;
  persistentState: { [key: string]: PersistentAppState; };
  phrasings: string[];
  answers: Answer[];
  selectedAnswer: string;

  private static validate(obj: any): boolean {
    if (!obj) {
      return false;
    }
    const trace = obj as ITraceActivity;
    if (trace.type !== TraceActivity || trace.valueType !== QnaMakerTracerType) {
      return false;
    }
    if (!trace.value) {
      return false;
    }
    if (!AppStateAdapter.isAQnAMakerTraceInfo(trace.value)) {
      return false;
    }
    return true;
  }

  private static isAQnAMakerTraceInfo(obj: any): obj is QnAMakerTraceInfo {
    return obj.knowledgeBaseId !== undefined && obj.queryResults !== undefined;
  }

  constructor(obj: any) {
    if (!AppStateAdapter.validate(obj)) {
      return;
    }
    let traceActivity = (obj as ITraceActivity);
    this.traceInfo = traceActivity.value as QnAMakerTraceInfo;
    this.id = traceActivity.id || '';
    
    this.phrasings = ['How do I make coleslaw?'];
    this.subscriptionKey = 'get your own sub key you cant have mine';

    this.answers = this.traceInfo.queryResults.map((result: QueryResult) => ({
      text: result.answer,
      score: result.score,
      filters: null
    }));
    this.selectedAnswer = this.answers.length > 0 ? this.answers[0].text : '';
  }
}
