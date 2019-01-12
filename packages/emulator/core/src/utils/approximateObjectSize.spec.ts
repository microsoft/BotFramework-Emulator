import approximateObjectSize from "./approximateObjectSize";

describe("The approximateObjectSize util", () => {
  it("should calculate the approximate size of an object", () => {
    const size = approximateObjectSize(
      {
        prop1: "Hello world!",
        prop2: true,
        prop3: 1024,
        prop4: { prop6: "Hello back!" }
      },
      []
    );
    expect(size).toBe(58);
  });
});
