import { CardHae } from "@components/CardHae";
import { useEffect, useState } from "react";
import { api } from "@/services";
import { Employee } from "@/types/employee";
import { Hae } from "@/types/hae";
import { AppLayout } from "@/layouts";
import { CircularProgress } from "@mui/material";

export const Dashboard = () => {
  const [haes, setHaes] = useState<Hae[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHaes = async () => {
      setLoading(true);
      try {
        const email = localStorage.getItem("email");
        if (!email) {
          throw new Error("E-mail não encontrado no localStorage");
        }
        const userResponse = await api.get<Employee>(
          `/employee/get-professor?email=${email}`
        );
        const professorId = userResponse.data.id;
        const haeResponse = await api.get<Hae[]>(
          `/hae/getHaesByProfessor/${professorId}`
        );
        setHaes(haeResponse.data);
      } catch (err: unknown) {
        console.error("Erro ao carregar HAEs do professor:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHaes();
  }, []);

  return (
    <AppLayout>
      <main className="main-content col-start-2 row-start-2 p-4 md:p-8 overflow-auto bg-gray-50 pt-20 md:pt-4 h-full">
        <h2 className="subtitle font-semibold">Visão Geral das Minhas HAEs</h2>
        <p className="text-gray-600 mb-6">
          Aqui você encontra a lista das suas HAEs solicitadas e o status de
          cada uma.
        </p>

        {loading && (
          <div className="h-screen flex justify-center items-center ">
            <CircularProgress
              size={70}
              sx={{
                "& .MuiCircularProgress-circle": {
                  stroke: "#c10007",
                },
              }}
            />
          </div>
        )}

        {!loading && haes.length === 0 && (
          <p className="mt-4 text-gray-500">
            Você ainda não solicitou nenhuma HAE.
          </p>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {haes.map((hae) => (
            <CardHae
              key={hae.id}
              id={hae.id}
              titulo={hae.projectTitle}
              curso={hae.course}
              descricao={hae.projectDescription}
              status={hae.status}
            />
          ))}
        </div>
      </main>
    </AppLayout>
  );
};
