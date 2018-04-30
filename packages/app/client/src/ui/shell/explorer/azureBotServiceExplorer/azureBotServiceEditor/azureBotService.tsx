import { IAzureBotService, ServiceType } from '@bfemulator/sdk-shared';

export class AzureBotService implements IAzureBotService {
  public readonly type = ServiceType.AzureBotService;

  public name = '';
  public id = '';
  public tenantId = '';
  public subscriptionId = '';
  public resourceGroup = '';

  constructor(source: Partial<IAzureBotService> = {}) {
    Object.assign(this, source);
  }

  public toJSON(): Partial<IAzureBotService> {
    let { type, name, id, tenantId, subscriptionId, resourceGroup } = this;
    return { type, name, id, tenantId, subscriptionId, resourceGroup };
  }
}
