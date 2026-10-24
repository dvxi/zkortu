import { describe, expect, it } from "vitest";
import { toTournament, type SanityTournament } from "@/lib/sanity";

const base: SanityTournament = {
  _id: "tour-test",
  name: "Test Open",
  location: "Warszawa",
  country: "Polska",
  countryCode: "PL",
  surface: "Clay",
  category: "ATP 250",
  startDate: "2026-10-20",
  endDate: "2026-10-26",
};

describe("toTournament", () => {
  it("computes status from dates", () => {
    expect(toTournament(base, "2026-10-24").status).toBe("live");
    expect(toTournament(base, "2026-10-19").status).toBe("upcoming");
    expect(toTournament(base, "2026-10-27").status).toBe("completed");
  });

  it("derives the flag from countryCode or a legacy emoji flag", () => {
    expect(toTournament(base, "2026-10-24").flag).toBe("🇵🇱");
    expect(toTournament({ ...base, countryCode: undefined, flag: "🇫🇷" }, "2026-10-24")).toMatchObject({ flag: "🇫🇷", countryCode: "FR" });
  });

  it("falls back to safe values for unknown surfaces/categories", () => {
    const t = toTournament({ ...base, surface: "Carpet" as never, category: "Exhibition" as never }, "2026-10-24");
    expect(t.surface).toBe("Hard");
    expect(t.category).toBe("Inne");
    expect(t.imageUrl).toBeNull();
  });
});
