import { useEffect, useState, useCallback } from "react";
import { api } from "@/services";
import { CardHaeCoordenador } from "../components/CardHaeCoordenador";
import { useAuth } from "@/hooks/useAuth";
import { CircularProgress } from "@mui/material";
import { HaeResponseDTO } from "@/types/hae";
import { AppLayout } from "@/layouts";
import { AxiosError } from "axios";

export const DashboardCoordenador = () => {
  const [haes, setHaes] = useState<HaeResponseDTO[]>([]);
  const [isLoadingHaes, setIsLoadingHaes] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user, loading: isLoadingUser } = useAuth();
  
  const fetchHaesByCourse = useCallback(async () => {
    if (!user || !user.course) return;

    setIsLoadingHaes(true);
    setError(null);
    try {
      const courseName = encodeURIComponent(user.course);
      const haeResponse = await api.get<HaeResponseDTO[]>(
        `/hae/getHaesByCourse/${courseName}`
      );

      setHaes(haeResponse.data);
    } catch (err) {
      console.error("Erro ao buscar HAEs por curso:", err);
      let errorMessage = "Não foi possível carregar as HAEs do seu curso.";
      if (err instanceof AxiosError) {
        errorMessage = err.response?.data?.message || errorMessage;
      }
      setError(errorMessage);
    } finally {
      setIsLoadingHaes(false);
    }
  }, [user]);

  useEffect(() => {
    if (!isLoadingUser) {
      fetchHaesByCourse();
    }
  }, [isLoadingUser, fetchHaesByCourse]);

  if (isLoadingUser || isLoadingHaes) {
    return (
      <div className="h-screen flex justify-center items-center">
        <CircularProgress
          size={70}
          sx={{
            "& .MuiCircularProgress-circle": {
              stroke: "#c10007",
            },
          }}
        />
      </div>
    );
  }

  return (
    <AppLayout>
      <main className="col-start-2 row-start-2 p-4 md:p-6 lg:p-8 overflow-auto pt-20 md:pt-4 h-full">
        <h2 className="subtitle font-semibold">
          Visão Geral das HAEs ({user?.course})
        </h2>
        <p className="max-w-3xl mb-6">
          Abaixo estão listadas todas as HAEs submetidas pelos professores do
          seu curso. Acompanhe o andamento e gerencie as aprovações.
        </p>

        {error && <p className="mt-4 text-red-500 font-semibold">{error}</p>}

        {!error && haes.length === 0 ? (
          <p className="mt-6 text-gray-500">
            Nenhuma HAE encontrada para o seu curso no momento.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
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
