import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Link as RouterLink, useLocation, useNavigate } from "react-router";
import { Alert, Button, Stack } from "@mui/material";
import { AuthLayout } from "@/shared/components/AuthLayout";
import { PasswordField } from "@/shared/components/PasswordField";
import { errorMessage } from "@/shared/api/problem";
import { authApi } from "../api";
import { resetSchema, tokenFromHash, type ResetForm } from "../schemas";

export function ResetPasswordPage() {
  const { hash } = useLocation();
  const navigate = useNavigate();
  // lê o token uma vez e o remove da URL
  const [token] = useState(() => {
    const t = tokenFromHash(hash);
    if (t) window.history.replaceState(null, "", window.location.pathname);
    return t;
  });
  const { register, handleSubmit, formState } = useForm<ResetForm>({ resolver: zodResolver(resetSchema) });
  const submit = useMutation({
    mutationFn: (d: ResetForm) => authApi.resetPassword(token!, d.password),
    onSuccess: () =>
      navigate("/login", { replace: true, state: { message: "Senha alterada. Entre com a nova senha." } }),
  });

  if (!token) {
    return (
      <AuthLayout title="Redefinir senha">
        <Stack spacing={2}>
          <Alert severity="error">Link inválido. Solicite um novo link de redefinição.</Alert>
          <Button component={RouterLink} to="/esqueci-senha" variant="outlined">
            Solicitar novo link
          </Button>
        </Stack>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Criar nova senha">
      <Stack component="form" spacing={2.5} noValidate onSubmit={handleSubmit((d) => submit.mutate(d))}>
        {submit.isError && (
          <Alert
            severity="error"
            action={
              <Button component={RouterLink} to="/esqueci-senha" color="inherit" size="small">
                Novo link
              </Button>
            }
          >
            {errorMessage(submit.error)}
          </Alert>
        )}
        <PasswordField
          label="Nova senha"
          autoComplete="new-password"
          autoFocus
          required
          {...register("password")}
          error={!!formState.errors.password}
          helperText={formState.errors.password?.message ?? "Mínimo de 8 caracteres."}
        />
        <PasswordField
          label="Confirme a nova senha"
          autoComplete="new-password"
          required
          {...register("confirmPassword")}
          error={!!formState.errors.confirmPassword}
          helperText={formState.errors.confirmPassword?.message}
        />
        <Button type="submit" variant="contained" size="large" loading={submit.isPending}>
          Salvar nova senha
        </Button>
      </Stack>
    </AuthLayout>
  );
}
