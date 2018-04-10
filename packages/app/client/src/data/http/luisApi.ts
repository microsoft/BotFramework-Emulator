export interface LuisModel {
  id: string,
  name: string,
  description: string,
  culture: string,
  usageScenario: string,
  domain: string,
  versionsCount: number,
  createdDateTime: string,
  endpoints: {
    PRODUCTION: any,
    STAGING: any
  },
  endpointHitsCount: number,
  activeVersion: string,
  ownerEmail: string
}

export class LuisApi {
  public static async getApplicationsList(luisAuthData: { key: string, region: string }, skip?: number, take?: number): Promise<LuisModel[]> {
    const { key: authoringKey, region } = luisAuthData;
    let url = `https://${region}.api.cognitive.microsoft.com/luis/api/v2.0/apps/`;
    const headers = new Headers({
      'Content-Accept': 'application/json',
      'Ocp-Apim-Subscription-Key': authoringKey
    });

    if (skip || take) {
      url += '?';
      if (!isNaN(+skip)) {
        url += `skip=${~~skip}`;
      }
      if (!isNaN(+take)) {
        url += !isNaN(+skip) ? `&take=${~~take}` : `take=${~~take}`;
      }
    }
    const response = await fetch(url, { headers, method: 'get' });
    return await response.json() as LuisModel[];
  }
}
