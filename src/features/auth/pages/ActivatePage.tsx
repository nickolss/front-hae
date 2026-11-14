import { useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link as RouterLink, useLocation, useNavigate } from "react-router";
import { Alert, Button, Stack } from "@mui/material";
import { AuthLayout } from "@/shared/components/AuthLayout";
import { LoadingState } from "@/shared/components/States";
import { errorMessage } from "@/shared/api/problem";
import { authApi } from "../api";
import { SESSION_KEY } from "../session";
import { tokenFromHash } from "../schemas";

export function ActivatePage() {
  const { hash } = useLocation();
  const navigate = useNavigate();
  const client = useQueryClient();
  const token = tokenFromHash(hash);
  const started = useRef(false);

  const activate = useMutation({
    mutationFn: authApi.activate,
    onSuccess: (profile) => {
      client.setQueryData(SESSION_KEY, profile);
      navigate("/", { replace: true });
    },
  });

  useEffect(() => {
    if (token && !started.current) {
      started.current = true;
      // remove o token da barra de endereços/histórico
      window.history.replaceState(null, "", window.location.pathname);
      activate.mutate(token);
    }
  }, [token, activate]);

  return (
    <AuthLayout title="Ativação de conta">
      {!token ? (
        <Stack spacing={2}>
          <Alert severity="error">
            Link de ativação inválido. Abra novamente o link recebido por e-mail.
          </Alert>
          <Button component={RouterLink} to="/cadastro" variant="outlined">
            Refazer cadastro
          </Button>
        </Stack>
      ) : activate.isError ? (
        <Stack spacing={2}>
          <Alert severity="error">{errorMessage(activate.error)}</Alert>
          <Button component={RouterLink} to="/cadastro" variant="outlined">
            Refazer cadastro
          </Button>
        </Stack>
      ) : (
        <LoadingState label="Ativando sua conta…" />
      )}
    </AuthLayout>
  );
}
