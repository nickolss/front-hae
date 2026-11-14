import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link as RouterLink } from "react-router";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { PageHeader } from "@/shared/components/PageHeader";
import { ErrorState, LoadingState } from "@/shared/components/States";
import { useUser } from "@/features/auth/session";
import { haeApi, haeKeys } from "@/features/haes/api";
import { HaeTable } from "@/features/haes/components/HaeTable";
import { institutionApi, institutionKeys } from "@/features/institutions/api";
import {
  STATUS_LABELS,
  TYPE_LABELS,
  canViewInstitution,
  isGlobal,
  type HaeStatus,
  type HaeType,
} from "@/shared/domain/labels";
import { currentSemester, plural, semesterOptions } from "@/shared/lib/format";
import { dashboardApi } from "./api";
import { BarChart, DoughnutChart } from "./Charts";

/** Mesmas cores semânticas do StatusChip (verde = aprovada, vermelho = reprovada…). */
const STATUS_COLORS: Record<HaeStatus, string> = {
  PENDENTE: "#78909c",
  APROVADO: "#2e7d32",
  REPROVADO: "#c62828",
  FECHAMENTO_SOLICITADO: "#ed6c02",
  COMPLETO: "#0277bd",
};

function Kpi({
  label,
  value,
  to,
  hint,
}: {
  label: string;
  value: number | string;
  to?: string;
  hint?: string;
}) {
  const content = (
    <CardContent>
      <Typography color="text.secondary" variant="body2">
        {label}
      </Typography>
      <Typography sx={{ fontSize: "2rem", fontWeight: 700, lineHeight: 1.2 }}>{value}</Typography>
      {hint && (
        <Typography variant="body2" color="text.secondary">
          {hint}
        </Typography>
      )}
    </CardContent>
  );
  return (
    <Card sx={{ height: "100%" }}>
      {to ? (
        <Box
          component={RouterLink}
          to={to}
          sx={{
            color: "inherit",
            textDecoration: "none",
            display: "block",
            "&:hover": { bgcolor: "action.hover" },
          }}
        >
          {content}
        </Box>
      ) : (
        content
      )}
    </Card>
  );
}

function ProfessorHome() {
  const user = useUser();
  const filters = { size: 5 };
  const recent = useQuery({ queryKey: haeKeys.list("mine", filters), queryFn: () => haeApi.mine(filters) });
  const pendingAction = useQuery({
    queryKey: haeKeys.list("mine", { status: "APROVADO", size: 1 }),
    queryFn: () => haeApi.mine({ status: "APROVADO", size: 1 }),
  });
  const rejected = useQuery({
    queryKey: haeKeys.list("mine", { status: "REPROVADO", size: 1 }),
    queryFn: () => haeApi.mine({ status: "REPROVADO", size: 1 }),
  });

  return (
    <>
      <PageHeader
        title={`Olá, ${user.name.split(" ")[0]}!`}
        description="Acompanhe suas HAEs e o que precisa da sua atenção."
        actions={
          <Button component={RouterLink} to="/haes/nova" variant="contained" startIcon={<AddIcon />}>
            Nova HAE
          </Button>
        }
      />
      <Stack spacing={2} sx={{ mb: 3 }}>
        {(rejected.data?.totalElements ?? 0) > 0 && (
          <Alert
            severity="error"
            action={
              <Button color="inherit" component={RouterLink} to="/minhas-haes?status=REPROVADO">
                Ver
              </Button>
            }
          >
            {plural(rejected.data!.totalElements, "HAE reprovada aguarda", "HAEs reprovadas aguardam")} seus
            ajustes.
          </Alert>
        )}
        {(pendingAction.data?.totalElements ?? 0) > 0 && (
          <Alert
            severity="info"
            action={
              <Button color="inherit" component={RouterLink} to="/minhas-haes?status=APROVADO">
                Ver
              </Button>
            }
          >
            {plural(pendingAction.data!.totalElements, "HAE aprovada", "HAEs aprovadas")}: ao concluir as
            atividades, envie o relatório de fechamento.
          </Alert>
        )}
      </Stack>
      <Typography variant="h2" sx={{ mb: 1.5 }}>
        Atualizadas recentemente
      </Typography>
      {recent.isPending ? (
        <LoadingState />
      ) : recent.isError ? (
        <ErrorState error={recent.error} onRetry={() => recent.refetch()} />
      ) : recent.data.totalElements === 0 ? (
        <Card>
          <CardContent>
            <Typography sx={{ mb: 2 }}>Você ainda não cadastrou nenhuma HAE.</Typography>
            <Button component={RouterLink} to="/haes/nova" variant="contained">
              Cadastrar minha primeira HAE
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <HaeTable
            page={recent.data}
            hidePagination
            onPageChange={() => undefined}
            onSizeChange={() => undefined}
          />
          <Button component={RouterLink} to="/minhas-haes" sx={{ mt: 1 }}>
            Ver todas as minhas HAEs
          </Button>
        </>
      )}
    </>
  );
}

