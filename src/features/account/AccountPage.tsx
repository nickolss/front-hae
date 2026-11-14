import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert, Button, Card, CardContent, Grid, Stack, TextField, Typography } from "@mui/material";
import { api } from "@/shared/api/client";
import { errorMessage } from "@/shared/api/problem";
import { PageHeader } from "@/shared/components/PageHeader";
import { PasswordField } from "@/shared/components/PasswordField";
import { useNotify } from "@/shared/hooks/notifyContext";
import { ROLE_LABELS } from "@/shared/domain/labels";
import { SESSION_KEY, useUser } from "@/features/auth/session";
import type { Profile } from "@/features/auth/api";

const profileSchema = z.object({ name: z.string().trim().min(2, "Informe seu nome.").max(100) });
const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Informe a senha atual."),
    newPassword: z.string().min(8, "Mínimo de 8 caracteres.").max(72),
    confirm: z.string(),
  })
  .refine((d) => d.newPassword === d.confirm, { path: ["confirm"], message: "As senhas não coincidem." });

export function AccountPage() {
  const user = useUser();
  const notify = useNotify();
  const client = useQueryClient();

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user.name },
  });
  const passwordForm = useForm<z.infer<typeof passwordSchema>>({ resolver: zodResolver(passwordSchema) });

  const saveProfile = useMutation({
    mutationFn: async (name: string) => (await api.patch<Profile>("/me", { name })).data,
    onSuccess: (profile) => {
      client.setQueryData(SESSION_KEY, profile);
      notify("Dados atualizados.");
    },
  });
  const changePassword = useMutation({
    mutationFn: async (v: z.infer<typeof passwordSchema>) => {
      await api.put("/me/password", { currentPassword: v.currentPassword, newPassword: v.newPassword });
    },
    onSuccess: () => {
      passwordForm.reset({ currentPassword: "", newPassword: "", confirm: "" });
      notify("Senha alterada. Enviamos um aviso para o seu e-mail.");
    },
  });

  return (
    <>
      <PageHeader title="Minha conta" />
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h2" sx={{ mb: 2 }}>
                Dados pessoais
              </Typography>
              <Stack
                component="form"
                spacing={2}
                noValidate
                onSubmit={profileForm.handleSubmit((v) => saveProfile.mutate(v.name))}
              >
                {saveProfile.isError && <Alert severity="error">{errorMessage(saveProfile.error)}</Alert>}
                <TextField
                  label="Nome"
                  {...profileForm.register("name")}
                  error={!!profileForm.formState.errors.name}
                  helperText={profileForm.formState.errors.name?.message}
                />
                <TextField
                  label="E-mail"
                  value={user.email}
                  disabled
                  helperText="Para alterar o e-mail, procure a direção da unidade."
                />
                <TextField label="Papel" value={ROLE_LABELS[user.role]} disabled />
                {user.institution && <TextField label="Unidade" value={user.institution.name} disabled />}
                {user.course && <TextField label="Curso" value={user.course.name} disabled />}
                <Button
                  type="submit"
                  variant="contained"
                  loading={saveProfile.isPending}
                  sx={{ alignSelf: "flex-start" }}
                >
                  Salvar
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h2" sx={{ mb: 2 }}>
                Alterar senha
              </Typography>
              <Stack
                component="form"
                spacing={2}
                noValidate
                onSubmit={passwordForm.handleSubmit((v) => changePassword.mutate(v))}
              >
                {changePassword.isError && (
                  <Alert severity="error">{errorMessage(changePassword.error)}</Alert>
                )}
                <PasswordField
                  label="Senha atual"
                  autoComplete="current-password"
                  {...passwordForm.register("currentPassword")}
                  error={!!passwordForm.formState.errors.currentPassword}
                  helperText={passwordForm.formState.errors.currentPassword?.message}
                />
                <PasswordField
                  label="Nova senha"
                  autoComplete="new-password"
                  {...passwordForm.register("newPassword")}
                  error={!!passwordForm.formState.errors.newPassword}
                  helperText={passwordForm.formState.errors.newPassword?.message ?? "Mínimo de 8 caracteres."}
                />
                <PasswordField
                  label="Confirme a nova senha"
                  autoComplete="new-password"
                  {...passwordForm.register("confirm")}
                  error={!!passwordForm.formState.errors.confirm}
                  helperText={passwordForm.formState.errors.confirm?.message}
                />
                <Button
                  type="submit"
                  variant="contained"
                  loading={changePassword.isPending}
                  sx={{ alignSelf: "flex-start" }}
                >
                  Alterar senha
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}
