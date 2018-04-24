import { IAzureBotService, ServiceType } from '@bfemulator/sdk-shared';

export class AzureBotService implements IAzureBotService {

  public readonly type = ServiceType.AzureBotService;
  public name = '';
  public id = '';
  public appId = '';

  constructor(source: Partial<IAzureBotService> = {}) {
    Object.assign(this, source);
  }

  public toJSON(): Partial<IAzureBotService> {
    let { type, name, appId, id } = this;
    if (!id) {
      id = appId;
    }
    return { type, name, appId, id };
  }
}
