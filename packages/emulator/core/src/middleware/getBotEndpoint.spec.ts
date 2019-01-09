import Endpoints from '../facility/endpointSet';
import getBotEndpoint from './getBotEndpoint';

describe('The getBotEndpoint', () => {
  const mockEmulator = {
    facilities: {}
  } as any;

  const mockNext = function () {
    return null;
  };
  mockNext.ifError = function () {
    return null;
  };

  beforeEach(() => {
    mockEmulator.facilities.endpoints = new Endpoints({});
  });

  it('should append the bot endpoint to the request when an Authorization header is present', () => {
    const mockToken = 'bm90aGluZw.eyJ1cG4iOiJnbGFzZ293QHNjb3RsYW5kLmNvbSJ9.7gjdshgfdsk98458205jfds9843fjds';
    const mockEndpoint = { id: mockToken } as any;
    const mockReq = {
      header: () => `Bearer ${ mockToken }`
    } as any;

    mockEmulator.facilities.endpoints.push(mockToken, mockEndpoint);

    const route = getBotEndpoint(mockEmulator as any);
    route(mockReq as any, {} as any, mockNext);

    expect(mockReq.botEndpoint.id).toBe(mockEndpoint.id);
  });

  it('should append the default endpoint when no auth header is preset', () => {
    const mockEndpoint = { id: '123' } as any;
    mockEmulator.facilities.endpoints.push('123', mockEndpoint);

    const mockReq = {
      header: () => ''
    } as any;

    const route = getBotEndpoint(mockEmulator as any);
    route(mockReq, {} as any, mockNext);

    expect(mockReq.botEndpoint.id).toBe(mockEndpoint.id);
  });
});
