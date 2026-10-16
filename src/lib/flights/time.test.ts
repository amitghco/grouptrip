import { describe, expect, it } from "vitest";
import { localToUtc, utcOffsetMinutes, utcToLocal } from "./time";

describe("time zone helpers", () => {
  it("follows daylight saving changes", () => {
    expect(utcOffsetMinutes("Australia/Sydney", Date.UTC(2027, 3, 2))).toBe(660);
    expect(utcOffsetMinutes("Australia/Sydney", Date.UTC(2027, 3, 10))).toBe(600);
    expect(utcOffsetMinutes("America/New_York", Date.UTC(2027, 3, 10))).toBe(-240);
  });

  it("handles fractional and zero offsets", () => {
    expect(utcOffsetMinutes("Asia/Kathmandu", Date.UTC(2027, 3, 10))).toBe(345);
    expect(utcOffsetMinutes("Europe/London", Date.UTC(2027, 0, 10))).toBe(0);
  });

  it("converts between local and UTC times", () => {
    const utc = localToUtc("2027-04-10T09:00", "Australia/Sydney");
    expect(utc).toBe(Date.UTC(2027, 3, 9, 23, 0));
    expect(utcToLocal(utc, "Asia/Makassar")).toBe("2027-04-10T07:00");
    expect(utcToLocal(utc, "Australia/Sydney")).toBe("2027-04-10T09:00");
  });
});
