import { describe, expect, it } from "vitest";
import { formatBytes, formatClock, formatDate, formatInstant, isoDuration, spokenClock } from "@/lib/format";

describe("formatting", () => {
  it("writes dates the same way everywhere", () => {
    expect(formatDate("2026-11-20")).toBe("20 November 2026");
    expect(formatInstant("2027-01-19T15:33:50Z")).toBe("19 January 2027, 15:33 UTC");
  });

  it("writes file sizes the way Finder does", () => {
    expect(formatBytes(999)).toBe("999 B");
    expect(formatBytes(61_815_916)).toBe("61.8 MB");
    expect(formatBytes(1_500_000_000)).toBe("1.5 GB");
  });

  it("writes player times for the eye and for the ear", () => {
    expect(formatClock(0)).toBe("0:00");
    expect(formatClock(65.9)).toBe("1:05");
    expect(formatClock(Number.NaN)).toBe("0:00");
    expect(spokenClock(0)).toBe("0 seconds");
    expect(spokenClock(60)).toBe("1 minute");
    expect(spokenClock(125)).toBe("2 minutes 5 seconds");
  });

  it("writes ISO durations for structured data", () => {
    expect(isoDuration(60)).toBe("PT1M");
    expect(isoDuration(15)).toBe("PT15S");
    expect(isoDuration(75)).toBe("PT1M15S");
  });
});
