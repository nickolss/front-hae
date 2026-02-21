import { useEffect, useState, useCallback } from "react";
import { api } from "@/services";
import { CardHaeCoordenador } from "@/components/CardHaeCoordenador";
import { HaeResponseDTO } from "@/types/hae";
import { AppLayout } from "@/layouts";
import { CircularProgress, Typography } from "@mui/material";
import { useAuth } from "@/hooks/useAuth";
import {
  AdvancedFilterBar,
  AdvancedHaeFilters,
} from "@/components/AdvancedFilterBar";
import { AxiosError } from "axios";

const INITIAL_FILTERS: AdvancedHaeFilters = {
  institutionId: "",
  course: "",
  haeType: "",
  status: "",
  viewed: "",
};

export const AllHaes = () => {
  const { user, loading: userLoading } = useAuth();
  const [haes, setHaes] = useState<HaeResponseDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<AdvancedHaeFilters>(INITIAL_FILTERS);

  const fetchHaes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: { [key: string]: string | null } = {
        institutionId: filters.institutionId || null,
        course: filters.course || null,
        haeType: filters.haeType || null,
        status: filters.status || null,
        viewed: filters.viewed || null,
      };

      Object.keys(params).forEach((key) => {
        if (params[key] === null || params[key] === "") {
          delete params[key];
        }
      });

      const response = await api.get<HaeResponseDTO[]>("/hae/search", {
        params,
      });
      setHaes(response.data);
    } catch (err) {
      console.error("Erro ao buscar HAEs:", err);
      let errorMessage = "Falha ao buscar HAEs.";
      if (err instanceof AxiosError) {
        errorMessage = err.response?.data?.message || err.message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchHaes();
  }, [fetchHaes]);

  if (userLoading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <CircularProgress size={50} />
      </div>
    );
  }

  return (
    <AppLayout>
      <main className="col-start-2 row-start-2 p-4 md:p-8 overflow-auto bg-gray-50 pt-20 md:pt-4 h-full">
       <h2 className="subtitle font-semibold">Todas as HAEs do Sistema</h2>
        <Typography className="text-gray-600" mt={1}>
          Use os filtros abaixo para encontrar HAEs específicas em todo o
          sistema.
        </Typography>

        {/* Renderiza a barra de filtros avançados apenas para a role DEV */}
        {user?.role === "DEV" && (
          <AdvancedFilterBar
            filters={filters}
            onFilterChange={setFilters}
            onResetFilters={() => setFilters(INITIAL_FILTERS)}
          />
        )}

        {isLoading ? (
          <div className="flex justify-center py-10">
            <CircularProgress size={50} />
          </div>
        ) : error ? (
          <Typography color="error" className="text-center py-10">
            {error}
          </Typography>
        ) : haes.length === 0 ? (
          <p className="text-center text-gray-500 py-10">
            Nenhuma HAE encontrada com os filtros selecionados.
          </p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {haes.map((hae) => (
              <CardHaeCoordenador
                key={hae.id}
                id={hae.id}
                titulo={hae.projectTitle}
                curso={hae.course}
                descricao={hae.projectDescription}
                status={hae.status}
                professor={hae.professorName}
              />
            ))}
          </div>
        )}
      </main>
    </AppLayout>
  );
};
