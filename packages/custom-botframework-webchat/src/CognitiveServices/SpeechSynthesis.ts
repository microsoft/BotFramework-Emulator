import { Speech, Action } from '../SpeechModule'
import * as konsole from '../Konsole';

export interface ICognitiveServicesSpeechSynthesisProperties {
    subscriptionKey?: string,
    gender?: SynthesisGender,
    voiceName?: string,
    fetchCallback?: (authFetchEventId: string) => Promise<string>,
    fetchOnExpiryCallback?: (authFetchEventId: string) => Promise<string>
}

export enum SynthesisGender { Male, Female };

interface SpeakRequest {
    isReadyToPlay: boolean,
    data: ArrayBuffer,
    text: string,
    locale: string,
    onSpeakingStarted: Action,
    onSpeakingFinished: Action,
}

interface HttpHeader {
    name: string,
    value: string
}

export class SpeechSynthesizer implements Speech.ISpeechSynthesizer {
    private _requestQueue: SpeakRequest[] = null;
    private _isPlaying: boolean = false;
    private _audioElement: AudioContext;
    private _helper: CognitiveServicesHelper;
    private _properties: ICognitiveServicesSpeechSynthesisProperties;

    constructor(properties: ICognitiveServicesSpeechSynthesisProperties) {
        this._helper = new CognitiveServicesHelper(properties);
        this._properties = properties;
        this._requestQueue = new Array();
    }

    speak(text: string, lang: string, onSpeakingStarted: Action = null, onSpeakingFinished: Action = null): void {
        this._requestQueue.push(
            {
                isReadyToPlay: false,
                data: null,
                text: text,
                locale: lang,
                onSpeakingStarted: onSpeakingStarted,
                onSpeakingFinished: onSpeakingFinished
            }
        );
        this.getSpeechData().then(() => {
            this.playAudio();
        });
    }

    stopSpeaking(): void {
        if (this._isPlaying) {
            this._requestQueue = [];
            this._isPlaying = false;
            if (this._audioElement && this._audioElement.state !== "closed") {
                this._audioElement.close();
            }
        }
    }

    private playAudio() {
        if (this._requestQueue.length == 0) {
            return;
        }
        const top = this._requestQueue[0];
        if (!top) {
            return;
        }
        if (!top.isReadyToPlay) {
            window.setTimeout(() => this.playAudio(), 100);
            return;
        }
        if (!this._isPlaying) {
            this._isPlaying = true;
            if (!this._audioElement || this._audioElement.state === "closed") {
                this._audioElement = new AudioContext();
            }
            this._audioElement.decodeAudioData(top.data, (buffer) => {
                const source = this._audioElement.createBufferSource();
                source.buffer = buffer;
                source.connect(this._audioElement.destination);
                if (top.onSpeakingStarted) {
                    top.onSpeakingStarted();
                }
                source.start(0);
                source.onended = (event) => {
                    this._isPlaying = false;
                    if (top.onSpeakingFinished) {
                        top.onSpeakingFinished();
                    }
                    this._requestQueue = this._requestQueue.slice(1, this._requestQueue.length);
                    if (this._requestQueue.length > 0) {
                        this.playAudio();
                    }
                }
            }, (ex) => {
                this.log(ex.message);
                this._isPlaying = false;
                this._requestQueue = this._requestQueue.slice(1, this._requestQueue.length);
                if (this._requestQueue.length > 0) {
                    this.playAudio();
                }
            });
        }
    }

    private getSpeechData(): Promise<any> {
        if (this._requestQueue.length == 0) {
            return;
        }
        const latest = this._requestQueue[this._requestQueue.length - 1];
        return this._helper.fetchSpeechData(latest.text, latest.locale, this._properties).then((result) => {
            latest.data = result;
            latest.isReadyToPlay = true;
        }, (ex) => {
            // Failed to get the speech data, ignore this item
            this.log(ex);
            this._requestQueue = this._requestQueue.slice(0, this._requestQueue.length - 1);
        });
    }

    private log(message: string) {
        konsole.log('CognitiveServicesSpeechSynthesis: ' + message);
    }
}

class CognitiveServicesHelper {
    private readonly _tokenURL = "https://api.cognitive.microsoft.com/sts/v1.0/issueToken";
    private readonly _synthesisURL = "https://speech.platform.bing.com/synthesize";
    private readonly _outputFormat = "riff-16khz-16bit-mono-pcm";
    private _tokenCallback: (id: string) => Promise<string>;
    private _tokenExpiredCallback: (id: string) => Promise<string>;
    private _lastTokenTime: number;

