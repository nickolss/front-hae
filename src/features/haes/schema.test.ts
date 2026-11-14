import { describe, expect, it } from "vitest";
import { haeSchema, parseRas, scheduledHours, toInput, type HaeFormValues } from "./schema";

const valid: HaeFormValues = {
  courseId: "c1",
  title: "Projeto de extensão",
  description: "Descrição detalhada do projeto",
  observations: "",
  type: "TCC",
  modality: "PRESENCIAL",
  dimension: "DIMENSAO_1_DIDATICO_PEDAGOGICO",
  weeklyHours: 4,
  startDate: "2026-08-03",
  endDate: "2026-12-04",
  schedule: [{ day: "MONDAY", start: "08:00", end: "10:00" }],
  studentRas: "1110482312345, 2220482312345",
};

describe("haeSchema", () => {
  it("aceita uma HAE válida", () => {
    expect(haeSchema.safeParse(valid).success).toBe(true);
  });

  it("rejeita período que cruza semestres", () => {
    const r = haeSchema.safeParse({ ...valid, startDate: "2026-05-01", endDate: "2026-08-01" });
    expect(r.success).toBe(false);
    expect(r.error?.issues.some((i) => i.message.includes("mesmo semestre"))).toBe(true);
  });

  it("rejeita horário final antes do inicial e dias repetidos", () => {
    expect(
      haeSchema.safeParse({ ...valid, schedule: [{ day: "MONDAY", start: "10:00", end: "09:00" }] }).success,
    ).toBe(false);
    expect(
      haeSchema.safeParse({
        ...valid,
        schedule: [
          { day: "MONDAY", start: "08:00", end: "09:00" },
          { day: "MONDAY", start: "10:00", end: "11:00" },
        ],
      }).success,
    ).toBe(false);
  });

  it("rejeita horas fora de 1..40", () => {
    expect(haeSchema.safeParse({ ...valid, weeklyHours: 41 }).success).toBe(false);
  });

  it("rejeita RA inválido apenas para tipos com alunos", () => {
    expect(haeSchema.safeParse({ ...valid, studentRas: "<script>" }).success).toBe(false);
    expect(haeSchema.safeParse({ ...valid, type: "APOIO_DIRECAO", studentRas: "<script>" }).success).toBe(
      true,
    );
  });
});

describe("helpers", () => {
  it("separa RAs por vírgula, espaço ou quebra de linha", () => {
    expect(parseRas("a1234, b5678\nc9012;  ")).toEqual(["a1234", "b5678", "c9012"]);
  });

  it("soma as horas do cronograma", () => {
    expect(
      scheduledHours([
        { start: "08:00", end: "10:30" },
        { start: "14:00", end: "15:00" },
      ]),
    ).toBe(3.5);
  });

  it("descarta alunos para Apoio à Direção ao montar o payload", () => {
    expect(toInput({ ...valid, type: "APOIO_DIRECAO" }).studentRas).toEqual([]);
    expect(toInput(valid, "owner").employeeId).toBe("owner");
  });
});
