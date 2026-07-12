import { formatEGP, formatNumber, formatRelativeTime, maskNationalId } from "../format";

describe("formatNumber", () => {
  it("uses Western Arabic numerals, not Eastern Arabic-Indic", () => {
    expect(formatNumber(5000)).toMatch(/5/);
    expect(formatNumber(5000)).not.toMatch(/[٠-٩]/);
  });
});

describe("formatEGP", () => {
  it("suffixes with ج.م", () => {
    expect(formatEGP(4500)).toContain("ج.م");
    expect(formatEGP(4500)).toMatch(/4/);
  });
});

describe("formatRelativeTime", () => {
  const now = new Date("2026-07-12T12:00:00Z");

  it("returns منذ لحظة under a minute", () => {
    expect(formatRelativeTime(new Date("2026-07-12T11:59:30Z"), now)).toBe("منذ لحظة");
  });

  it("returns منذ دقيقة at one minute", () => {
    expect(formatRelativeTime(new Date("2026-07-12T11:58:50Z"), now)).toBe("منذ دقيقة");
  });

  it("returns hour phrasing", () => {
    expect(formatRelativeTime(new Date("2026-07-12T10:59:00Z"), now)).toBe("منذ ساعة");
  });
});

describe("maskNationalId", () => {
  it("shows only the last 4 digits", () => {
    expect(maskNationalId("1234")).toBe("**********1234");
    expect(maskNationalId("1234")).not.toContain("29807");
  });
});
