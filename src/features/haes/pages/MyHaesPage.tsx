import { useQuery } from "@tanstack/react-query";
import { Link as RouterLink } from "react-router";
import { Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { PageHeader } from "@/shared/components/PageHeader";
import { EmptyState, ErrorState, LoadingState } from "@/shared/components/States";
import { HaeFiltersBar } from "../components/HaeFiltersBar";
import { HaeTable } from "../components/HaeTable";
import { useHaeFilters } from "../components/useHaeFilters";
import { haeApi, haeKeys } from "../api";

export function MyHaesPage() {
  const { filters, update, clear } = useHaeFilters();
  const query = useQuery({
    queryKey: haeKeys.list("mine", filters),
    queryFn: () => haeApi.mine(filters),
    placeholderData: (prev) => prev,
  });
  const filtered = Boolean(filters.q || filters.status || filters.type || filters.semester);

  return (
    <>
      <PageHeader
        title="Minhas HAEs"
        description="Acompanhe a situação das suas HAEs e envie os relatórios de fechamento."
        actions={
          <Button component={RouterLink} to="/haes/nova" variant="contained" startIcon={<AddIcon />}>
            Nova HAE
          </Button>
        }
      />
      <HaeFiltersBar filters={filters} onChange={update} onClear={clear} />
      {query.isPending ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : query.data.totalElements === 0 ? (
        <EmptyState
          title={filtered ? "Nenhuma HAE encontrada com esses filtros" : "Você ainda não tem HAEs"}
          description={
            filtered
              ? "Ajuste ou limpe os filtros."
              : "Cadastre sua primeira HAE para enviá-la à coordenação."
          }
          action={
            filtered ? (
              <Button onClick={clear}>Limpar filtros</Button>
            ) : (
              <Button component={RouterLink} to="/haes/nova" variant="contained">
                Cadastrar HAE
              </Button>
            )
          }
        />
      ) : (
        <HaeTable
          page={query.data}
          onPageChange={(page) => update({ page })}
          onSizeChange={(size) => update({ size })}
        />
      )}
    </>
  );
}
