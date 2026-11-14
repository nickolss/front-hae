import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
} from "@mui/material";
import PersonAddAlt from "@mui/icons-material/PersonAddAlt";
import EditOutlined from "@mui/icons-material/EditOutlined";
import DeleteOutline from "@mui/icons-material/DeleteOutlineOutlined";
import SearchIcon from "@mui/icons-material/Search";
import { PageHeader } from "@/shared/components/PageHeader";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { EmptyState, ErrorState, LoadingState } from "@/shared/components/States";
import { PasswordField } from "@/shared/components/PasswordField";
import { errorMessage } from "@/shared/api/problem";
import { useNotify } from "@/shared/hooks/notifyContext";
import { useUser } from "@/features/auth/session";
import { institutionApi, institutionKeys } from "@/features/institutions/api";
import { ROLE_LABELS, canManageInstitution, isGlobal, options, type Role } from "@/shared/domain/labels";
import { employeeApi, employeeKeys, type EmployeeSummary } from "./api";

function assignableRoles(role: Role): Role[] {
  return isGlobal(role)
    ? ["PROFESSOR", "COORDENADOR", "DIRETOR", "ADMIN", "DEV"]
    : ["PROFESSOR", "COORDENADOR"];
}

const createSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome."),
  email: z.string().trim().email("E-mail inválido."),
  role: z.string().min(1, "Selecione o papel."),
  institutionId: z.string().optional(),
  courseId: z.string().optional(),
  temporaryPassword: z.string().min(8, "Mínimo de 8 caracteres.").max(72),
});
type CreateValues = z.infer<typeof createSchema>;

function CreateDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const user = useUser();
  const notify = useNotify();
  const client = useQueryClient();
  const { register, handleSubmit, control, formState, reset } = useForm<CreateValues>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "PROFESSOR",
      institutionId: user.institution?.id ?? "",
      courseId: "",
      temporaryPassword: "",
    },
  });
  const [institutionId, roleValue] = useWatch({ control, name: ["institutionId", "role"] });
  const role = roleValue as Role;
  const institutions = useQuery({
    queryKey: institutionKeys.all,
    queryFn: institutionApi.list,
    enabled: isGlobal(user.role),
  });
  const courses = useQuery({
    queryKey: institutionKeys.courses(institutionId ?? ""),
    queryFn: () => institutionApi.courses(institutionId!),
    enabled: !!institutionId,
  });
  const create = useMutation({
    mutationFn: (v: CreateValues) =>
      employeeApi.create({
        name: v.name,
        email: v.email,
        role: v.role as Role,
        institutionId: isGlobal(v.role as Role) ? undefined : v.institutionId || undefined,
        courseId: v.courseId || undefined,
        temporaryPassword: v.temporaryPassword,
      }),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: employeeKeys.all });
      notify("Funcionário cadastrado. Informe a senha provisória a ele com segurança.");
      reset();
      onClose();
    },
  });
  const e = formState.errors;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" aria-labelledby="create-employee">
      <DialogTitle id="create-employee">Cadastrar funcionário</DialogTitle>
      <form noValidate onSubmit={handleSubmit((v) => create.mutate(v))}>
        <DialogContent>
          <Stack spacing={2}>
            {create.isError && <Alert severity="error">{errorMessage(create.error)}</Alert>}
            <TextField
              label="Nome"
              required
              {...register("name")}
              error={!!e.name}
              helperText={e.name?.message}
            />
            <TextField
              label="E-mail"
              type="email"
              required
              {...register("email")}
              error={!!e.email}
              helperText={e.email?.message}
            />
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <TextField select label="Papel" required {...field}>
                  {assignableRoles(user.role).map((r) => (
                    <MenuItem key={r} value={r}>
                      {ROLE_LABELS[r]}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            {isGlobal(user.role) && !isGlobal(role) && (
              <Controller
                name="institutionId"
                control={control}
                render={({ field }) => (
                  <TextField select label="Unidade" required {...field}>
                    {(institutions.data ?? []).map((i) => (
                      <MenuItem key={i.id} value={i.id}>
                        {i.name}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            )}
            {!isGlobal(role) && (
              <Controller
                name="courseId"
                control={control}
                render={({ field }) => (
                  <TextField
                    select
                    label="Curso (opcional)"
                    {...field}
                    disabled={!institutionId}
                    helperText="Coordenadores recebem avisos das HAEs deste curso."
                  >
                    <MenuItem value="">Nenhum</MenuItem>
                    {(courses.data ?? []).map((c) => (
                      <MenuItem key={c.id} value={c.id}>
                        {c.name}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            )}
            <PasswordField
              label="Senha provisória"
              autoComplete="new-password"
              required
              {...register("temporaryPassword")}
              error={!!e.temporaryPassword}
              helperText={e.temporaryPassword?.message ?? "A pessoa poderá trocá-la em “Minha conta”."}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained" loading={create.isPending}>
            Cadastrar
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

function EditDialog({ employee, onClose }: { employee: EmployeeSummary; onClose: () => void }) {
  const user = useUser();
  const notify = useNotify();
  const client = useQueryClient();
  const [role, setRole] = useState<Role>(employee.role);
  const [courseId, setCourseId] = useState(employee.courseId ?? "");
  const courses = useQuery({
    queryKey: institutionKeys.courses(employee.institutionId ?? ""),
    queryFn: () => institutionApi.courses(employee.institutionId!),
    enabled: !!employee.institutionId,
  });
  const save = useMutation({
    mutationFn: () => employeeApi.update(employee.id, { role, courseId: courseId || undefined }),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: employeeKeys.all });
      notify("Funcionário atualizado.");
      onClose();
    },
  });
  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs" aria-labelledby="edit-employee">
      <DialogTitle id="edit-employee">Editar {employee.name}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {save.isError && <Alert severity="error">{errorMessage(save.error)}</Alert>}
          <TextField select label="Papel" value={role} onChange={(e) => setRole(e.target.value as Role)}>
            {assignableRoles(user.role).map((r) => (
              <MenuItem key={r} value={r}>
                {ROLE_LABELS[r]}
              </MenuItem>
            ))}
          </TextField>
          {employee.institutionId && (
            <TextField select label="Curso" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
              <MenuItem value="">Sem alteração</MenuItem>
              {(courses.data ?? []).map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" loading={save.isPending} onClick={() => save.mutate()}>
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function EmployeesPage() {
  const user = useUser();
  const notify = useNotify();
  const client = useQueryClient();
  const manager = canManageInstitution(user.role);
  const [text, setText] = useState("");
  const [q, setQ] = useState("");
  const [role, setRole] = useState<Role | "">("");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<EmployeeSummary | null>(null);
  const [deleting, setDeleting] = useState<EmployeeSummary | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setQ(text);
      setPage(0);
    }, 400);
    return () => clearTimeout(t);
  }, [text]);

  const filters = { q: q || undefined, role: role || undefined, page, size };
  const query = useQuery({
    queryKey: employeeKeys.list(filters),
    queryFn: () => employeeApi.search(filters),
    placeholderData: (prev) => prev,
  });
  const remove = useMutation({
    mutationFn: (e: EmployeeSummary) => employeeApi.remove(e.id),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: employeeKeys.all });
      notify("Funcionário excluído.");
      setDeleting(null);
    },
    onError: (e) => {
      notify(errorMessage(e), "error");
      setDeleting(null);
    },
  });

  return (
    <>
      <PageHeader
        title="Funcionários"
        description={
          isGlobal(user.role)
            ? "Usuários de todas as unidades."
            : `Professores e gestores da ${user.institution?.name ?? "unidade"}.`
        }
        actions={
          manager && (
            <Button variant="contained" startIcon={<PersonAddAlt />} onClick={() => setCreating(true)}>
              Cadastrar
            </Button>
          )
        }
      />
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }} component="search" aria-label="Filtros">
        <Grid container spacing={1.5}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              size="small"
              label="Buscar por nome ou e-mail"
              value={text}
              onChange={(e) => setText(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              select
              size="small"
              label="Papel"
              value={role}
              onChange={(e) => {
                setRole(e.target.value as Role | "");
                setPage(0);
              }}
            >
              <MenuItem value="">Todos</MenuItem>
              {options(ROLE_LABELS).map((o) => (
                <MenuItem key={o.value} value={o.value}>
                  {o.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {query.isPending ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : query.data.totalElements === 0 ? (
        <EmptyState
          title="Nenhum funcionário encontrado"
          description="Ajuste a busca ou cadastre um novo funcionário."
        />
      ) : (
        <Paper variant="outlined">
          <TableContainer>
            <Table size="small" aria-label="Funcionários">
              <TableHead>
                <TableRow>
                  <TableCell>Nome</TableCell>
                  <TableCell>E-mail</TableCell>
                  <TableCell>Papel</TableCell>
                  {isGlobal(user.role) && <TableCell>Unidade</TableCell>}
                  <TableCell>Curso</TableCell>
                  <TableCell align="right">HAEs</TableCell>
                  {manager && <TableCell align="right">Ações</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {query.data.content.map((e) => {
                  const self = e.id === user.id;
                  const editable = manager && !self && assignableRoles(user.role).includes(e.role);
                  return (
                    <TableRow key={e.id} hover>
                      <TableCell>
                        {e.name}
                        {self && " (você)"}
                      </TableCell>
                      <TableCell>{e.email}</TableCell>
                      <TableCell>{ROLE_LABELS[e.role]}</TableCell>
                      {isGlobal(user.role) && <TableCell>{e.institutionName ?? "—"}</TableCell>}
                      <TableCell>{e.courseName ?? "—"}</TableCell>
                      <TableCell align="right">{e.haeCount}</TableCell>
                      {manager && (
                        <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                          <Tooltip title="Editar papel e curso">
                            <span>
                              <IconButton
                                aria-label={`Editar ${e.name}`}
                                disabled={!editable}
                                onClick={() => setEditing(e)}
                              >
                                <EditOutlined />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title={e.haeCount > 0 ? "Possui HAEs: não pode ser excluído" : "Excluir"}>
                            <span>
                              <IconButton
                                aria-label={`Excluir ${e.name}`}
                                disabled={!editable || e.haeCount > 0}
                                onClick={() => setDeleting(e)}
                              >
                                <DeleteOutline />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={query.data.totalElements}
            page={query.data.page}
            rowsPerPage={query.data.size}
            rowsPerPageOptions={[10, 20, 50]}
            onPageChange={(_, p) => setPage(p)}
            onRowsPerPageChange={(e) => {
              setSize(Number(e.target.value));
              setPage(0);
            }}
          />
        </Paper>
      )}

      <CreateDialog open={creating} onClose={() => setCreating(false)} />
      {editing && <EditDialog employee={editing} onClose={() => setEditing(null)} />}
      <ConfirmDialog
        open={deleting !== null}
        title="Excluir funcionário?"
        message={`A conta de ${deleting?.name ?? ""} será removida e ele(a) perderá o acesso.`}
        confirmLabel="Excluir"
        destructive
        loading={remove.isPending}
        onConfirm={() => deleting && remove.mutate(deleting)}
        onClose={() => setDeleting(null)}
      />
    </>
  );
}
