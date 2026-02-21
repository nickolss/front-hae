import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/services";
import { AppLayout } from "@/layouts";
import { HaeDetailDTO } from "@/types/hae";
import {
  CircularProgress,
  Alert,
  Divider,
  Typography,
} from "@mui/material";
import {
  ArrowBack,
  CheckCircleOutlined,
  SchoolOutlined,
  PersonOutline,
  NotesOutlined,
  InfoOutlined,
} from "@mui/icons-material";
import { AxiosError } from "axios";

const DetailItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  className?: string;
}> = ({ icon, label, value, className = "" }) => (
  <div className={`flex flex-col gap-1 ${className}`}>
    <div className="flex items-center gap-2 text-sm text-gray-500">
      {icon}
      <span>{label}</span>
    </div>
    <div className="text-gray-800 text-base">{value}</div>
  </div>
);

export const ViewClosureRequest = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [hae, setHae] = useState<HaeDetailDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHae = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const response = await api.get<HaeDetailDTO>(`/hae/getHaeById/${id}`);
        setHae(response.data);
      } catch (err) {
        console.error("Erro ao buscar HAE:", err);
        if (err instanceof AxiosError) {
          setError(err.response?.data?.message || "Falha ao carregar os dados da HAE.");
        } else {
          setError("Falha ao carregar os dados da HAE.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchHae();
  }, [id]);

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Data inválida";
      return date.toLocaleDateString(undefined, { timeZone: "UTC" });
    } catch (error) {
      console.error("Erro ao formatar data:", error);
      return dateString;
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <main className="col-start-2 row-start-2 p-4 md:p-8 flex items-center justify-center h-full">
          <CircularProgress
            size={70}
            sx={{ "& .MuiCircularProgress-circle": { stroke: "#c10007" } }}
          />
        </main>
      </AppLayout>
    );
  }

  if (error || !hae) {
    return (
      <AppLayout>
        <main className="col-start-2 row-start-2 p-4 md:p-8">
          <Alert severity="error">{error || "HAE não encontrada"}</Alert>
        </main>
      </AppLayout>
    );
  }

  // Verificar se há solicitação de fechamento
  const hasClosureRequest = hae.status === "FECHAMENTO_SOLICITADO" || hae.status === "COMPLETO";
  const hasClosureData = 
    hae.tccRole || 
    hae.tccStudentCount || 
    hae.tccStudentNames || 
    hae.tccApprovedStudents || 
    hae.tccProjectInfo ||
    hae.estagioStudentInfo ||
    hae.estagioApprovedStudents ||
    hae.apoioType ||
    hae.apoioGeralDescription ||
    hae.apoioApprovedStudents ||
    hae.apoioCertificateStudents;

  return (
    <AppLayout>
      <main className="col-start-2 row-start-2 p-4 md:p-8 overflow-auto bg-gray-50 pt-20 md:pt-4 h-full">
        <div className="mb-6">
          <button
            onClick={() => navigate("/approved-haes")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowBack />
            <span>Voltar para HAEs Aprovadas</span>
          </button>
          <h1 className="subtitle font-semibold">Solicitação de Fechamento</h1>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 pb-4 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{hae.projectTitle}</h2>
              <p className="text-gray-500">Solicitado por: {hae.professorName ?? "N/A"}</p>
            </div>
            <div className="flex items-center gap-2">
              {hasClosureRequest ? (
                <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full flex items-center gap-1">
                  <CheckCircleOutlined sx={{ fontSize: "1rem" }} />
                  {hae.status === "FECHAMENTO_SOLICITADO" ? "Fechamento Solicitado" : "Completo"}
                </span>
              ) : (
                <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                  APROVADO
                </span>
              )}
            </div>
          </div>

          <div className="pt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
            <DetailItem
              icon={<SchoolOutlined />}
              label="Curso"
              value={hae.course}
            />
            <DetailItem
              icon={<PersonOutline />}
              label="Professor"
              value={hae.professorName}
            />
            <DetailItem
              icon={<InfoOutlined />}
              label="Tipo de Projeto"
              value={hae.projectType}
            />
            <DetailItem
              icon={<InfoOutlined />}
              label="Data de Início"
              value={formatDate(hae.startDate)}
            />
            <DetailItem
              icon={<InfoOutlined />}
              label="Data de Término"
              value={formatDate(hae.endDate)}
            />
          </div>

          <div className="pt-6">
            <Divider />
            <DetailItem
              icon={<NotesOutlined />}
              label="Descrição do Projeto"
              value={<p className="whitespace-pre-wrap">{hae.projectDescription}</p>}
              className="pt-6"
            />
          </div>

          {/* Informações de Fechamento */}
          {hasClosureData && (
            <div className="pt-6">
              <Divider />
              <div className="pt-6">
                <Typography variant="h6" className="font-semibold mb-4">
                  Informações de Fechamento
                </Typography>

                {hae.projectType === "TCC" && (
                  <div className="space-y-4">
                    {hae.tccRole && (
                      <DetailItem
                        icon={<InfoOutlined />}
                        label="Função"
                        value={hae.tccRole === "orientou" ? "Orientou" : "Apenas ajudou"}
                      />
                    )}
                    {hae.tccStudentCount && (
                      <DetailItem
                        icon={<InfoOutlined />}
                        label="Quantidade de Alunos"
                        value={hae.tccStudentCount}
                      />
                    )}
                    {hae.tccStudentNames && (
                      <DetailItem
                        icon={<InfoOutlined />}
                        label="Nomes dos Alunos"
                        value={<p className="whitespace-pre-wrap">{hae.tccStudentNames}</p>}
                      />
                    )}
                    {hae.tccApprovedStudents && (
                      <DetailItem
                        icon={<InfoOutlined />}
                        label="Alunos Aprovados"
                        value={<p className="whitespace-pre-wrap">{hae.tccApprovedStudents}</p>}
                      />
                    )}
                    {hae.tccProjectInfo && (
                      <DetailItem
                        icon={<InfoOutlined />}
                        label="Informações do(s) Projeto(s)"
                        value={<p className="whitespace-pre-wrap">{hae.tccProjectInfo}</p>}
                      />
                    )}
                  </div>
                )}

                {hae.projectType === "Estagio" && (
                  <div className="space-y-4">
                    {hae.estagioStudentInfo && (
                      <DetailItem
                        icon={<InfoOutlined />}
                        label="Informações dos Alunos Atendidos"
                        value={<p className="whitespace-pre-wrap">{hae.estagioStudentInfo}</p>}
                      />
                    )}
                    {hae.estagioApprovedStudents && (
                      <DetailItem
                        icon={<InfoOutlined />}
                        label="Alunos Aprovados"
                        value={<p className="whitespace-pre-wrap">{hae.estagioApprovedStudents}</p>}
                      />
                    )}
                  </div>
                )}

                {hae.projectType === "ApoioDirecao" && (
                  <div className="space-y-4">
                    {hae.apoioType && (
                      <DetailItem
                        icon={<InfoOutlined />}
                        label="Tipo de Apoio"
                        value={hae.apoioType === "geral" ? "Geral" : "Curso"}
                      />
                    )}
                    {hae.apoioGeralDescription && (
                      <DetailItem
                        icon={<InfoOutlined />}
                        label="Descrição Geral"
                        value={<p className="whitespace-pre-wrap">{hae.apoioGeralDescription}</p>}
                      />
                    )}
                    {hae.apoioApprovedStudents && (
                      <DetailItem
                        icon={<InfoOutlined />}
                        label="Alunos Aprovados"
                        value={<p className="whitespace-pre-wrap">{hae.apoioApprovedStudents}</p>}
                      />
                    )}
                    {hae.apoioCertificateStudents && (
                      <DetailItem
                        icon={<InfoOutlined />}
                        label="Alunos com Certificado"
                        value={<p className="whitespace-pre-wrap">{hae.apoioCertificateStudents}</p>}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {!hasClosureData && hae.status === "APROVADO" && (
            <div className="pt-6">
              <Divider />
              <div className="pt-6">
                <Alert severity="info">
                  Esta HAE ainda não possui solicitação de fechamento. O professor pode solicitar o fechamento quando a data de término estiver próxima.
                </Alert>
              </div>
            </div>
          )}

          <div className="flex justify-end mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={() => navigate("/approved-haes")}
              className="btnFatec bg-gray-600 text-white uppercase hover:bg-gray-900 flex items-center gap-2"
            >
              <ArrowBack sx={{ fill: "white", width: 19 }} />
              Voltar
            </button>
          </div>
        </div>
      </main>
    </AppLayout>
  );
};

