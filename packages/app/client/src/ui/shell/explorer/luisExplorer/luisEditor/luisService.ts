import { ILuisService, ServiceType } from '@bfemulator/sdk-shared';

export class LuisService implements ILuisService {
  public readonly type = ServiceType.Luis;
  public appId = '';
  public authoringKey = '';
  public id = '';
  public name = '';
  public subscriptionKey = '';
  public version = '';

  constructor(source: Partial<ILuisService>) {
    Object.assign(this, source);
  }

  public toJSON(): Partial<ILuisService> {
    let { appId, authoringKey, id, name, subscriptionKey, type, version } = this;
    if (!id) {
      id = appId;
    }

    return { id, type, name, version, appId, authoringKey, subscriptionKey };
  }
}
