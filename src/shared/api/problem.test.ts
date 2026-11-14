import { AxiosError, AxiosHeaders } from "axios";
import { describe, expect, it } from "vitest";
import { errorMessage, fieldErrors } from "./problem";

function axiosError(status: number, data?: unknown) {
  const config = { headers: new AxiosHeaders() };
  return new AxiosError("x", "ERR", config, null, { status, data, statusText: "", headers: {}, config });
}

describe("errorMessage", () => {
  it("usa o detail do Problem Details", () => {
    expect(errorMessage(axiosError(422, { detail: "Limite excedido." }))).toBe("Limite excedido.");
  });
  it("não expõe detalhes de erros 5xx", () => {
    expect(errorMessage(axiosError(500, { detail: "NullPointerException" }))).toMatch(/servidor/);
  });
  it("trata ausência de conexão", () => {
    expect(errorMessage(new AxiosError("Network Error"))).toMatch(/conexão/);
  });
  it("extrai erros por campo", () => {
    expect(fieldErrors(axiosError(400, { errors: { email: "inválido" } }))).toEqual({ email: "inválido" });
  });
});
