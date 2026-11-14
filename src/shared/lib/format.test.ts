import { describe, expect, it } from "vitest";
import { currentSemester, formatDate, semesterOptions } from "./format";

describe("format", () => {
  it("formata data ISO sem deslocar o dia por fuso horário", () => {
    expect(formatDate("2026-08-01")).toBe("01/08/2026");
    expect(formatDate(null)).toBe("—");
  });
  it("calcula semestres", () => {
    expect(currentSemester(new Date(2026, 5, 30))).toBe("2026-1");
    expect(currentSemester(new Date(2026, 6, 1))).toBe("2026-2");
    expect(semesterOptions(new Date(2026, 1, 1), 3).map((o) => o.value)).toEqual([
      "2026-1",
      "2025-2",
      "2025-1",
    ]);
  });
});
