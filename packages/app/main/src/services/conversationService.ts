export const headers = {
  "Content-Accept": "application/json"
};

export class ConversationService {
  public static addUser(
    serviceUrl: string,
    conversationId: string,
    name?: string,
    id?: string
  ) {
    const url = `${serviceUrl}/emulator/${conversationId}/users`;
    return fetch(url, {
      headers,
      method: "POST",
      body: JSON.stringify([{ name, id }])
    });
  }

  public static removeUser(
    serviceUrl: string,
    conversationId: string,
    id: string
  ) {
    const url = `${serviceUrl}/emulator/${conversationId}/users`;
    return fetch(url, {
      headers,
      method: "DELETE",
      body: JSON.stringify([{ id }])
    });
  }

  public static removeRandomUser(serviceUrl: string, conversationId: string) {
    const url = `${serviceUrl}/emulator/${conversationId}/users`;
    return fetch(url, {
      headers,
      method: "DELETE"
    });
  }

  public static botContactAdded(serviceUrl: string, conversationId: string) {
    const url = `${serviceUrl}/emulator/${conversationId}/contacts`;
    return fetch(url, {
      headers,
      method: "POST"
    });
  }

  public static botContactRemoved(serviceUrl: string, conversationId: string) {
    const url = `${serviceUrl}/emulator/${conversationId}/contacts`;
    return fetch(url, {
      headers,
      method: "DELETE"
    });
  }

  public static typing(serviceUrl: string, conversationId: string) {
    const url = `${serviceUrl}/emulator/${conversationId}/typing`;
    return fetch(url, {
      headers,
      method: "POST"
    });
  }

  public static ping(serviceUrl: string, conversationId: string) {
    const url = `${serviceUrl}/emulator/${conversationId}/ping`;
    return fetch(url, {
      headers,
      method: "POST"
    });
  }

  public static deleteUserData(serviceUrl: string, conversationId: string) {
    const url = `${serviceUrl}/emulator/${conversationId}/userdata`;
    return fetch(url, {
      headers,
      method: "DELETE"
    });
  }
}
