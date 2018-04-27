interface RecognizerResultIntent {
  score: number;
}

interface RecognizerResult {
  text: string;
  intents: { [key: string]: RecognizerResultIntent };
  entities: any;
}

export { RecognizerResult, RecognizerResultIntent };