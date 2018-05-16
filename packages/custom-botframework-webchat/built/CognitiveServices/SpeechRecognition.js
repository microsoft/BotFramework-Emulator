"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const konsole = require("../Konsole");
const microsoft_speech_browser_sdk_1 = require("microsoft-speech-browser-sdk");
class SpeechRecognizer {
    constructor(properties = {}) {
        this.audioStreamStartInitiated = false;
        this.isStreamingToService = false;
        this.onIntermediateResult = null;
        this.onFinalResult = null;
        this.onAudioStreamingToService = null;
        this.onRecognitionFailed = null;
        this.locale = null;
        this.actualRecognizer = null;
        this.properties = properties;
        const recognitionMode = microsoft_speech_browser_sdk_1.RecognitionMode.Interactive;
        const format = microsoft_speech_browser_sdk_1.SpeechResultFormat.Simple;
        const locale = properties.locale || 'en-US';
        let recognizerConfig = new microsoft_speech_browser_sdk_1.RecognizerConfig(new microsoft_speech_browser_sdk_1.SpeechConfig(new microsoft_speech_browser_sdk_1.Context(new microsoft_speech_browser_sdk_1.OS(navigator.userAgent, "Browser", null), new microsoft_speech_browser_sdk_1.Device("WebChat", "WebChat", "1.0.00000"))), recognitionMode, // Speech.RecognitionMode.Interactive  (Options - Interactive/Conversation/Dictation>)
        locale, // Supported laguages are specific to each recognition mode. Refer to docs.
        format); // Speech.SpeechResultFormat.Simple (Options - Simple/Detailed)
        let authentication;
        if (properties.subscriptionKey) {
            authentication = new microsoft_speech_browser_sdk_1.CognitiveSubscriptionKeyAuthentication(properties.subscriptionKey);
        }
        else if (properties.fetchCallback && properties.fetchOnExpiryCallback) {
            authentication = new microsoft_speech_browser_sdk_1.CognitiveTokenAuthentication((authFetchEventId) => {
                let d = new microsoft_speech_browser_sdk_1.Deferred();
                this.properties.fetchCallback(authFetchEventId).then(value => d.Resolve(value), err => d.Reject(err));
                return d.Promise();
            }, (authFetchEventId) => {
                let d = new microsoft_speech_browser_sdk_1.Deferred();
                this.properties.fetchOnExpiryCallback(authFetchEventId).then(value => d.Resolve(value), err => d.Reject(err));
                return d.Promise();
            });
        }
        else {
            throw 'Error: The CognitiveServicesSpeechRecognizer requires either a subscriptionKey or a fetchCallback and fetchOnExpiryCallback.';
        }
        if (window.navigator.getUserMedia) {
            this.actualRecognizer = microsoft_speech_browser_sdk_1.CreateRecognizer(recognizerConfig, authentication);
        }
        else {
            console.error("This browser does not support speech recognition");
        }
    }
    warmup() {
    }
    startRecognizing() {
        if (!this.actualRecognizer) {
            this.log('ERROR: no recognizer?');
            return;
        }
        let eventhandler = (event) => {
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
                        this.onAudioStreamingToService();
                    }
                    this.isStreamingToService = true;
                    break;
                case 'SpeechHypothesisEvent':
                    let hypothesisEvent = event;
                    this.log('Hypothesis Result: ' + hypothesisEvent.Result.Text);
                    if (this.onIntermediateResult) {
                        this.onIntermediateResult(hypothesisEvent.Result.Text);
                    }
                    break;
                case 'SpeechSimplePhraseEvent':
                    let simplePhraseEvent = event;
                    if (microsoft_speech_browser_sdk_1.RecognitionStatus[simplePhraseEvent.Result.RecognitionStatus] === microsoft_speech_browser_sdk_1.RecognitionStatus.Success) {
                        if (this.onFinalResult) {
                            this.onFinalResult(simplePhraseEvent.Result.DisplayText);
                        }
                    }
                    else {
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
        };
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
    speechIsAvailable() {
        return this.actualRecognizer != null;
    }
    stopRecognizing() {
        if (this.actualRecognizer != null) {
            this.actualRecognizer.AudioSource.TurnOff();
        }
        this.isStreamingToService = false;
    }
    log(message) {
        konsole.log('CognitiveServicesSpeechRecognizer: ' + message);
    }
}
exports.SpeechRecognizer = SpeechRecognizer;
//# sourceMappingURL=SpeechRecognition.js.map