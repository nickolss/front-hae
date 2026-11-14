import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link as RouterLink } from "react-router";
import { Alert, Button, Link, MenuItem, Stack, TextField, Typography } from "@mui/material";
import MarkEmailReadOutlined from "@mui/icons-material/MarkEmailReadOutlined";
import { AuthLayout } from "@/shared/components/AuthLayout";
import { PasswordField } from "@/shared/components/PasswordField";
import { errorMessage } from "@/shared/api/problem";
import { authApi } from "../api";
import { registerSchema, type RegisterForm } from "../schemas";

export function RegisterPage() {
  const { register, handleSubmit, control, setValue, formState, getValues } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", courseId: "", password: "", confirmPassword: "" },
  });
  const institutionCode = useWatch({ control, name: "institutionCode" });

  const institutions = useQuery({ queryKey: ["public-institutions"], queryFn: authApi.publicInstitutions });
  const courses = useQuery({
    queryKey: ["public-courses", institutionCode],
    queryFn: () => authApi.publicCourses(institutionCode),
    enabled: !!institutionCode,
  });

  const submit = useMutation({
    mutationFn: ({ name, email, password, institutionCode: code, courseId }: RegisterForm) =>
      authApi.register({ name, email, password, institutionCode: code, courseId }),
  });

  if (submit.isSuccess) {
    return (
      <AuthLayout title="Confira seu e-mail">
        <Stack spacing={2} sx={{ alignItems: "flex-start" }}>
          <MarkEmailReadOutlined color="primary" sx={{ fontSize: 48 }} aria-hidden />
          <Typography>
            Enviamos um link de ativação para <strong>{getValues("email")}</strong>. Ele é válido por 24
            horas.
          </Typography>
          <Typography color="text.secondary">
            Não encontrou? Verifique a caixa de spam ou lixo eletrônico.
          </Typography>
          <Button component={RouterLink} to="/login" variant="outlined">
            Voltar para o login
          </Button>
        </Stack>
      </AuthLayout>
    );
  }

  const errors = formState.errors;
  return (
    <AuthLayout
      title="Criar conta"
      subtitle="Use seu e-mail institucional. Você receberá um link para ativar a conta."
    >
      <Stack component="form" spacing={2.5} noValidate onSubmit={handleSubmit((d) => submit.mutate(d))}>
        {submit.isError && <Alert severity="error">{errorMessage(submit.error)}</Alert>}
        {institutions.isError && <Alert severity="error">{errorMessage(institutions.error)}</Alert>}
        <TextField
          label="Nome completo"
          autoComplete="name"
          required
          {...register("name")}
          error={!!errors.name}
          helperText={errors.name?.message}
        />
        <TextField
          label="E-mail institucional"
          type="email"
          autoComplete="email"
          placeholder="nome@fatec.sp.gov.br"
          required
          {...register("email")}
          error={!!errors.email}
          helperText={errors.email?.message}
        />
        <Controller
          name="institutionCode"
          control={control}
          render={({ field }) => (
            <TextField
              select
              label="Unidade (Fatec)"
              required
              value={field.value ?? ""}
              onChange={(e) => {
                field.onChange(Number(e.target.value));
                setValue("courseId", "");
              }}
              onBlur={field.onBlur}
              error={!!errors.institutionCode}
              helperText={
                errors.institutionCode?.message ??
                (institutions.isPending ? "Carregando unidades…" : undefined)
              }
            >
              {(institutions.data ?? []).map((i) => (
                <MenuItem key={i.code} value={i.code}>
                  {i.name}
                </MenuItem>
              ))}
            </TextField>
          )}
        />
        <Controller
          name="courseId"
          control={control}
          render={({ field }) => (
            <TextField
              select
              label="Curso"
              required
              disabled={!institutionCode || courses.isPending}
              {...field}
              error={!!errors.courseId}
              helperText={
                errors.courseId?.message ??
                (!institutionCode
                  ? "Selecione a unidade primeiro."
                  : courses.data?.length === 0
                    ? "Esta unidade ainda não tem cursos cadastrados."
                    : undefined)
              }
            >
              {(courses.data ?? []).map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>
          )}
        />
        <PasswordField
          label="Senha"
          autoComplete="new-password"
          required
          {...register("password")}
          error={!!errors.password}
          helperText={
            errors.password?.message ?? "Mínimo de 8 caracteres. Prefira uma frase fácil de lembrar."
          }
        />
        <PasswordField
          label="Confirme a senha"
          autoComplete="new-password"
          required
          {...register("confirmPassword")}
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword?.message}
        />
        <Button type="submit" variant="contained" size="large" loading={submit.isPending}>
          Criar conta
        </Button>
        <Typography>
          Já tem conta?{" "}
          <Link component={RouterLink} to="/login">
            Entrar
          </Link>
        </Typography>
      </Stack>
    </AuthLayout>
  );
}
