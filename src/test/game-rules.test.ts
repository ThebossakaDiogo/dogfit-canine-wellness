import { describe, expect, it } from "vitest";
import { dailyPlan, levelInfo, streak } from "@/lib/game";

describe("DogFit game rules", () => {
  it("level 2 starts at 100 XP and level 3 at 300 XP", () => {
    expect(levelInfo(99).level).toBe(1);
    expect(levelInfo(100).level).toBe(2);
    expect(levelInfo(300).level).toBe(3);
  });
  it("streak counts consecutive days and survives until today ends", () => {
    const today = new Date("2026-10-27T12:00:00Z");
    expect(streak(["2026-10-27", "2026-10-26", "2026-10-25"], today)).toBe(3);
    expect(streak(["2026-10-26", "2026-10-25"], today)).toBe(2);
    expect(streak(["2026-10-24"], today)).toBe(0);
  });
  it("10 kg neutered adult ≈ 630 kcal/day", () => {
    const p = dailyPlan({ weightKg: 10, stage: "adulto", neutered: true, activity: "normal", overweight: false, kcalPer100g: 130 });
    expect(p?.kcal).toBe(630);
    expect(p?.waterMl).toBe(550);
  });
  it("invalid weight gives no plan", () => {
    expect(dailyPlan({ weightKg: 0, stage: "adulto", neutered: true, activity: "normal", overweight: false, kcalPer100g: 130 })).toBeNull();
  });
});
