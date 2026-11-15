import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link as RouterLink, useLocation, useNavigate } from "react-router";
import { Alert, Button, Link, Stack, TextField, Typography } from "@mui/material";
import { AuthLayout } from "@/shared/components/AuthLayout";
import { PasswordField } from "@/shared/components/PasswordField";
import { errorMessage } from "@/shared/api/problem";
import { authApi } from "../api";
import { SESSION_KEY } from "../session";
import { loginSchema, type LoginForm } from "../schemas";
import { DemoAccounts } from "../components/DemoAccounts";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const client = useQueryClient();
  const state = location.state as { from?: string; expired?: boolean; message?: string } | null;

  const { register, handleSubmit, formState, setValue, setFocus } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });
  const login = useMutation({
    mutationFn: (data: LoginForm) => authApi.login(data.email, data.password),
    onSuccess: (profile) => {
      client.setQueryData(SESSION_KEY, profile);
      navigate(state?.from && state.from !== "/login" ? state.from : "/", { replace: true });
    },
  });

  return (
    <AuthLayout title="Entrar" subtitle="Sistema de controle de Horas de Atividades Específicas">
      <Stack component="form" spacing={2.5} noValidate onSubmit={handleSubmit((d) => login.mutate(d))}>
        {state?.expired && <Alert severity="info">Sua sessão expirou. Entre novamente para continuar.</Alert>}
        {state?.message && <Alert severity="success">{state.message}</Alert>}
        {login.isError && (
          <Alert severity="error" role="alert">
            {errorMessage(login.error)}
          </Alert>
        )}
        <TextField
          label="E-mail institucional"
          type="email"
          autoComplete="username"
          autoFocus
          required
          {...register("email")}
          error={!!formState.errors.email}
          helperText={formState.errors.email?.message}
        />
        <PasswordField
          label="Senha"
          autoComplete="current-password"
          required
          {...register("password")}
          error={!!formState.errors.password}
          helperText={formState.errors.password?.message}
        />
        <Link component={RouterLink} to="/esqueci-senha" sx={{ alignSelf: "flex-start" }}>
          Esqueci minha senha
        </Link>
        <Button type="submit" variant="contained" size="large" loading={login.isPending}>
          Entrar
        </Button>
        <Typography>
          Primeiro acesso?{" "}
          <Link component={RouterLink} to="/cadastro">
            Crie sua conta
          </Link>
        </Typography>
      </Stack>
      <DemoAccounts
        onSelect={(email) => {
          setValue("email", email, { shouldValidate: true });
          setFocus("password");
        }}
      />
    </AuthLayout>
  );
}
