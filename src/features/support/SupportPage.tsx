import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Alert, Button, Card, CardContent, MenuItem, Stack, TextField } from "@mui/material";
import { api } from "@/shared/api/client";
import { errorMessage } from "@/shared/api/problem";
import { PageHeader } from "@/shared/components/PageHeader";
import { useNotify } from "@/shared/hooks/notifyContext";

const schema = z.object({
  category: z.enum(["BUG", "SUGESTAO", "DUVIDA"], { error: "Selecione a categoria." }),
  subject: z.string().trim().min(3, "Informe o assunto.").max(150),
  description: z.string().trim().min(10, "Descreva com pelo menos 10 caracteres.").max(5000),
});
type Values = z.infer<typeof schema>;

export function SupportPage() {
  const notify = useNotify();
  const { register, handleSubmit, control, formState, reset } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { subject: "", description: "" },
  });
  const send = useMutation({
    mutationFn: async (v: Values) => {
      await api.post("/feedback", v);
    },
    onSuccess: () => {
      reset({ subject: "", description: "" });
      notify("Mensagem enviada. Responderemos pelo seu e-mail institucional.");
    },
  });
  const e = formState.errors;
  return (
    <>
      <PageHeader
        title="Suporte"
        description="Encontrou um problema ou tem uma sugestão? Fale com a equipe do sistema."
      />
      <Card sx={{ maxWidth: 720 }}>
        <CardContent>
          <Stack component="form" spacing={2} noValidate onSubmit={handleSubmit((v) => send.mutate(v))}>
            {send.isError && <Alert severity="error">{errorMessage(send.error)}</Alert>}
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <TextField
                  select
                  label="Categoria"
                  required
                  {...field}
                  value={field.value ?? ""}
                  error={!!e.category}
                  helperText={e.category?.message}
                >
                  <MenuItem value="BUG">Problema / erro</MenuItem>
                  <MenuItem value="DUVIDA">Dúvida</MenuItem>
                  <MenuItem value="SUGESTAO">Sugestão</MenuItem>
                </TextField>
              )}
            />
            <TextField
              label="Assunto"
              required
              {...register("subject")}
              error={!!e.subject}
              helperText={e.subject?.message}
            />
            <TextField
              label="Mensagem"
              required
              multiline
              minRows={5}
              {...register("description")}
              error={!!e.description}
              helperText={
                e.description?.message ?? "Se for um erro, conte o que você fez antes dele acontecer."
              }
            />
            <Button
              type="submit"
              variant="contained"
              loading={send.isPending}
              sx={{ alignSelf: "flex-start" }}
            >
              Enviar mensagem
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </>
  );
}
