import { IEndpointService, ServiceType, uniqueId } from '@bfemulator/sdk-shared';

export class EndpointService implements IEndpointService {
  public readonly type = ServiceType.Endpoint;

  public appId = '';
  public appPassword = '';
  public endpoint = '';
  public id = uniqueId();
  public name = '';

  constructor(source: Partial<IEndpointService>) {
    Object.assign(this, source);
  }

  public toJSON(): Partial<IEndpointService> {
    let { appId, id, appPassword, endpoint, name, type } = this;
    if (!id) {
      id = appId;
    }
    return { appId, id, type, appPassword, endpoint, name };
  }
}
