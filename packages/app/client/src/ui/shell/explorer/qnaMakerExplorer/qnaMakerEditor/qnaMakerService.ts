import { IQnAService, ServiceType } from '@bfemulator/sdk-shared';

export class QnaMakerService implements IQnAService {
  public readonly type = ServiceType.QnA;
  public id = '';
  public kbid = '';
  public name = '';
  public subscriptionKey = '';

  constructor(source:Partial<IQnAService> = {}) {
    Object.assign(this, source);
  }

  public toJSON():Partial<IQnAService> {
    let {kbid, id, name, subscriptionKey, type} = this;
    if (!id) {
      id = kbid;
    }
    return {kbid, name, type, subscriptionKey, id};
  }
}
