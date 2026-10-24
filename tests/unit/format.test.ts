import { describe, expect, it } from "vitest";
import { addDaysIso, formatDateRange, pluralPl, slugify, timeAgo } from "@/lib/format";

describe("format", () => {
  it("formats Polish date ranges", () => {
    expect(formatDateRange("2026-01-12", "2026-01-25")).toBe("12 – 25 stycznia 2026");
    expect(formatDateRange("2026-04-27", "2026-05-10")).toBe("27 kwietnia – 10 maja 2026");
    expect(formatDateRange("", "")).toBe("Termin do ogłoszenia");
  });

  it("adds days without timezone drift", () => {
    expect(addDaysIso("2026-10-24", -3)).toBe("2026-10-21");
    expect(addDaysIso("2026-12-30", 3)).toBe("2027-01-02");
  });

  it("slugifies Polish tags", () => {
    expect(slugify("Iga Świątek")).toBe("iga-swiatek");
    expect(slugify("Łódź Open 2026")).toBe("lodz-open-2026");
  });

  it("pluralises", () => {
    expect(pluralPl(1, "artykuł", "artykuły", "artykułów")).toBe("artykuł");
    expect(pluralPl(3, "artykuł", "artykuły", "artykułów")).toBe("artykuły");
    expect(pluralPl(12, "artykuł", "artykuły", "artykułów")).toBe("artykułów");
    expect(pluralPl(22, "artykuł", "artykuły", "artykułów")).toBe("artykuły");
  });

  it("gives relative time", () => {
    expect(timeAgo(new Date(Date.now() - 30_000).toISOString())).toBe("przed chwilą");
    expect(timeAgo(new Date(Date.now() - 5 * 60_000).toISOString())).toBe("5 min temu");
  });
});
