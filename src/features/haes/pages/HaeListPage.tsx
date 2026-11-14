import { useQuery } from "@tanstack/react-query";
import { Button, Tab, Tabs } from "@mui/material";
import { PageHeader } from "@/shared/components/PageHeader";
import { EmptyState, ErrorState, LoadingState } from "@/shared/components/States";
import { useUser } from "@/features/auth/session";
import { isGlobal, type HaeStatus } from "@/shared/domain/labels";
import { HaeFiltersBar } from "../components/HaeFiltersBar";
import { HaeTable } from "../components/HaeTable";
import { useHaeFilters } from "../components/useHaeFilters";
import { haeApi, haeKeys } from "../api";

const TABS: { label: string; status?: HaeStatus }[] = [
  { label: "Aguardando avaliação", status: "PENDENTE" },
  { label: "Fechamentos", status: "FECHAMENTO_SOLICITADO" },
  { label: "Aprovadas", status: "APROVADO" },
  { label: "Todas" },
];

/** Fila de trabalho da coordenação/direção: abas para as tarefas mais comuns + filtros avançados. */
export function HaeListPage() {
  const user = useUser();
  const { filters, update, clear } = useHaeFilters();
  const query = useQuery({
    queryKey: haeKeys.list("all", filters),
    queryFn: () => haeApi.search(filters),
    placeholderData: (prev) => prev,
  });
  const tab = Math.max(
    0,
    TABS.findIndex((t) => t.status === filters.status),
  );
  const global = isGlobal(user.role);

  return (
    <>
      <PageHeader
        title={global ? "Todas as HAEs" : "HAEs da unidade"}
        description={
          global ? "HAEs de todas as unidades." : `HAEs da ${user.institution?.name ?? "sua unidade"}.`
        }
      />
      <Tabs
        value={filters.status && tab === -1 ? false : tab}
        onChange={(_, i: number) => update({ status: TABS[i].status })}
        variant="scrollable"
        allowScrollButtonsMobile
        aria-label="Situação das HAEs"
        sx={{ mb: 2, borderBottom: 1, borderColor: "divider" }}
      >
        {TABS.map((t) => (
          <Tab key={t.label} label={t.label} />
        ))}
      </Tabs>
      <HaeFiltersBar
        filters={filters}
        onChange={update}
        onClear={clear}
        institutionId={user.institution?.id}
        showInstitution={global}
        showViewed
      />
      {query.isPending ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : query.data.totalElements === 0 ? (
        <EmptyState
          title="Nenhuma HAE por aqui"
          description={
            filters.status === "PENDENTE"
              ? "Não há HAEs aguardando avaliação. 🎉"
              : "Ajuste os filtros para ver outras HAEs."
          }
          action={<Button onClick={clear}>Limpar filtros</Button>}
        />
      ) : (
        <HaeTable
          page={query.data}
          showOwner
          onPageChange={(page) => update({ page })}
          onSizeChange={(size) => update({ size })}
        />
      )}
    </>
  );
}
