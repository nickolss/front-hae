import { useEffect, useState } from "react";
import { api } from "@/services";
import { EmployeeSummary } from "@/types/employee";
import { AppLayout } from "@/layouts";
import { LinearProgress } from "@mui/material";

export const Professores = () => {
  const [professores, setProfessores] = useState<EmployeeSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfessores = async () => {
      try {
        const response = await api.get<EmployeeSummary[]>(
          "employee/getAllByRole/PROFESSOR"
        );
        setProfessores(response.data);
      } catch (err) {
        console.error("Erro ao buscar professores:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfessores();
  }, []);

  return (
    <AppLayout>
      <main className="col-start-2 row-start-2 p-4 md:p-8 overflow-auto bg-gray-50 pt-20 md:pt-4 h-full">
        <h2 className="subtitle font-semibold">Visão Geral de Professores</h2>
        <p className="text-gray-600 mb-6">
          Lista de todos os professores cadastrados e suas atividades.
        </p>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Nome
                </th>
                <th scope="col" className="px-6 py-3">
                  E-mail
                </th>
                <th scope="col" className="px-6 py-3">
                  Curso
                </th>
                <th scope="col" className="px-6 py-3">
                  HAEs Ativas
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center p-4">
                    <LinearProgress
                      sx={{
                        "& .MuiLinearProgress-bar": {
                          backgroundColor: "#c10007",
                        },
                      }}
                    />
                  </td>
                </tr>
              ) : (
                professores.map((prof) => (
                  <tr
                    key={prof.id}
                    className="bg-white border-b hover:bg-gray-50"
                  >
                    <th
                      scope="row"
                      className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                    >
                      {prof.name}
                    </th>
                    <td className="px-6 py-4">{prof.email}</td>
                    <td className="px-6 py-4">{prof.course}</td>
                    <td className="px-6 py-4 text-center">{prof.haeCount}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </AppLayout>
  );
};
