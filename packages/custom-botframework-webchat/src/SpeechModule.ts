export type Action = () => void

export type Func<T, TResult> = (item: T) => TResult;

export module Speech {
    export interface ISpeechRecognizer {
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

    export interface ISpeechSynthesizer {
        speak(text: string, lang: string, onSpeakingStarted: Action, onspeakingFinished: Action): void;
        stopSpeaking(): void;
    }

    export class SpeechRecognizer {
        private static instance: ISpeechRecognizer = null;

        public static setSpeechRecognizer(recognizer: ISpeechRecognizer) {
            SpeechRecognizer.instance = recognizer;
        }

        public static startRecognizing(locale: string = 'en-US',
            onIntermediateResult: Func<string, void> = null,
            onFinalResult: Func<string, void> = null,
            onAudioStreamStarted: Action = null,
            onRecognitionFailed: Action = null) {

            if (!SpeechRecognizer.speechIsAvailable())
                return;

            if (locale && SpeechRecognizer.instance.locale !== locale) {
                SpeechRecognizer.instance.stopRecognizing();
                SpeechRecognizer.instance.locale = locale; // to do this could invalidate warmup.
            }

            if (SpeechRecognizer.alreadyRecognizing()) {
                SpeechRecognizer.stopRecognizing();
            }

            SpeechRecognizer.instance.onIntermediateResult = onIntermediateResult;
            SpeechRecognizer.instance.onFinalResult = onFinalResult;
            SpeechRecognizer.instance.onAudioStreamingToService = onAudioStreamStarted;
            SpeechRecognizer.instance.onRecognitionFailed = onRecognitionFailed;
            SpeechRecognizer.instance.startRecognizing();
        }

        public static stopRecognizing() {
            if (!SpeechRecognizer.speechIsAvailable())
                return;

            SpeechRecognizer.instance.stopRecognizing();
        }

        public static warmup() {
            if (!SpeechRecognizer.speechIsAvailable())
                return;

            SpeechRecognizer.instance.warmup();
        }

        public static speechIsAvailable() {
            return SpeechRecognizer.instance != null && SpeechRecognizer.instance.speechIsAvailable() ;
        }

        private static alreadyRecognizing() {
            return SpeechRecognizer.instance ? SpeechRecognizer.instance.isStreamingToService : false;
        }
    }

    export class SpeechSynthesizer {
        private static instance: ISpeechSynthesizer = null;

        public static setSpeechSynthesizer(speechSynthesizer: ISpeechSynthesizer) {
            SpeechSynthesizer.instance = speechSynthesizer;
        }

        public static speak(text: string, lang: string, onSpeakingStarted: Action = null, onSpeakingFinished: Action = null) {
            if (SpeechSynthesizer.instance == null)
                return;

            SpeechSynthesizer.instance.speak(text, lang, onSpeakingStarted, onSpeakingFinished);
        }

        public static stopSpeaking() {
            if (SpeechSynthesizer.instance == null)
                return;

            SpeechSynthesizer.instance.stopSpeaking();
        }
    }

    export class BrowserSpeechRecognizer implements ISpeechRecognizer {
        public locale: string = null;
        public isStreamingToService: boolean = false;
        public referenceGrammarId: string;

        public onIntermediateResult: Func<string, void> = null;
        public onFinalResult: Func<string, void> = null;
        public onAudioStreamingToService: Action = null;
        public onRecognitionFailed: Action = null;

        private recognizer: any = null;

