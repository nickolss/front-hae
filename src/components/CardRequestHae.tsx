import { useNavigate } from "react-router-dom";
import { StatusBadge } from "@/components/StatusBadge";
import {
  PersonOutline,
  NotesOutlined,
  HourglassEmpty,
  SchoolOutlined,
} from "@mui/icons-material";

type CardHaeProps = {
  id: string;
  titulo: string;
  curso: string;
  descricao: string;
  status:
    | "PENDENTE"
    | "APROVADO"
    | "REPROVADO"
    | "COMPLETO"
    | "FECHAMENTO_SOLICITADO"
    | string;
  endDate: string;
  professor: string;
  onDelete: () => void;
  onEdit: () => void;
};

export const CardRequestHae = ({
  id,
  titulo,
  curso,
  descricao,
  status,
  endDate,
  professor,
  onDelete,
  onEdit,
}: CardHaeProps) => {
  const navigate = useNavigate();

  const canRequestClosure = () => {
    if (!endDate || status !== "APROVADO") {
      return false;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [year, month, day] = endDate.split("-").map(Number);
    const endDateTime = new Date(year, month - 1, day);
    endDateTime.setHours(0, 0, 0, 0);
    if (isNaN(endDateTime.getTime())) return false;
    const oneWeekBeforeEnd = new Date(endDateTime);
    oneWeekBeforeEnd.setDate(oneWeekBeforeEnd.getDate() - 7);
    return today >= oneWeekBeforeEnd;
  };

  const canEdit = () => {
    return status !== "COMPLETO";
  };

  const canDelete = () => {
    return status === "PENDENTE";
  };

  const handleRequestClosure = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/request-closure/${id}`, { state: { projectTitle: titulo } });
  };

  const handleVerMais = () => {
    navigate(`/hae/${id}`);
  };

  const cardClasses = `bg-white rounded-md shadow p-6 border flex flex-col h-72 cursor-pointer transition-shadow hover:shadow-lg ${
    status === "FECHAMENTO_SOLICITADO"
      ? "border-l-4 border-l-amber-500"
      : "border-gray-200"
  }`;

  return (
    <div onClick={handleVerMais} className={cardClasses}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 min-w-0 pr-4">
          <h2 className="text-xl font-semibold text-gray-800 truncate mb-1">
            {titulo}
          </h2>
        </div>
        <div className="flex-shrink-0">
          <StatusBadge status={status} isFullView={false} />
        </div>
      </div>

      <div className="flex-grow space-y-2 mb-4">
        <div className="flex items-center gap-1.5 text-sm text-gray-600">
          <SchoolOutlined sx={{ fontSize: "1.2rem", flexShrink: 0 }} />
          <span className="truncate">{curso}</span>
        </div>

        <div className="flex items-center gap-1.5 text-sm text-gray-600">
          <PersonOutline sx={{ fontSize: "1.2rem", flexShrink: 0 }} />
          <span className="truncate">{professor}</span>
        </div>

        <div className="flex items-start gap-1.5 text-sm text-gray-600">
          <NotesOutlined
            sx={{ fontSize: "1.2rem", marginTop: "2px", flexShrink: 0 }}
          />
          <p className="line-clamp-2 text-gray-700">{descricao}</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3 justify-end items-center mt-auto pt-4 border-t border-gray-100 h-14">
        {canRequestClosure() && (
          <button
            onClick={handleRequestClosure}
            className="btnFatec text-white uppercase hover:bg-red-900"
          >
            Solicitar Fechamento
          </button>
        )}

        {canEdit() && (
          <button
            className="btnFatec bg-gray-600 text-white uppercase hover:bg-gray-900"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
          >
            Editar
          </button>
        )}

        {canDelete() && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="btnFatec text-white uppercase hover:bg-red-900"
          >
            Excluir
          </button>
        )}

        {status === "FECHAMENTO_SOLICITADO" && (
          <div className="flex items-center gap-2 text-sm text-amber-600 font-semibold">
            <HourglassEmpty fontSize="small" />
            <span>Aguardando aprovação</span>
          </div>
        )}

        {status === "COMPLETO" && (
          <p className="text-sm text-gray-500">Esta HAE foi concluída.</p>
        )}
      </div>
    </div>
  );
};
