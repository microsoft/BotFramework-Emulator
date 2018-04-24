import { IDispatchService, ServiceType } from '@bfemulator/sdk-shared';

export class DispatchService implements IDispatchService {
  public readonly type = ServiceType.Dispatch;
  public appId = '';
  public authoringKey = '';
  public id = '';
  public name = '';
  public serviceIds: string[] = [];
  public subscriptionKey = '';
  public version = '';

  constructor(source: Partial<IDispatchService> = {}) {
    Object.assign(this, source);
  }

  public toJSON(): Partial<IDispatchService> {
    let { appId, id, authoringKey, name, serviceIds, subscriptionKey, type, version } = this;
    if (!id) {
      id = appId;
    }
    return { appId, id, authoringKey, name, serviceIds, subscriptionKey, type, version };
  }
}
