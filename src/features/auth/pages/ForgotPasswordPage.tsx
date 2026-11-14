import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Link as RouterLink } from "react-router";
import { Alert, Button, Link, Stack, TextField } from "@mui/material";
import { AuthLayout } from "@/shared/components/AuthLayout";
import { errorMessage } from "@/shared/api/problem";
import { authApi } from "../api";
import { forgotSchema, type ForgotForm } from "../schemas";

export function ForgotPasswordPage() {
  const { register, handleSubmit, formState } = useForm<ForgotForm>({ resolver: zodResolver(forgotSchema) });
  const submit = useMutation({ mutationFn: (d: ForgotForm) => authApi.forgotPassword(d.email) });

  return (
    <AuthLayout
      title="Recuperar senha"
      subtitle="Informe seu e-mail e enviaremos um link para criar uma nova senha."
    >
      <Stack component="form" spacing={2.5} noValidate onSubmit={handleSubmit((d) => submit.mutate(d))}>
        {submit.isSuccess && (
          <Alert severity="success" role="status">
            {submit.data.message} O link expira em 30 minutos.
          </Alert>
        )}
        {submit.isError && <Alert severity="error">{errorMessage(submit.error)}</Alert>}
        <TextField
          label="E-mail institucional"
          type="email"
          autoComplete="email"
          autoFocus
          required
          {...register("email")}
          error={!!formState.errors.email}
          helperText={formState.errors.email?.message}
        />
        <Button type="submit" variant="contained" size="large" loading={submit.isPending}>
          Enviar link
        </Button>
        <Link component={RouterLink} to="/login">
          Voltar para o login
        </Link>
      </Stack>
    </AuthLayout>
  );
}
