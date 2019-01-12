import { isLocalhostUrl } from "./isLocalhostUrl";

describe("The isLocalHostUrl util", () => {
  it('should return true for urls that contain "localhost"', () => {
    expect(isLocalhostUrl("http://localhost")).toBeTruthy();
  });

  it('should return true for urls that contain "127.0.0.1" ', () => {
    expect(isLocalhostUrl("http://127.0.0.1")).toBeTruthy();
  });
});
