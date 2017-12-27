export const ALIVE = 'SERVER/ALIVE';
export const PING = 'SERVER/PING';

export function ping() {
    return {
        type: '@@websocket/SEND',
        payload: {
            type: PING
        }
    };
}