    constructor(props: ICognitiveServicesSpeechSynthesisProperties) {
        if (props.subscriptionKey) {
            this._tokenCallback = (id: string) => this.fetchSpeechToken(id);
            this._tokenExpiredCallback = (id: string) => this.fetchSpeechToken(id);
        }
        else if (props.fetchCallback && props.fetchOnExpiryCallback) {
            this._tokenCallback = props.fetchCallback;
            this._tokenExpiredCallback = props.fetchOnExpiryCallback;
        }
        else {
            throw 'Error: The CognitiveServicesSpeechSynthesis requires either a subscriptionKey or a fetchCallback and a fetchOnExpiryCallback.';
        }
    }

    public fetchSpeechData(text: string, locale: string, synthesisProperties: ICognitiveServicesSpeechSynthesisProperties): Promise<any> {
        const SSML = this.makeSSML(text, locale, synthesisProperties);
        const cbAfterToken = (token: string) => {
            this._lastTokenTime = Date.now();

            const optionalHeaders = [{ name: "Content-type", value: 'application/ssml+xml' },
            { name: "X-Microsoft-OutputFormat", value: this._outputFormat },
            { name: "Authorization", value: token }];

            return this.makeHttpCall("POST", this._synthesisURL, true, optionalHeaders, SSML);
        };

        if (Date.now() - this._lastTokenTime > 500000) {
            return this._tokenExpiredCallback(synthesisProperties.subscriptionKey).then(token => cbAfterToken(token));
        }
        else {
            return this._tokenCallback(synthesisProperties.subscriptionKey).then(token => cbAfterToken(token));
        }
    }

    private makeSSML(text: string, locale: string, synthesisProperties: ICognitiveServicesSpeechSynthesisProperties): string {
        if (text.indexOf("<speak") === 0) {
            return this.processSSML(text, synthesisProperties);
        }
        else {
            let ssml = "<speak version='1.0' xml:lang='" + locale + "'><voice xml:lang='" + locale + "' xml:gender='" + (synthesisProperties && synthesisProperties.gender ? SynthesisGender[synthesisProperties.gender] : "Female") + "' name='";
            if (synthesisProperties.voiceName) {
                ssml += synthesisProperties.voiceName;
            }
            else if (synthesisProperties.gender !== null && synthesisProperties.gender !== undefined) {
                ssml += this.fetchVoiceName(locale, synthesisProperties.gender);
            }
            else {
                ssml += this.fetchVoiceName(locale, SynthesisGender.Female);
            }
            return ssml + "'>" + this.encodeHTML(text) + "</voice></speak>";
        }
    }