        constructor() {
            if(!(<any>window).webkitSpeechRecognition) {
                console.error("This browser does not support speech recognition");
                return;
            }
            
            this.recognizer = new (<any>window).webkitSpeechRecognition();
            this.recognizer.lang = 'en-US';
            this.recognizer.interimResults = true;

            this.recognizer.onaudiostart = () => {
                if (this.onAudioStreamingToService) {
                    this.onAudioStreamingToService();
                }
            };

            this.recognizer.onresult = (srevent: any) => {
                if (srevent.results == null || srevent.length == 0) {
                    return;
                }

                const result = srevent.results[0];
                if (result.isFinal === true && this.onFinalResult != null) {
                    this.onFinalResult(result[0].transcript);
                } else if (result.isFinal === false && this.onIntermediateResult != null) {
                    let text = "";
                    for (let i = 0; i < srevent.results.length; ++i) {
                        text += srevent.results[i][0].transcript;
                    }
                    this.onIntermediateResult(text);
                }
            }

            this.recognizer.onerror = (err: any) => {
                if (this.onRecognitionFailed) {
                    this.onRecognitionFailed();
                }
                throw err;
            }
        }

        public speechIsAvailable(){
            return this.recognizer != null;
        }

        public warmup() {

        }

        public startRecognizing() {
            this.recognizer.start();
        }

        public stopRecognizing() {
            this.recognizer.stop();
        }
    }

    export class BrowserSpeechSynthesizer implements ISpeechSynthesizer {
        private lastOperation: SpeechSynthesisUtterance = null;
        private audioElement: HTMLAudioElement = null;
        private speakRequests: SpeakRequest[] = [];

        public speak(text: string, lang: string, onSpeakingStarted: Action = null, onSpeakingFinished: Action = null) {
            if (!('SpeechSynthesisUtterance' in window) || !text)
                return;

            if (this.audioElement === null) {
                const audio = document.createElement('audio');
                audio.id = 'player';
                audio.autoplay = true;

                this.audioElement = audio;
            }

            const chunks = new Array<any>();
            if (text[0] === '<') {
                if (text.indexOf('<speak') != 0)
                    text = '<speak>\n' + text + '\n</speak>\n';
                const parser = new DOMParser();
                const dom = parser.parseFromString(text, 'text/xml');
                const nodes = dom.documentElement.childNodes;
                this.processNodes(nodes, chunks);
            }
            else {
                chunks.push(text);
            }

            const onSpeakingFinishedWrapper = () => {
                if (onSpeakingFinished !== null)
                    onSpeakingFinished();

                // remove this from the queue since it's done:
                if (this.speakRequests.length) {
                    this.speakRequests[0].completed();
                    this.speakRequests.splice(0, 1);
                }

                // If there are other speak operations in the queue, process them
                if (this.speakRequests.length) {
                    this.playNextTTS(this.speakRequests[0], 0);
                }
            }

            const request = new SpeakRequest(chunks, lang, (speakOp) => { this.lastOperation = speakOp }, onSpeakingStarted, onSpeakingFinishedWrapper);

            if (this.speakRequests.length === 0) {
                this.speakRequests = [request];
                this.playNextTTS(this.speakRequests[0], 0);
            }
            else {
                this.speakRequests.push(request);
            }
        }

        public stopSpeaking() {
            if (('SpeechSynthesisUtterance' in window) === false)
                return;

            if (this.speakRequests.length) {
                if (this.audioElement)
                    this.audioElement.pause();

                this.speakRequests.forEach(req => {
                    req.abandon();
                });

                this.speakRequests = [];
                const ss = window.speechSynthesis;
                if (ss.speaking || ss.pending) {
                    if (this.lastOperation)
                        this.lastOperation.onend = null;
                    ss.cancel();
                }
            }
        };

