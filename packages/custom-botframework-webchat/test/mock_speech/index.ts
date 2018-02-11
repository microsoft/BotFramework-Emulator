type Action = () => void

type Func<T, TResult> = (item: T) => TResult;

interface ISpeechRecognizer {
    locale: string;
    isStreamingToService: boolean;
    referenceGrammarId: string; // unique identifier to send to the speech implementation to bias SR to this scenario

    onIntermediateResult: Func<string, void>;
    onFinalResult: Func<string, void>;
    onAudioStreamingToService: Action;
    onRecognitionFailed: Action;

    warmup(): void;
    startRecognizing(): void;
    stopRecognizing(): void;
    speechIsAvailable() : boolean;
}

interface ISpeechSynthesizer {
    speak(text: string, lang: string, onSpeakingStarted: Action, onspeakingFinished: Action): void;
    stopSpeaking(): void;
}

class MockSpeechRecognizer implements ISpeechRecognizer {
    locale: string = "en-US";
    isStreamingToService: boolean = false;
    referenceGrammarId: string = "mock";

    onIntermediateResult: Func<string, void> = null;
    onFinalResult: Func<string, void> = null;
    onAudioStreamingToService: Action = null;
    onRecognitionFailed: Action = null;

    warmup(): void { }
    startRecognizing(): void {
        // This will advance to Listening_Start state from Listening_Starting
        if (this.onAudioStreamingToService) {
            this.onAudioStreamingToService();
        }
    }
    stopRecognizing(): void { }
    speechIsAvailable(): boolean {
        return true;
    }
}

class MockSpeechSynthesizer implements ISpeechSynthesizer {
    speak(text: string, lang: string, onSpeakingStarted: Action, onspeakingFinished: Action): void { }
    stopSpeaking(): void { }
}