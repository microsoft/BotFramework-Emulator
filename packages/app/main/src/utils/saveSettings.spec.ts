import * as ensureStoragePathUtil from "./ensureStoragePath";
import * as fs from "fs";
import { saveSettings } from "./saveSettings";

jest.mock("./ensureStoragePath", () => ({
  ensureStoragePath: () => "filePath"
}));

jest.mock("fs", () => ({
  writeFileSync: () => true
}));

describe("The saveSetting util", () => {
  it("should write the specified settings file", () => {
    const ensureStoragePathSpy = jest
      .spyOn((ensureStoragePathUtil as any).default, "ensureStoragePath")
      .mockReturnValue("path");
    saveSettings<{}>("settings.json", {});
    expect(ensureStoragePathSpy).toHaveBeenCalled();
  });
});
