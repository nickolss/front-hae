import { useEffect, useState } from "react";
import { api } from "@/services";
import { CardHaeCoordenador } from "@/components/CardHaeCoordenador";
import { HaeResponseDTO } from "@/types/hae";
import { AppLayout } from "@/layouts";
import { CircularProgress } from "@mui/material";
import { useAuth } from "@/hooks/useAuth";

export const AllHaesByInstitution = () => {
  const { user, loading: userLoading } = useAuth();
  
  const [haes, setHaes] = useState<HaeResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      return;
    }

    const fetchHaes = async () => {
      try {
        setLoading(true);
        const institutionId = user.institution.id;

        const response = await api.get<HaeResponseDTO[]>(`/hae/institution/${institutionId}`);
        setHaes(response.data);
      } catch (err) {
        console.error("Erro ao buscar HAEs da instituição:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHaes();
  }, [user]);

  if (userLoading || loading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <CircularProgress
          size={50}
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
      <main className="col-start-2 row-start-2 p-4 md:p-8 overflow-auto bg-gray-50 pt-20 md:pt-4 h-full">
        <h2 className="subtitle font-semibold">Todas as HAEs da Instituição</h2>
        <p className="text-gray-600 mb-6">
          Lista completa de todas as HAEs cadastradas para a instituição: {user?.institution.name}.
        </p>

        {haes.length === 0 ? (
          <p className="text-center text-gray-500 py-10">
            Nenhuma HAE cadastrada para esta instituição.
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