import { AppState } from '../App';
import { LuisTraceInfo } from '../Models/LuisTraceInfo';
import { AppInfo } from '../Luis/AppInfo';
import { IntentInfo } from '../Luis/IntentInfo';
import { ButtonSelected } from '../Controls/ControlBar';

export default class MockState implements AppState {
  traceInfo: LuisTraceInfo = {
    luisModel: {
      ModelID: '6209a76f-e836-413b-ba92-a5772d1b2087',
      SubscriptionKey: '****'
    },
    luisResult: {
      query: 'hi',
      entities: []
    },
    recognizerResult: {
      Entities: {
        '$instance': {
          'Airline': [
            {
              'endIndex': 24,
              'score': null,
              'startIndex': 20,
              'text': 'delta'
            }
          ]
        },
        'Airline': [
          [
            'Delta'
          ]
        ]
      },
      Intents: {
        Greeting: 0.99,
        Travel: 0.01
      },
      Text: 'hi'
    },
    luisOptions: {}
  };
  appInfo: AppInfo = {
    activeVersion: '0.1',
    authorized: true,
    name: 'Contoso App',
    appId: '6209a76f-e836-413b-ba92-a5772d1b2087',
    endpoints: {}
  };
  pendingPublish: false;
  pendingTrain: false;
  controlBarButtonSelected: ButtonSelected.RawResponse;
  intentInfo: IntentInfo[] = [
    {
      id: '6209a76f-e836-413b-ba92-a5772d1b2000',
      name: 'Greeting'
    },
    {
      id: '6209a76f-e836-413b-ba92-a5772d1b2001',
      name: 'Cancel'
    },
    {
      id: '6209a76f-e836-413b-ba92-a5772d1b2002',
      name: 'Travel'
    }
  ];
}