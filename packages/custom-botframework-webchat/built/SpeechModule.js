"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Speech;
(function (Speech) {
    class SpeechRecognizer {
        static setSpeechRecognizer(recognizer) {
            SpeechRecognizer.instance = recognizer;
        }
        static startRecognizing(locale = 'en-US', onIntermediateResult = null, onFinalResult = null, onAudioStreamStarted = null, onRecognitionFailed = null) {
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
        static stopRecognizing() {
            if (!SpeechRecognizer.speechIsAvailable())
                return;
            SpeechRecognizer.instance.stopRecognizing();
        }
        static warmup() {
            if (!SpeechRecognizer.speechIsAvailable())
                return;
            SpeechRecognizer.instance.warmup();
        }
        static speechIsAvailable() {
            return SpeechRecognizer.instance != null && SpeechRecognizer.instance.speechIsAvailable();
        }
        static alreadyRecognizing() {
            return SpeechRecognizer.instance ? SpeechRecognizer.instance.isStreamingToService : false;
        }
    }
    SpeechRecognizer.instance = null;
    Speech.SpeechRecognizer = SpeechRecognizer;
    class SpeechSynthesizer {
        static setSpeechSynthesizer(speechSynthesizer) {
            SpeechSynthesizer.instance = speechSynthesizer;
        }
        static speak(text, lang, onSpeakingStarted = null, onSpeakingFinished = null) {
            if (SpeechSynthesizer.instance == null)
                return;
            SpeechSynthesizer.instance.speak(text, lang, onSpeakingStarted, onSpeakingFinished);
        }
        static stopSpeaking() {
            if (SpeechSynthesizer.instance == null)
                return;
            SpeechSynthesizer.instance.stopSpeaking();
        }
    }
    SpeechSynthesizer.instance = null;
    Speech.SpeechSynthesizer = SpeechSynthesizer;
    class BrowserSpeechRecognizer {
        constructor() {
            this.locale = null;
            this.isStreamingToService = false;
            this.onIntermediateResult = null;
            this.onFinalResult = null;
            this.onAudioStreamingToService = null;
            this.onRecognitionFailed = null;
            this.recognizer = null;
            if (!window.webkitSpeechRecognition) {
                console.error("This browser does not support speech recognition");
                return;
            }
            this.recognizer = new window.webkitSpeechRecognition();
            this.recognizer.lang = 'en-US';
            this.recognizer.interimResults = true;
            this.recognizer.onaudiostart = () => {
                if (this.onAudioStreamingToService) {
                    this.onAudioStreamingToService();
                }
            };
            this.recognizer.onresult = (srevent) => {
                if (srevent.results == null || srevent.length == 0) {
                    return;
                }
                const result = srevent.results[0];
                if (result.isFinal === true && this.onFinalResult != null) {
                    this.onFinalResult(result[0].transcript);
                }
                else if (result.isFinal === false && this.onIntermediateResult != null) {
                    let text = "";
                    for (let i = 0; i < srevent.results.length; ++i) {
                        text += srevent.results[i][0].transcript;
                    }
                    this.onIntermediateResult(text);
                }
            };
            this.recognizer.onerror = (err) => {
                if (this.onRecognitionFailed) {
                    this.onRecognitionFailed();
                }
                throw err;
            };
        }
        speechIsAvailable() {
            return this.recognizer != null;
        }
        warmup() {
        }
        startRecognizing() {
            this.recognizer.start();
        }
        stopRecognizing() {
            this.recognizer.stop();
        }
    }
    Speech.BrowserSpeechRecognizer = BrowserSpeechRecognizer;
    class BrowserSpeechSynthesizer {
        constructor() {
            this.lastOperation = null;
            this.audioElement = null;
            this.speakRequests = [];
        }
        speak(text, lang, onSpeakingStarted = null, onSpeakingFinished = null) {
            if (!('SpeechSynthesisUtterance' in window) || !text)
                return;
            if (this.audioElement === null) {
                const audio = document.createElement('audio');
                audio.id = 'player';
                audio.autoplay = true;
                this.audioElement = audio;
            }
            const chunks = new Array();
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
            };
            const request = new SpeakRequest(chunks, lang, (speakOp) => { this.lastOperation = speakOp; }, onSpeakingStarted, onSpeakingFinishedWrapper);
            if (this.speakRequests.length === 0) {
                this.speakRequests = [request];
                this.playNextTTS(this.speakRequests[0], 0);
            }
            else {
                this.speakRequests.push(request);
            }
        }
        stopSpeaking() {
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
        }
        ;
        playNextTTS(requestContainer, iCurrent) {
            // lang : string, onSpeakQueued: Func<SpeechSynthesisUtterance, void>, onSpeakStarted : Action, onFinishedSpeaking : Action
            const moveToNext = () => {
                this.playNextTTS(requestContainer, iCurrent + 1);
            };
            if (iCurrent < requestContainer.speakChunks.length) {
                const current = requestContainer.speakChunks[iCurrent];
                if (typeof current === 'number') {
                    setTimeout(moveToNext, current);
                }
                else {
                    if (current.indexOf('http') === 0) {
                        const audio = this.audioElement; // document.getElementById('player');
                        audio.src = current;
                        audio.onended = moveToNext;
                        audio.onerror = moveToNext;
                        audio.play();
                    }
                    else {
                        const msg = new SpeechSynthesisUtterance();
                        // msg.voiceURI = 'native';
                        // msg.volume = 1; // 0 to 1
                        // msg.rate = 1; // 0.1 to 10
                        // msg.pitch = 2; //0 to 2
                        msg.text = current;
                        msg.lang = requestContainer.lang;
                        msg.onstart = iCurrent === 0 ? requestContainer.onSpeakingStarted : null;
                        msg.onend = moveToNext;
                        msg.onerror = moveToNext;
                        if (requestContainer.onSpeakQueued)
                            requestContainer.onSpeakQueued(msg);
                        window.speechSynthesis.speak(msg);
                    }
                }
            }
            else {
                if (requestContainer.onSpeakingFinished)
                    requestContainer.onSpeakingFinished();
            }
        }
        // process SSML markup into an array of either 
        // * utterenance
        // * number which is delay in msg
        // * url which is an audio file 
        processNodes(nodes, output) {
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
                            }
                            else if (strength === 'medium') {
                                output.push(50);
                            }
                            else if (strength === 'strong') {
                                output.push(100);
                            }
                            else if (strength === 'x-strong') {
                                output.push(250);
                            }
                        }
                        else if (node.attributes.getNamedItem('time')) {
                            output.push(JSON.parse(node.attributes.getNamedItem('time').value));
                        }
                        break;
                    case 'audio':
                        if (node.attributes.getNamedItem('src')) {
                            output.push(node.attributes.getNamedItem('src').value);
                        }
                        break;
                    case 'say-as':
                    case 'prosody': // ToDo: handle via msg.rate
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
    Speech.BrowserSpeechSynthesizer = BrowserSpeechSynthesizer;
    class SpeakRequest {
        constructor(speakChunks, lang, onSpeakQueued = null, onSpeakingStarted = null, onSpeakingFinished = null) {
            this._onSpeakQueued = null;
            this._onSpeakingStarted = null;
            this._onSpeakingFinished = null;
            this._speakChunks = [];
            this._lang = null;
            this._onSpeakQueued = onSpeakQueued;
            this._onSpeakingStarted = onSpeakingStarted;
            this._onSpeakingFinished = onSpeakingFinished;
            this._speakChunks = speakChunks;
            this._lang = lang;
        }
        abandon() {
            this._speakChunks = [];
        }
        completed() {
            this._speakChunks = [];
        }
        get onSpeakQueued() { return this._onSpeakQueued; }
        get onSpeakingStarted() { return this._onSpeakingStarted; }
        get onSpeakingFinished() { return this._onSpeakingFinished; }
        get speakChunks() { return this._speakChunks; }
        get lang() { return this._lang; }
    }
})(Speech = exports.Speech || (exports.Speech = {}));
//# sourceMappingURL=SpeechModule.js.map