import {Action, Func, Speech} from '../SpeechModule'
import * as konsole from '../Konsole';
import {
  CognitiveSubscriptionKeyAuthentication,
  CognitiveTokenAuthentication,
  Context,
  CreateRecognizer,
  Deferred,
  Device,
  OS,
  RecognitionMode,
  RecognitionStatus,
  RecognizerConfig,
  SpeechConfig,
  SpeechHypothesisEvent,
  SpeechResultFormat,
  SpeechSimplePhraseEvent
} from 'microsoft-speech-browser-sdk'

export interface ICognitiveServicesSpeechRecognizerProperties {
    locale?: string,
    subscriptionKey?: string,
    fetchCallback?: (authFetchEventId: string) => Promise<string>,
    fetchOnExpiryCallback?: (authFetchEventId: string) => Promise<string>
}

export class SpeechRecognizer implements Speech.ISpeechRecognizer {
    public audioStreamStartInitiated: boolean = false;
    public isStreamingToService: boolean = false;
    public onIntermediateResult: Func<string, void> = null;
    public onFinalResult: Func<string, void> = null;
    public onAudioStreamingToService: Action = null;
    public onRecognitionFailed: Action = null;
    public locale: string = null;
    public referenceGrammarId: string;

    private actualRecognizer: any = null;
    private properties: ICognitiveServicesSpeechRecognizerProperties;

    constructor(properties: ICognitiveServicesSpeechRecognizerProperties = {}) {
        this.properties = properties;
        const recognitionMode = RecognitionMode.Interactive;
        const format = SpeechResultFormat.Simple;
        const locale = properties.locale || 'en-US';

        let recognizerConfig = new RecognizerConfig(
            new SpeechConfig(
                new Context(
                    new OS(navigator.userAgent, "Browser", null),
                    new Device("WebChat", "WebChat", "1.0.00000"))),
            recognitionMode,        // Speech.RecognitionMode.Interactive  (Options - Interactive/Conversation/Dictation>)
            locale,                 // Supported laguages are specific to each recognition mode. Refer to docs.
            format
        );                // Speech.SpeechResultFormat.Simple (Options - Simple/Detailed)

        let authentication;
        if (properties.subscriptionKey) {
            authentication = new CognitiveSubscriptionKeyAuthentication(properties.subscriptionKey);
        } else if (properties.fetchCallback && properties.fetchOnExpiryCallback) {
            authentication = new CognitiveTokenAuthentication(
                (authFetchEventId: string) => {
                    let d = new Deferred<string>();
                    this.properties.fetchCallback(authFetchEventId).then(value => d.Resolve(value), err => d.Reject(err));
                    return d.Promise();
                },
                (authFetchEventId: string) => {
                    let d = new Deferred<string>();
                    this.properties.fetchOnExpiryCallback(authFetchEventId).then(value => d.Resolve(value), err => d.Reject(err));
                    return d.Promise();
                }
            );
        } else {
            throw 'Error: The CognitiveServicesSpeechRecognizer requires either a subscriptionKey or a fetchCallback and fetchOnExpiryCallback.';
        }

        if(window.navigator.getUserMedia){
            this.actualRecognizer = CreateRecognizer(recognizerConfig, authentication);
        }
        else{
            console.error("This browser does not support speech recognition");
        }
    }

    public warmup() {
    }

    public startRecognizing() {
        if (!this.actualRecognizer) {
            this.log('ERROR: no recognizer?');
            return;
        }
        let eventhandler = (event: any) => {
            this.log(event.Name);
            switch (event.Name) {
                case 'RecognitionTriggeredEvent':
                case 'ListeningStartedEvent':
                case 'SpeechStartDetectedEvent':
                case 'SpeechEndDetectedEvent':
                case 'SpeechDetailedPhraseEvent':
                case 'ConnectingToServiceEvent':
                    break;
                case 'RecognitionStartedEvent':
                    if (this.onAudioStreamingToService) {
                        this.onAudioStreamingToService()
                    }
                    this.isStreamingToService = true;
                    break;
                case 'SpeechHypothesisEvent':
                    let hypothesisEvent = event as SpeechHypothesisEvent;
                    this.log('Hypothesis Result: ' + hypothesisEvent.Result.Text);
                    if (this.onIntermediateResult) {
                        this.onIntermediateResult(hypothesisEvent.Result.Text);
                    }
                    break;
                case 'SpeechSimplePhraseEvent':
                    let simplePhraseEvent = event as SpeechSimplePhraseEvent;
                    if (RecognitionStatus[simplePhraseEvent.Result.RecognitionStatus] as any === RecognitionStatus.Success) {
                        if (this.onFinalResult) {
                            this.onFinalResult(simplePhraseEvent.Result.DisplayText);
                        }
                    } else {
                        if (this.onRecognitionFailed) {
                            this.onRecognitionFailed();
                        }
                        this.log('Recognition Status: ' + simplePhraseEvent.Result.RecognitionStatus.toString());
                    }
                    break;
                case 'RecognitionEndedEvent':
                    this.isStreamingToService = false;
                    break;
                default:
                    this.log(event.Name + " is unexpected");
            }
        }

        let speechContext = null;
        if (this.referenceGrammarId) {
            speechContext = JSON.stringify({
                dgi: {
                    Groups: [
                        {
                            Type: "Generic",
                            Hints: { ReferenceGrammar: this.referenceGrammarId }
                        }
                    ]
                }
            });
        }

        this.actualRecognizer.Recognize(eventhandler, speechContext);
    }

    public speechIsAvailable(){
        return this.actualRecognizer != null;
    }

    public stopRecognizing() {
        if (this.actualRecognizer != null) {
            this.actualRecognizer.AudioSource.TurnOff();
        }
        this.isStreamingToService = false;
    }

    private log(message: string) {
        konsole.log('CognitiveServicesSpeechRecognizer: ' + message);
    }
}
