import { Speech } from './SpeechModule';

export class SpeechOptions {
    public speechRecognizer: Speech.ISpeechRecognizer;
    public speechSynthesizer: Speech.ISpeechSynthesizer;
}