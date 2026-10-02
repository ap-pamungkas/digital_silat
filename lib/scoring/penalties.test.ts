import { describe, expect, it } from "vitest";
import {
  PENALTY_OPTIONS,
  PENALTY_POINTS,
  penaltyLabel,
  penaltyPointsForType,
} from "@/lib/scoring/penalties";
import { PENALTY_TYPES } from "@/lib/types";

describe("PENALTY_POINTS", () => {
  it("is defined for every penalty type in the domain enum", () => {
    for (const type of PENALTY_TYPES) {
      expect(PENALTY_POINTS[type]).toBeGreaterThanOrEqual(0);
    }
    expect(Object.keys(PENALTY_POINTS).sort()).toEqual([...PENALTY_TYPES].sort());
  });

  it("keeps the escalation increasing up to disqualification", () => {
    expect(PENALTY_POINTS.TEGURAN_1).toBeLessThan(PENALTY_POINTS.TEGURAN_2);
    expect(PENALTY_POINTS.TEGURAN_2).toBeLessThan(PENALTY_POINTS.PERINGATAN_1);
    expect(PENALTY_POINTS.PERINGATAN_1).toBeLessThan(PENALTY_POINTS.PERINGATAN_2);
    expect(PENALTY_POINTS.PERINGATAN_2).toBeLessThan(PENALTY_POINTS.PERINGATAN_3);
    expect(PENALTY_POINTS.PERINGATAN_3).toBeLessThan(PENALTY_POINTS.DISKUALIFIKASI);
  });
});

describe("PENALTY_OPTIONS", () => {
  it("offers every penalty type exactly once", () => {
    expect(PENALTY_OPTIONS).toHaveLength(PENALTY_TYPES.length);
    expect(new Set(PENALTY_OPTIONS.map((option) => option.type))).toEqual(
      new Set(PENALTY_TYPES)
    );
  });

  it("describes each option with the server-authoritative points", () => {
    for (const option of PENALTY_OPTIONS) {
      expect(option.points).toBe(penaltyPointsForType(option.type));
      expect(option.label.length).toBeGreaterThan(0);
      expect(option.description.length).toBeGreaterThan(0);
    }
  });

  it("defaults the dialog to the lightest penalty", () => {
    expect(PENALTY_OPTIONS[0].type).toBe("TEGURAN_1");
  });
});

describe("penaltyLabel", () => {
  it("returns the human label for a known type", () => {
    expect(penaltyLabel("DISKUALIFIKASI")).toBe("Diskualifikasi");
  });

  it("falls back to the raw type for an unknown value", () => {
    expect(penaltyLabel("MENGIKAT" as never)).toBe("MENGIKAT");
  });
});

describe("penaltyPointsForType", () => {
  it("never returns a negative deduction so the scoreboard clamps consistently", () => {
    for (const type of PENALTY_TYPES) {
      expect(penaltyPointsForType(type)).toBeGreaterThanOrEqual(0);
    }
  });
});