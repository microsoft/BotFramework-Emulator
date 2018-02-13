import { Speech, Func, Action } from '../SpeechModule';
export interface ICognitiveServicesSpeechRecognizerProperties {
    locale?: string;
    subscriptionKey?: string;
    fetchCallback?: (authFetchEventId: string) => Promise<string>;
    fetchOnExpiryCallback?: (authFetchEventId: string) => Promise<string>;
}
export declare class SpeechRecognizer implements Speech.ISpeechRecognizer {
    audioStreamStartInitiated: boolean;
    isStreamingToService: boolean;
    onIntermediateResult: Func<string, void>;
    onFinalResult: Func<string, void>;
    onAudioStreamingToService: Action;
    onRecognitionFailed: Action;
    locale: string;
    referenceGrammarId: string;
    private actualRecognizer;
    private properties;
    constructor(properties?: ICognitiveServicesSpeechRecognizerProperties);
    warmup(): void;
    startRecognizing(): void;
    speechIsAvailable(): boolean;
    stopRecognizing(): void;
    private log(message);
}
