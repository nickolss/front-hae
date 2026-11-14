import { describe, expect, it } from "vitest";
import { registerSchema, tokenFromHash } from "./schemas";

describe("registerSchema", () => {
  const base = {
    name: "Ana Souza",
    email: "ana@fatec.sp.gov.br",
    institutionCode: 110,
    courseId: "c1",
    password: "senha-forte",
    confirmPassword: "senha-forte",
  };

  it("aceita cadastro válido", () => {
    expect(registerSchema.safeParse(base).success).toBe(true);
  });

  it("exige confirmação igual e senha com 8+ caracteres", () => {
    expect(registerSchema.safeParse({ ...base, confirmPassword: "outra" }).success).toBe(false);
    expect(registerSchema.safeParse({ ...base, password: "curta", confirmPassword: "curta" }).success).toBe(
      false,
    );
  });
});

describe("tokenFromHash", () => {
  it("lê o token do fragmento", () => {
    expect(tokenFromHash("#token=abcdefghijklmnopqrstuvwxyz")).toBe("abcdefghijklmnopqrstuvwxyz");
  });
  it("ignora fragmentos vazios ou curtos", () => {
    expect(tokenFromHash("")).toBeNull();
    expect(tokenFromHash("#token=abc")).toBeNull();
  });
});