        private playNextTTS(requestContainer: SpeakRequest, iCurrent: number) {
            // lang : string, onSpeakQueued: Func<SpeechSynthesisUtterance, void>, onSpeakStarted : Action, onFinishedSpeaking : Action

            const moveToNext = () => {
                this.playNextTTS(requestContainer, iCurrent + 1);
            };

            if (iCurrent < requestContainer.speakChunks.length) {
                const current = requestContainer.speakChunks[iCurrent];
                if (typeof current === 'number') {
                    setTimeout(moveToNext, current);
                } else {
                    if (current.indexOf('http') === 0) {
                        const audio = this.audioElement; // document.getElementById('player');
                        audio.src = current;
                        audio.onended = moveToNext;
                        audio.onerror = moveToNext;
                        audio.play();
                    } else {
                        const msg = new SpeechSynthesisUtterance();
                        // msg.voiceURI = 'native';
                        // msg.volume = 1; // 0 to 1
                        // msg.rate = 1; // 0.1 to 10
                        // msg.pitch = 2; //0 to 2
                        msg.text = current;
                        msg.lang = requestContainer.lang;
                        msg.onstart = iCurrent === 0 ? requestContainer.onSpeakingStarted : null
                        msg.onend = moveToNext;
                        msg.onerror = moveToNext;

                        if (requestContainer.onSpeakQueued)
                            requestContainer.onSpeakQueued(msg);

                        window.speechSynthesis.speak(msg);
                    }
                }
            } else {
                if (requestContainer.onSpeakingFinished)
                    requestContainer.onSpeakingFinished();
            }
        }

        // process SSML markup into an array of either 
        // * utterenance
        // * number which is delay in msg
        // * url which is an audio file 
        private processNodes(nodes: NodeList, output: any[]): void {
            for (let i = 0; i < nodes.length; i++) {
                const node = nodes[i];
                switch (node.nodeName) {
                    case 'p':
                        this.processNodes(node.childNodes, output);
                        output.push(250);
                        break;
                    case 'break':
                        if (node.attributes.getNamedItem('strength')) {
                            const strength = node.attributes.getNamedItem('strength').nodeValue;
                            if (strength === 'weak') {
                                // output.push(50);
                            } else if (strength === 'medium') {
                                output.push(50);
                            } else if (strength === 'strong') {
                                output.push(100);
                            } else if (strength === 'x-strong') {
                                output.push(250);
                            }
                        } else if (node.attributes.getNamedItem('time')) {
                            output.push(JSON.parse(node.attributes.getNamedItem('time').value));
                        }
                        break;
                    case 'audio':
                        if (node.attributes.getNamedItem('src')) {
                            output.push(node.attributes.getNamedItem('src').value);
                        }
                        break;
                    case 'say-as':
                    case 'prosody':  // ToDo: handle via msg.rate
                    case 'emphasis': // ToDo: can probably emulate via prosody + pitch 
                    case 'w':
                    case 'phoneme': //
                    case 'voice':
                        this.processNodes(node.childNodes, output);
                        break;
                    default:
                        // Todo: coalesce consecutive non numeric / non html entries.
                        output.push(node.nodeValue);
                        break;
                }
            }
        }
    }

    class SpeakRequest {
        private _onSpeakQueued: Func<SpeechSynthesisUtterance, void> = null;
        private _onSpeakingStarted: Action = null;
        private _onSpeakingFinished: Action = null;
        private _speakChunks: any[] = [];
        private _lang: string = null;

        public constructor(speakChunks: any[],
            lang: string,
            onSpeakQueued: Func<SpeechSynthesisUtterance, void> = null,
            onSpeakingStarted: Action = null,
            onSpeakingFinished: Action = null) {
            this._onSpeakQueued = onSpeakQueued;
            this._onSpeakingStarted = onSpeakingStarted;
            this._onSpeakingFinished = onSpeakingFinished;
            this._speakChunks = speakChunks
            this._lang = lang;
        }

        public abandon() {
            this._speakChunks = [];
        }

        public completed() {
            this._speakChunks = [];
        }

        get onSpeakQueued(): Func<SpeechSynthesisUtterance, void> { return this._onSpeakQueued; }
        get onSpeakingStarted(): Action { return this._onSpeakingStarted; }
        get onSpeakingFinished(): Action { return this._onSpeakingFinished; }
        get speakChunks(): any[] { return this._speakChunks; }
        get lang(): string { return this._lang; }
    }
}