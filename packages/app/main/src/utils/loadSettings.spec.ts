import { loadSettings } from "./loadSettings";

const mockSettings = {
  framework: {
    ngrokPath: "",
    bypassNgrokLocalhost: true,
    stateSizeLimit: 64,
    use10Tokens: false,
    useCodeValidation: false,
    localhost: "localhost",
    locale: ""
  },
  bots: [
    {
      botId: "1f5aeed9-a6d7-4757-b8c2-408c18c3e40c",
      botUrl: "http://localhost:3978/api/messages",
      msaAppId: "",
      msaPassword: "",
      locale: ""
    }
  ],
  windowState: {
    zoomLevel: 0,
    width: 1400,
    height: 920,
    left: 324,
    top: 116,
    theme: "Light",
    availableThemes: [
      {
        name: "Dark",
        href: "./themes/dark.css"
      },
      {
        name: "High-contrast",
        href: "./themes/high-contrast.css"
      },
      {
        name: "Light",
        href: "./themes/light.css"
      }
    ],
    displayId: 2779098405
  },
  users: {},
  azure: {}
};
jest.mock("fs-extra", () => ({
  statSync: () => ({ isFile: () => true }),
  readFileSync: () => "{}",
  writeFileSync: () => true
}));

jest.mock("./ensureStoragePath", () => ({
  ensureStoragePath: () => "filePath/"
}));

describe("the loadSettings utility", () => {
  it("should load the settings and provide a default user with a uuid", () => {
    const settings = loadSettings("pathToFile", mockSettings);
    expect(settings.users).not.toBeUndefined();
    expect(settings.users.currentUserId).not.toBe("default-user");
    expect(Object.keys(settings.users.usersById)[0]).toBe(
      settings.users.currentUserId
    );
  });

  it('should convert users with an ID of "default-user" to use a uuid instead', () => {
    mockSettings.users = {
      currentUserId: "default-user",
      usersById: {
        "default-user": {
          id: "default-user",
          name: "User"
        }
      }
    };
    const settings = loadSettings("pathToFile", mockSettings);
    expect(settings.users.currentUserId).not.toBe("default-user");
    expect(Object.keys(settings.users.usersById)[0]).toBe(
      settings.users.currentUserId
    );
  });
});
