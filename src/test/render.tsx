import type { ReactElement } from "react";
import { render } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@mui/material";
import { createMemoryRouter, RouterProvider } from "react-router";
import { theme } from "@/app/theme";
import { NotifyProvider } from "@/shared/hooks/useNotify";

/** Renderiza um elemento com todos os providers da aplicação. */
export function renderWithProviders(
  element: ReactElement,
  { path = "/", initialEntries }: { path?: string; initialEntries?: string[] } = {},
) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const router = createMemoryRouter(
    [
      { path, element },
      { path: "*", element: <p>outra página</p> },
    ],
    { initialEntries: initialEntries ?? [path] },
  );
  return {
    client,
    router,
    ...render(
      <ThemeProvider theme={theme}>
        <QueryClientProvider client={client}>
          <NotifyProvider>
            <RouterProvider router={router} />
          </NotifyProvider>
        </QueryClientProvider>
      </ThemeProvider>,
    ),
  };
}
