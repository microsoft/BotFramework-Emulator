import IBotEndpointOptions from './botEndpointOptions';

interface IBotEndpoint {
  botId: string;
  botUrl: string;
  msaAppId: string;
  msaPassword: string;
  use10Tokens?: boolean;
}

export default IBotEndpoint;
