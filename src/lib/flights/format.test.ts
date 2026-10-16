import { describe, expect, it } from "vitest";
import { formatPassengers } from "./format";

describe("formatPassengers", () => {
  it("describes adults, children with ages and infants", () => {
    expect(formatPassengers({ adults: 1, childAges: [], infants: 0 })).toBe("1 adult");
    expect(formatPassengers({ adults: 2, childAges: [7], infants: 0 })).toBe("2 adults, 1 child (age 7)");
    expect(formatPassengers({ adults: 2, childAges: [4, 9], infants: 1 })).toBe(
      "2 adults, 2 children (ages 4, 9), 1 infant",
    );
  });
});
