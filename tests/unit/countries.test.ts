import { describe, expect, it } from "vitest";
import { codeFromFlag, countryFromCode, countryFromName, countryNamePl, flagFromCode } from "@/lib/countries";

describe("countries", () => {
  it("maps API country names to ISO codes, flags and Polish names", () => {
    expect(countryFromName("France")).toMatchObject({ code: "FR", flag: "🇫🇷", namePl: "Francja" });
    expect(countryFromName("Serbia")).toMatchObject({ code: "RS", flag: "🇷🇸" });
    expect(countryFromName("Russia")).toMatchObject({ code: "RU" });
    expect(countryFromName("Germany")).toMatchObject({ code: "DE" });
    expect(countryFromName("USA")).toMatchObject({ code: "US", namePl: "USA" });
    expect(countryFromName("United Kingdom")).toMatchObject({ code: "GB", namePl: "Wielka Brytania" });
    expect(countryFromName("Czech Republic")).toMatchObject({ code: "CZ", namePl: "Czechy" });
    expect(countryFromName("Hong Kong")).toMatchObject({ code: "HK", namePl: "Hongkong" });
    expect(countryFromName("Taiwan")).toMatchObject({ code: "TW" });
    expect(countryFromName("Bosnia and Herzegovina")).toMatchObject({ code: "BA" });
    expect(countryFromName("New Caledonia")).toMatchObject({ code: "NC" });
  });

  it("does not let deprecated ISO codes hijack modern countries (FX, YU, SU)", () => {
    for (const [name, code] of [["France", "FR"], ["Serbia", "RS"], ["Russia", "RU"], ["Germany", "DE"]] as const) {
      expect(countryFromName(name).code).toBe(code);
    }
  });

  it("handles the client's reported countries: Peru, Paraguay, Hong Kong, Slovenia, Thailand, New Zealand, Armenia, Turkey", () => {
    for (const name of ["Peru", "Paraguay", "Hong Kong", "Slovenia", "Thailand", "New Zealand", "Armenia", "Turkey"]) {
      const c = countryFromName(name);
      expect(c.code, name).toMatch(/^[A-Z]{2}$/);
      expect(c.flag, name).not.toBe("🏳️");
    }
  });

  it("treats neutral athletes as unaffiliated", () => {
    expect(countryFromName("World")).toMatchObject({ code: null, namePl: "Niezrzeszony" });
    expect(countryFromName("")).toMatchObject({ code: null });
  });

  it("round-trips flags and codes", () => {
    expect(flagFromCode("PL")).toBe("🇵🇱");
    expect(codeFromFlag("🇵🇱")).toBe("PL");
    expect(codeFromFlag("🏆")).toBeNull();
    expect(countryFromCode("pl")).toMatchObject({ code: "PL", flag: "🇵🇱", namePl: "Polska" });
    expect(countryNamePl("XK")).toBe("Kosowo");
  });
});
