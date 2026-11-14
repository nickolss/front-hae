import { describe, expect, it } from "vitest";
import type { Profile } from "@/features/auth/api";
import type { Role } from "@/shared/domain/labels";
import { navigationFor } from "./navigation";

const user = (role: Role, institution = true): Profile => ({
  id: "u",
  name: "Ana",
  email: "a@f.br",
  role,
  institution: institution ? { id: "i1", name: "Fatec", code: 1 } : null,
  course: null,
});

const paths = (role: Role, institution = true) =>
  navigationFor(user(role, institution)).flatMap((g) => g.items.map((i) => i.to));

describe("navigationFor", () => {
  it("professor não vê telas de gestão", () => {
    expect(paths("PROFESSOR")).toEqual(
      expect.arrayContaining(["/", "/haes/nova", "/minhas-haes", "/conta", "/suporte"]),
    );
    expect(paths("PROFESSOR")).not.toContain("/haes");
    expect(paths("PROFESSOR")).not.toContain("/funcionarios");
  });
  it("diretor gerencia a própria unidade", () => {
    expect(paths("DIRETOR")).toContain("/instituicoes/i1");
    expect(paths("DIRETOR")).not.toContain("/instituicoes");
  });
  it("admin vê instituições e não cria HAE", () => {
    expect(paths("ADMIN", false)).toContain("/instituicoes");
    expect(paths("ADMIN", false)).not.toContain("/haes/nova");
  });
});
