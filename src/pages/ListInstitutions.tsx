import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { MobileHeader } from "@/components/MobileHeader";
import { Drawer, LinearProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components";
import { api } from "@/services";

interface Institution {
  id: string;
  name: string;
  institutionCode: number;
  address: string;
}

export const ListInstitutions = () => {
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInstitutions = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get<Institution[]>(
          "/institution/getAll"
        );
        setInstitutions(response.data);
      } catch (err) {
        console.error("Erro ao buscar instituições:", err);
        setError("Não foi possível carregar a lista de instituições.");
      } finally {
        setLoading(false);
      }
    };
    fetchInstitutions();
  }, []);

  return (
    <div className="h-screen flex flex-col md:grid md:grid-cols-[22%_78%] md:grid-rows-[auto_1fr]">
      <div className="hidden md:block row-span-2">
        <Sidebar />
      </div>
      <div className="md:hidden">
        <MobileHeader onMenuClick={() => setDrawerOpen(true)} />
      </div>
      <Drawer open={isDrawerOpen} onClose={() => setDrawerOpen(false)}>
        <div className="w-64 h-full bg-gray-fatec">
          <Sidebar />
        </div>
      </Drawer>
      <div className="hidden md:block col-start-2 row-start-1">
        <Header />
      </div>

      <main className="col-start-2 row-start-2 p-4 md:p-8 overflow-auto bg-gray-50 pt-20 md:pt-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="subtitle">Gerenciar Instituições</h2>
            <p className="text-gray-600">
              Visualize e edite as instituições cadastradas no sistema.
            </p>
          </div>

          <button
            color="error"
            className="btnFatec  text-white uppercase hover:bg-red-900"
            onClick={() => navigate("/create-institution")}
          >
            Adicionar Nova Instituição
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Código
                </th>
                <th scope="col" className="px-6 py-3">
                  Nome da Instituição
                </th>
                <th scope="col" className="px-6 py-3">
                  Endereço
                </th>
                <th scope="col" className="px-6 py-3">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center p-6">
                    <LinearProgress
                      sx={{
                        "& .MuiLinearProgress-bar": {
                          backgroundColor: "#c10007",
                        },
                      }}
                    />
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={4} className="text-center p-6 text-red-500">
                    {error}
                  </td>
                </tr>
              ) : (
                institutions.map((inst) => (
                  <tr
                    key={inst.id}
                    className="bg-white border-b hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 font-mono text-gray-700">
                      {inst.institutionCode}
                    </td>
                    <th
                      scope="row"
                      className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                    >
                      {inst.name}
                    </th>
                    <td className="px-6 py-4">{inst.address}</td>
                    <td className=" py-4 text-left">
                      <button
                        onClick={() => navigate(`/institution/edit/${inst.institutionCode}`)}
                        className="btnFatec text-white uppercase hover:bg-red-900"
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};
