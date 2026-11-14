import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/test/render";
import { authApi } from "../api";
import { LoginPage } from "./LoginPage";

describe("LoginPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(authApi, "login");
  });

  it("valida os campos antes de enviar", async () => {
    renderWithProviders(<LoginPage />, { path: "/login" });
    await userEvent.click(screen.getByRole("button", { name: "Entrar" }));
    expect(await screen.findByText("Informe seu e-mail.")).toBeInTheDocument();
    expect(screen.getByText("Informe sua senha.")).toBeInTheDocument();
    expect(authApi.login).not.toHaveBeenCalled();
  });

  it("mostra a mensagem da API quando as credenciais são inválidas", async () => {
    // erro no formato do axios (isAxiosError) com corpo Problem Details
    const error = {
      isAxiosError: true,
      response: { status: 401, data: { detail: "E-mail ou senha inválidos." } },
    };
    vi.mocked(authApi.login).mockImplementation(() => Promise.reject(error));
    renderWithProviders(<LoginPage />, { path: "/login" });
    await userEvent.type(screen.getByLabelText(/E-mail institucional/), "ana@fatec.sp.gov.br");
    await userEvent.type(screen.getByLabelText(/^Senha/), "errada123");
    await userEvent.click(screen.getByRole("button", { name: "Entrar" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("E-mail ou senha inválidos.");
  });

  it("entra e navega para o início", async () => {
    vi.mocked(authApi.login).mockResolvedValue({
      id: "1",
      name: "Ana",
      email: "a@f.br",
      role: "PROFESSOR",
      institution: null,
      course: null,
    });
    const { router } = renderWithProviders(<LoginPage />, { path: "/login" });
    await userEvent.type(screen.getByLabelText(/E-mail institucional/), "ana@fatec.sp.gov.br");
    await userEvent.type(screen.getByLabelText(/^Senha/), "senha-forte");
    await userEvent.click(screen.getByRole("button", { name: "Entrar" }));
    await waitFor(() => expect(router.state.location.pathname).toBe("/"));
  });

  it("botão de mostrar senha é acessível", async () => {
    renderWithProviders(<LoginPage />, { path: "/login" });
    const toggle = screen.getByRole("button", { name: "Mostrar senha" });
    await userEvent.click(toggle);
    expect(screen.getByRole("button", { name: "Ocultar senha" })).toHaveAttribute("aria-pressed", "true");
  });
});
