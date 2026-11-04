import { describe, it, expect } from "vitest";
import { add } from "./add.js";

describe("add", () => {
  it("повинен правильно додавати два числа", () => {
    expect(add(2, 3)).toBe(5);
  });

  it("повинен працювати з від'ємними числами", () => {
    expect(add(-2, 5)).toBe(3);
  });
});
