import { getThemes } from "./getThemes";

describe("The getThemes utility", () => {
  it("should retrieve the available themes from the themes directory", () => {
    const themes = getThemes();
    expect(themes).toEqual([
      { href: "./themes/dark.css", name: "Dark" },
      { href: "./themes/high-contrast.css", name: "High-contrast" },
      { href: "./themes/light.css", name: "Light" }
    ]);
  });
});
