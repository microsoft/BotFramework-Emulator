import { SettingsImpl } from "./serverSettingsTypes";

describe("The SettingsImpl", () => {
  it("should not enumerate the armToken property", () => {
    const settings = new SettingsImpl({
      azure: { armToken: "a valid arm token" }
    });
    expect(JSON.stringify(settings)).toBe(JSON.stringify({ azure: {} }));
    expect(JSON.stringify(settings.toJSON())).toBe(
      JSON.stringify({ azure: {} })
    );
  });
});
