import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { api } from "@/shared/api/client";
import { renderWithProviders } from "@/test/render";
import { LoginPage } from "../pages/LoginPage";

const info = {
  demo: true,
  demoAccounts: [
    {
      name: "Helena Duarte",
      email: "diretora@fatec-demo.example.com",
      role: "DIRETOR",
      description: "Diretora",
    },
  ],
};

describe("modo demonstração no login", () => {
  afterEach(() => vi.restoreAllMocks());

  it("lista contas fictícias, mostra o aviso e preenche o e-mail", async () => {
    vi.spyOn(api, "get").mockResolvedValue({ data: info });
    renderWithProviders(<LoginPage />, { path: "/login" });

    expect(await screen.findByText(/Ambiente de demonstração/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Usar a conta de Helena Duarte" }));
    await waitFor(() =>
      expect(screen.getByLabelText(/E-mail institucional/)).toHaveValue("diretora@fatec-demo.example.com"),
    );
    expect(screen.getByLabelText(/^Senha/)).toHaveFocus();
  });

  it("não mostra nada fora do modo demonstração", async () => {
    vi.spyOn(api, "get").mockResolvedValue({ data: { demo: false, demoAccounts: [] } });
    renderWithProviders(<LoginPage />, { path: "/login" });
    await waitFor(() => expect(api.get).toHaveBeenCalled());
    expect(screen.queryByText(/Contas de demonstração/)).not.toBeInTheDocument();
  });
});
