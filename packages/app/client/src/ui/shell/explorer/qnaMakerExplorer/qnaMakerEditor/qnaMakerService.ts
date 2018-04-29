import { IQnAService, ServiceType } from '@bfemulator/sdk-shared';

export class QnaMakerService implements IQnAService {
  public readonly type = ServiceType.QnA;
  public id = '';
  public name = '';
  public subscriptionKey = '';
  public kbId = '';
  public hostname = '';
  public endpointKey = '';

  constructor(source: Partial<IQnAService> = {}) {
    Object.assign(this, source);
  }

  public toJSON(): Partial<IQnAService> {
    let { type, id, name, subscriptionKey, kbId, hostname, endpointKey } = this;
    if (!id) {
      id = kbId;
    }
    return { type, id, name, subscriptionKey, kbId, hostname, endpointKey };
  }
}
