import { RouterProvider } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { isAxiosError } from "axios";
import { theme } from "./theme";
import { router } from "./router";
import { NotifyProvider } from "@/shared/hooks/useNotify";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      // não repete erros do cliente (4xx); repete 1x falhas de rede/servidor
      retry: (count, error) => count < 1 && !(isAxiosError(error) && (error.response?.status ?? 500) < 500),
    },
  },
});

export function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <NotifyProvider>
          <RouterProvider router={router} />
        </NotifyProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
