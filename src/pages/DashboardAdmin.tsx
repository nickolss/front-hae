import { useEffect, useState, useCallback } from "react";
import { api } from "@/services";
import { HaeResponseDTO } from "@/types/hae";
import { CardHaeAdmin } from "@/components/CardHaeAdmin";
import { AppLayout } from "@/layouts";
import { CircularProgress, Typography } from "@mui/material";
import { useAuth } from "@/hooks/useAuth";
import { AxiosError } from "axios";
import { HaeFilterBar, HaeFilters } from "@/components/HaeFilterBar";

const INITIAL_FILTERS: HaeFilters = {
  course: "",
  haeType: "",
  status: "",
  viewed: "",
};

export const DashboardAdmin = () => {
  const { user, loading: userLoading } = useAuth();
  const [haes, setHaes] = useState<HaeResponseDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<HaeFilters>(INITIAL_FILTERS);

  const fetchHaes = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const params: { [key: string]: string | null } = {
        institutionId: user.institution.id,
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

      const sortedHaes = response.data.sort(
        (a, b) => Number(a.viewed) - Number(b.viewed)
      );
      setHaes(sortedHaes);
    } catch (err) {
      console.error("Erro ao buscar HAEs:", err);
      let errorMessage = "Ocorreu uma falha ao buscar os dados.";
      if (err instanceof AxiosError) {
        errorMessage = err.response?.data?.message || err.message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [user, filters]);

  useEffect(() => {
    if (!userLoading) {
      fetchHaes();
    }
  }, [userLoading, fetchHaes]);

  const handleToggleViewed = async (haeId: string) => {
    const originalHaes = [...haes];
    const updatedHaes = haes
      .map((h) => (h.id === haeId ? { ...h, viewed: !h.viewed } : h))
      .sort((a, b) => Number(a.viewed) - Number(b.viewed));
    setHaes(updatedHaes);

    try {
      await api.put(`/hae/viewed/toggle/${haeId}`);
    } catch (error) {
      console.error("Falha ao atualizar o status de visualização:", error);
      setHaes(originalHaes);

      let errorMessage =
        "Não foi possível atualizar o status da HAE. Tente novamente.";
      if (error instanceof AxiosError) {
        errorMessage = error.response?.data?.message || errorMessage;
      }

      setError(errorMessage);
    }
  };

  if (userLoading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <CircularProgress size={70} sx={{ color: "#c10007" }} />
      </div>
    );
  }

  return (
    <AppLayout>
      <main className="col-start-2 row-start-2 p-4 md:p-6 lg:p-8 overflow-auto pt-20 md:pt-4 h-full">
        <h2 className="subtitle font-semibold">Visão Geral das HAEs (Admin)</h2>
        <p>
          Abaixo estão listadas todas as HAEs da sua instituição:{" "}
          {user?.institution.name}.
        </p>

        <HaeFilterBar
          filters={filters}
          onFilterChange={setFilters}
          onResetFilters={() => setFilters(INITIAL_FILTERS)}
        />

        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <CircularProgress size={50} sx={{ color: "#c10007" }} />
          </div>
        ) : error ? (
          <Typography color="error" className="text-center py-10">
            {error}
          </Typography>
        ) : haes.length === 0 ? (
          <Typography className="text-center text-gray-500 py-10">
            Nenhuma HAE encontrada com os filtros selecionados.
          </Typography>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {haes.map((hae) => (
              <CardHaeAdmin
                key={hae.id}
                id={hae.id}
                titulo={hae.projectTitle}
                curso={hae.course}
                descricao={hae.projectDescription}
                status={hae.status}
                professor={hae.professorName}
                viewed={hae.viewed}
                onViewedChange={() => handleToggleViewed(hae.id)}
              />
            ))}
          </div>
        )}
      </main>
    </AppLayout>
  );
};
