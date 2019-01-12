export interface LuisModel {
  id: string;
  name: string;
  description: string;
  culture: string;
  usageScenario: string;
  domain: string;
  versionsCount: number;
  createdDateTime: string;
  endpoints: {
    PRODUCTION: any;
    STAGING: any;
  };
  endpointHitsCount: number;
  activeVersion: string;
  ownerEmail: string;
  region: LuisRegion;
}

export declare type LuisRegion = "westus" | "westeurope" | "australiaeast";