function ManagerHome() {
  const user = useUser();
  const global = isGlobal(user.role);
  const [semester, setSemester] = useState(currentSemester());
  const [institutionId, setInstitutionId] = useState<string>(user.institution?.id ?? "");
  const institutions = useQuery({
    queryKey: institutionKeys.all,
    queryFn: institutionApi.list,
    enabled: global,
  });
  const dashboard = useQuery({
    queryKey: ["dashboard", institutionId, semester],
    queryFn: () => dashboardApi.get({ institutionId: institutionId || undefined, semester }),
    placeholderData: (prev) => prev,
  });

  const d = dashboard.data;
  const s = d?.stats;
  const limit = d?.weeklyHoursLimit ?? null;
  const usage = limit ? Math.min(100, Math.round(((s?.allocatedWeeklyHours ?? 0) / limit) * 100)) : null;

  return (
    <>
      <PageHeader
        title="Visão geral"
        description={
          global
            ? "Indicadores de todas as unidades."
            : `Indicadores da ${user.institution?.name ?? "unidade"}.`
        }
      />
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 3 }}>
        <TextField
          select
          size="small"
          label="Semestre"
          value={semester}
          onChange={(e) => setSemester(e.target.value)}
          sx={{ maxWidth: 240 }}
        >
          {semesterOptions().map((o) => (
            <MenuItem key={o.value} value={o.value}>
              {o.label}
            </MenuItem>
          ))}
        </TextField>
        {global && (
          <TextField
            select
            size="small"
            label="Unidade"
            value={institutionId}
            onChange={(e) => setInstitutionId(e.target.value)}
            sx={{ maxWidth: 320 }}
          >
            <MenuItem value="">Todas as unidades</MenuItem>
            {(institutions.data ?? []).map((i) => (
              <MenuItem key={i.id} value={i.id}>
                {i.name}
              </MenuItem>
            ))}
          </TextField>
        )}
      </Stack>

      {dashboard.isPending ? (
        <LoadingState />
      ) : dashboard.isError ? (
        <ErrorState error={dashboard.error} onRetry={() => dashboard.refetch()} />
      ) : (
        <Stack spacing={3}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6, md: 3 }}>
              <Kpi
                label="Aguardando avaliação"
                value={s!.byStatus.PENDENTE}
                to="/haes?status=PENDENTE"
                hint="Clique para avaliar"
              />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Kpi
                label="Fechamentos a avaliar"
                value={s!.byStatus.FECHAMENTO_SOLICITADO}
                to="/haes?status=FECHAMENTO_SOLICITADO"
              />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Kpi label="HAEs no semestre" value={s!.totalHaes} to={`/haes?semester=${semester}`} />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Kpi label="Funcionários" value={s!.employees} to="/funcionarios" />
            </Grid>
          </Grid>

          {usage !== null && (
            <Card>
              <CardContent>
                <Typography variant="h2" sx={{ mb: 1 }}>
                  Horas alocadas no semestre
                </Typography>
                <Typography sx={{ mb: 1 }}>
                  <strong>{s!.allocatedWeeklyHours} h</strong> de {limit} h semanais ({usage}%)
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={usage}
                  color={usage >= 90 ? "error" : usage >= 70 ? "warning" : "primary"}
                  aria-label="Percentual do limite de horas utilizado"
                  sx={{ height: 10, borderRadius: 5 }}
                />
              </CardContent>
            </Card>
          )}

          {s!.totalHaes > 0 && (
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Card sx={{ height: "100%" }}>
                  <CardContent>
                    <Typography variant="h2" sx={{ mb: 2 }}>
                      Por situação
                    </Typography>
                    <DoughnutChart
                      caption="HAEs por situação"
                      colors={(Object.keys(s!.byStatus) as HaeStatus[]).map((k) => STATUS_COLORS[k])}
                      data={(Object.keys(s!.byStatus) as HaeStatus[]).map((k) => ({
                        label: STATUS_LABELS[k],
                        value: s!.byStatus[k],
                      }))}
                    />
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Card sx={{ height: "100%" }}>
                  <CardContent>
                    <Typography variant="h2" sx={{ mb: 2 }}>
                      Por tipo
                    </Typography>
                    <DoughnutChart
                      caption="HAEs por tipo"
                      data={(Object.keys(s!.byType) as HaeType[]).map((k) => ({
                        label: TYPE_LABELS[k],
                        value: s!.byType[k],
                      }))}
                    />
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h2" sx={{ mb: 2 }}>
                      Por curso
                    </Typography>
                    <BarChart
                      caption="HAEs por curso"
                      data={Object.entries(s!.byCourse).map(([label, value]) => ({ label, value }))}
                    />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </Stack>
      )}
    </>
  );
}

export function HomePage() {
  const user = useUser();
  return canViewInstitution(user.role) ? <ManagerHome /> : <ProfessorHome />;
}
