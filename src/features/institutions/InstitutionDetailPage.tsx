import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Navigate, useParams } from "react-router";
import {
  Alert,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import DeleteOutline from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlined from "@mui/icons-material/EditOutlined";
import { PageHeader } from "@/shared/components/PageHeader";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { ErrorState, LoadingState } from "@/shared/components/States";
import { errorMessage } from "@/shared/api/problem";
import { useNotify } from "@/shared/hooks/notifyContext";
import { useUser } from "@/features/auth/session";
import { isGlobal } from "@/shared/domain/labels";
import { institutionApi, institutionKeys, type Course } from "./api";
import { InstitutionDialog } from "./InstitutionDialog";

export function InstitutionDetailPage() {
  const { id = "" } = useParams();
  const user = useUser();
  const notify = useNotify();
  const client = useQueryClient();
  const global = isGlobal(user.role);
  const institution = useQuery({
    queryKey: institutionKeys.detail(id),
    queryFn: () => institutionApi.get(id),
  });
  const courses = useQuery({
    queryKey: institutionKeys.courses(id),
    queryFn: () => institutionApi.courses(id),
  });
  const hours = useQuery({ queryKey: institutionKeys.hours(id), queryFn: () => institutionApi.hours(id) });

  const [editing, setEditing] = useState(false);
  const [limit, setLimit] = useState<string>("");
  const [courseName, setCourseName] = useState("");
  const [removing, setRemoving] = useState<Course | null>(null);

  const refresh = () => client.invalidateQueries({ queryKey: institutionKeys.all });
  const update = useMutation({
    mutationFn: (input: Parameters<typeof institutionApi.update>[1]) => institutionApi.update(id, input),
    onSuccess: () => {
      refresh();
      setEditing(false);
      notify("Instituição atualizada.");
    },
  });
  const toggle = useMutation({
    mutationFn: (active: boolean) => institutionApi.setActive(id, active),
    onSuccess: (i) => {
      refresh();
      notify(
        i.active ? "Instituição reativada." : "Instituição desativada: ela não aparece mais no cadastro.",
      );
    },
  });
  const saveLimit = useMutation({
    mutationFn: (value: number) => institutionApi.setHoursLimit(id, value),
    onSuccess: () => {
      refresh();
      setLimit("");
      notify("Limite de horas atualizado.");
    },
    onError: (e) => notify(errorMessage(e), "error"),
  });
  const addCourse = useMutation({
    mutationFn: (name: string) => institutionApi.addCourse(id, name),
    onSuccess: () => {
      setCourseName("");
      client.invalidateQueries({ queryKey: institutionKeys.courses(id) });
      notify("Curso adicionado.");
    },
  });
  const removeCourse = useMutation({
    mutationFn: (c: Course) => institutionApi.removeCourse(id, c.id),
    onSuccess: () => {
      setRemoving(null);
      client.invalidateQueries({ queryKey: institutionKeys.courses(id) });
      notify("Curso removido.");
    },
    onError: (e) => {
      setRemoving(null);
      notify(errorMessage(e), "error");
    },
  });

  if (!global && user.institution?.id !== id) return <Navigate to="/" replace />;
  if (institution.isPending) return <LoadingState />;
  if (institution.isError)
    return <ErrorState error={institution.error} onRetry={() => institution.refetch()} />;
  const i = institution.data;
  const h = hours.data;
  const usage = h && h.limit > 0 ? Math.min(100, Math.round((h.allocated / h.limit) * 100)) : 0;

  return (
    <>
      <PageHeader
        title={i.name}
        description={`Código ${i.code} · ${i.address}`}
        breadcrumbs={global ? [{ label: "Instituições", to: "/instituicoes" }, { label: i.name }] : undefined}
        actions={
          global && (
            <>
              <Button variant="outlined" startIcon={<EditOutlined />} onClick={() => setEditing(true)}>
                Editar
              </Button>
              <Button
                color={i.active ? "error" : "success"}
                onClick={() => toggle.mutate(!i.active)}
                loading={toggle.isPending}
              >
                {i.active ? "Desativar" : "Reativar"}
              </Button>
            </>
          )
        }
      />
      {!i.active && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Instituição inativa: novos cadastros não podem escolhê-la.
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h2" sx={{ mb: 1 }}>
                Limite de horas de HAE
              </Typography>
              {h && (
                <>
                  <Typography sx={{ mb: 1 }}>
                    Semestre {h.semester}: <strong>{h.allocated} h</strong> alocadas de{" "}
                    {h.limit} h ({h.remaining} h disponíveis)
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={usage}
                    color={usage >= 90 ? "error" : usage >= 70 ? "warning" : "primary"}
                    aria-label="Uso do limite de horas"
                    sx={{ height: 10, borderRadius: 5, mb: 2 }}
                  />
                </>
              )}
              <Stack
                component="form"
                direction="row"
                spacing={1}
                onSubmit={(e) => {
                  e.preventDefault();
                  const value = Number(limit);
                  if (Number.isInteger(value) && value >= 0) saveLimit.mutate(value);
                }}
              >
                <TextField
                  size="small"
                  type="number"
                  label="Novo limite semanal (h)"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  placeholder={String(i.weeklyHoursLimit)}
                  slotProps={{ htmlInput: { min: 0, max: 10000 } }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={limit === ""}
                  loading={saveLimit.isPending}
                >
                  Salvar
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h2" sx={{ mb: 1 }}>
                Cursos
              </Typography>
              {courses.data?.length === 0 && (
                <Alert severity="info">Cadastre os cursos para que professores possam se registrar.</Alert>
              )}
              <List dense>
                {(courses.data ?? []).map((c) => (
                  <ListItem
                    key={c.id}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        aria-label={`Remover curso ${c.name}`}
                        onClick={() => setRemoving(c)}
                      >
                        <DeleteOutline />
                      </IconButton>
                    }
                  >
                    <ListItemText primary={c.name} />
                  </ListItem>
                ))}
              </List>
              {addCourse.isError && (
                <Alert severity="error" sx={{ mb: 1 }}>
                  {errorMessage(addCourse.error)}
                </Alert>
              )}
              <Stack
                component="form"
                direction="row"
                spacing={1}
                onSubmit={(e) => {
                  e.preventDefault();
                  if (courseName.trim()) addCourse.mutate(courseName.trim());
                }}
              >
                <TextField
                  size="small"
                  label="Nome do curso"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  slotProps={{ htmlInput: { maxLength: 120 } }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={!courseName.trim()}
                  loading={addCourse.isPending}
                >
                  Adicionar
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {editing && (
        <InstitutionDialog
          open
          initial={i}
          loading={update.isPending}
          error={update.isError ? errorMessage(update.error) : undefined}
          onClose={() => setEditing(false)}
          onSubmit={(input) => update.mutate(input)}
        />
      )}
      <ConfirmDialog
        open={removing !== null}
        title="Remover curso?"
        message={`O curso “${removing?.name ?? ""}” será removido. Cursos com HAEs ou funcionários vinculados não podem ser removidos.`}
        confirmLabel="Remover"
        destructive
        loading={removeCourse.isPending}
        onConfirm={() => removing && removeCourse.mutate(removing)}
        onClose={() => setRemoving(null)}
      />
    </>
  );
}