    private processSSML(ssml: string, synthesisProperties: ICognitiveServicesSpeechSynthesisProperties): string {
        let processDone: boolean = false;

        // Extract locale info from ssml
        let locale: string;
        const match = /xml:lang=['"](\w\w-\w\w)['"]/.exec(ssml);
        if (match) {
            locale = match[1];
        }
        else {
            locale = "en-us";
        }

        // Extract gender from properties
        let gender = synthesisProperties && synthesisProperties.gender;
        if (gender === null || gender === undefined) {
            gender = SynthesisGender.Female;
        }
        const parser = new DOMParser();
        const dom = parser.parseFromString(ssml, 'text/xml');
        const nodes = dom.documentElement.childNodes;

        // Check if there is a voice node
        for (let i = 0; i < nodes.length; ++i) {
            if (nodes[i].nodeName === "voice") {
                // Check if there is a name attribute on voice element
                for (let j = 0; j < nodes[i].attributes.length; ++j) {
                    if (nodes[i].attributes[j].nodeName === "name") {
                        // Name attribute is found on voice element, use it directly
                        processDone = true;
                        break;
                    }

                    // Find the gender info from voice element, this will override what is in the properties
                    if (nodes[i].attributes[j].nodeName === "xml:gender") {
                        gender = nodes[i].attributes[j].nodeValue.toLowerCase() === 'male' ? SynthesisGender.Male : SynthesisGender.Female;
                    }
                }

                if (!processDone) {
                    // Otherwise add the name attribute based on locale and gender
                    const attribute = dom.createAttribute("name");
                    attribute.value = (synthesisProperties && synthesisProperties.voiceName) || this.fetchVoiceName(locale, gender);
                    nodes[i].attributes.setNamedItem(attribute);
                    processDone = true;
                }
                break;
            }
        }
        const serializer = new XMLSerializer();
        if (!processDone) {
            // There is no voice element, add one based on locale
            const voiceNode = dom.createElement("voice") as Node;
            const attribute = dom.createAttribute("name");
            attribute.value = (synthesisProperties && synthesisProperties.voiceName) || this.fetchVoiceName(locale, gender);
            voiceNode.attributes.setNamedItem(attribute);
            while (nodes.length > 0) {
                voiceNode.appendChild(dom.documentElement.firstChild);
            }
            dom.documentElement.appendChild(voiceNode);
        }
        return serializer.serializeToString(dom);
    }

    private encodeHTML(text: string): string {
        return text.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }

    private fetchSpeechToken(apiKey: string): Promise<string> {
        const optionalHeaders: HttpHeader[] = [{ name: "Ocp-Apim-Subscription-Key", value: apiKey },
        // required for Firefox otherwise a CORS error is raised
        { name: "Access-Control-Allow-Origin", value: "*" }];
        return this.makeHttpCall("POST", this._tokenURL, false, optionalHeaders).then((text) => {
            konsole.log("New authentication token generated.");
            return Promise.resolve(text);
        }, (ex) => {
            const reason = "Failed to generate authentication token";
            konsole.log(reason);
            return Promise.reject(reason);
        });
    }

    private makeHttpCall(actionType: string, url: string, isArrayBuffer: boolean = false, optionalHeaders?: HttpHeader[], dataToSend?: any): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            if (isArrayBuffer) {
                xhr.responseType = 'arraybuffer';
            }
            xhr.onreadystatechange = function (event) {
                if (xhr.readyState !== 4) return;
                if (xhr.status >= 200 && xhr.status < 300) {
                    if (!isArrayBuffer) {
                        resolve(xhr.responseText);
                    }
                    else {
                        resolve(xhr.response);
                    }
                } else {
                    reject(xhr.status);
                }
            };
            try {
                xhr.open(actionType, url, true);
                if (optionalHeaders) {
                    optionalHeaders.forEach((header) => {
                        xhr.setRequestHeader(header.name, header.value);
                    });
                }
                if (dataToSend) {
                    xhr.send(dataToSend);
                }
                else {
                    xhr.send();
                }
            }
            catch (ex) {
                reject(ex)
            }
        });
    }

    private fetchVoiceName(locale: string, gender: SynthesisGender): string {
        let voiceName: string;
        const localeLowerCase = locale.toLowerCase();
        if (gender === SynthesisGender.Female) {
            voiceName = this._femaleVoiceMap[localeLowerCase] || this._femaleVoiceMap["en-us"];
        }
        else {
            voiceName = this._maleVoiceMap[localeLowerCase] || this._maleVoiceMap["en-us"];
        }
        return voiceName;
    }

    // source: https://docs.microsoft.com/en-us/azure/cognitive-services/speech/api-reference-rest/bingvoiceoutput
    private readonly _femaleVoiceMap: { [key: string]: string } = {
        "ar-eg": "Microsoft Server Speech Text to Speech Voice (ar-EG, Hoda)",
        "ca-es": "Microsoft Server Speech Text to Speech Voice (ca-ES, HerenaRUS)",
        "da-dk": "Microsoft Server Speech Text to Speech Voice (da-DK, HelleRUS)",
        "de-de": "Microsoft Server Speech Text to Speech Voice (de-DE, Hedda)",
        "en-au": "Microsoft Server Speech Text to Speech Voice (en-AU, Catherine)",
        "en-ca": "Microsoft Server Speech Text to Speech Voice (en-CA, Linda)",
        "en-gb": "Microsoft Server Speech Text to Speech Voice (en-GB, Susan, Apollo)",
        "en-in": "Microsoft Server Speech Text to Speech Voice (en-IN, Heera, Apollo)",
        "en-us": "Microsoft Server Speech Text to Speech Voice (en-US, ZiraRUS)",
        "es-es": "Microsoft Server Speech Text to Speech Voice (es-ES, Laura, Apollo)",
        "es-mx": "Microsoft Server Speech Text to Speech Voice (es-MX, HildaRUS)",
        "fi-fi": "Microsoft Server Speech Text to Speech Voice (fi-FI, HeidiRUS)",
        "fr-ca": "Microsoft Server Speech Text to Speech Voice (fr-CA, Caroline)",
        "fr-fr": "Microsoft Server Speech Text to Speech Voice (fr-FR, Julie, Apollo)",
        "hi-in": "Microsoft Server Speech Text to Speech Voice (hi-IN, Kalpana, Apollo)",
        "ja-jp": "Microsoft Server Speech Text to Speech Voice (ja-JP, Ayumi, Apollo)",
        "ko-kr": "Microsoft Server Speech Text to Speech Voice (ko-KR, HeamiRUS)",
        "nb-no": "Microsoft Server Speech Text to Speech Voice (nb-NO, HuldaRUS)",
        "nl-nl": "Microsoft Server Speech Text to Speech Voice (nl-NL, HannaRUS)",
        "pl-pl": "Microsoft Server Speech Text to Speech Voice (pl-PL, PaulinaRUS)",
        "pt-br": "Microsoft Server Speech Text to Speech Voice (pt-BR, HeloisaRUS)",
        "pt-pt": "Microsoft Server Speech Text to Speech Voice (pt-PT, HeliaRUS)",
        "ru-ru": "Microsoft Server Speech Text to Speech Voice (ru-RU, Irina, Apollo)",
        "sv-se": "Microsoft Server Speech Text to Speech Voice (sv-SE, HedvigRUS)",
        "tr-tr": "Microsoft Server Speech Text to Speech Voice (tr-TR, SedaRUS)",
        "zh-cn": "Microsoft Server Speech Text to Speech Voice (zh-CN, HuihuiRUS)",
        "zh-hk": "Microsoft Server Speech Text to Speech Voice (zh-HK, Tracy, Apollo)",
        "zh-tw": "Microsoft Server Speech Text to Speech Voice (zh-TW, Yating, Apollo)"
    };

    private readonly _maleVoiceMap: { [key: string]: string } = {
        "ar-sa": "Microsoft Server Speech Text to Speech Voice (ar-SA, Naayf)",
        "cs-cz": "Microsoft Server Speech Text to Speech Voice (cs-CZ, Vit)",
        "de-at": "Microsoft Server Speech Text to Speech Voice (de-AT, Michael)",
        "de-ch": "Microsoft Server Speech Text to Speech Voice (de-CH, Karsten)",
        "de-de": "Microsoft Server Speech Text to Speech Voice (de-DE, Stefan, Apollo)",
        "el-gr": "Microsoft Server Speech Text to Speech Voice (el-GR, Stefanos)",
        "en-gb": "Microsoft Server Speech Text to Speech Voice (en-GB, George, Apollo)",
        "en-ie": "Microsoft Server Speech Text to Speech Voice (en-IE, Shaun)",
        "en-in": "Microsoft Server Speech Text to Speech Voice (en-IN, Ravi, Apollo)",
        "en-us": "Microsoft Server Speech Text to Speech Voice (en-US, BenjaminRUS)",
        "es-es": "Microsoft Server Speech Text to Speech Voice (es-ES, Pablo, Apollo)",
        "es-mx": "Microsoft Server Speech Text to Speech Voice (es-MX, Raul, Apollo)",
        "fr-ch": "Microsoft Server Speech Text to Speech Voice (fr-CH, Guillaume)",
        "fr-fr": "Microsoft Server Speech Text to Speech Voice (fr-FR, Paul, Apollo)",
        "he-il": "Microsoft Server Speech Text to Speech Voice (he-IL, Asaf)",
        "hi-in": "Microsoft Server Speech Text to Speech Voice (hi-IN, Hemant)",
        "hu-hu": "Microsoft Server Speech Text to Speech Voice (hu-HU, Szabolcs)",
        "id-id": "Microsoft Server Speech Text to Speech Voice (id-ID, Andika)",
        "it-it": "Microsoft Server Speech Text to Speech Voice (it-IT, Cosimo, Apollo)",
        "ja-jp": "Microsoft Server Speech Text to Speech Voice (ja-JP, Ichiro, Apollo)",
        "pt-br": "Microsoft Server Speech Text to Speech Voice (pt-BR, Daniel, Apollo)",
        "ro-ro": "Microsoft Server Speech Text to Speech Voice (ro-RO, Andrei)",
        "ru-ru": "Microsoft Server Speech Text to Speech Voice (ru-RU, Pavel, Apollo)",
        "sk-sk": "Microsoft Server Speech Text to Speech Voice (sk-SK, Filip)",
        "th-th": "Microsoft Server Speech Text to Speech Voice (th-TH, Pattara)",
        "zh-cn": "Microsoft Server Speech Text to Speech Voice (zh-CN, Kangkang, Apollo)",
        "zh-hk": "Microsoft Server Speech Text to Speech Voice (zh-HK, Danny, Apollo)",
        "zh-tw": "Microsoft Server Speech Text to Speech Voice (zh-TW, Zhiwei, Apollo)"
    };
}
