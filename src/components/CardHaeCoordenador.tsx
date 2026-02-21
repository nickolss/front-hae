import { useNavigate } from "react-router-dom";
import {
  SchoolOutlined,
  PersonOutline,
  NotesOutlined,
} from "@mui/icons-material";
import { StatusBadge } from "@components/StatusBadge";
import { Button } from "@mui/material";

type CardHaeProps = {
  id: string;
  titulo: string;
  curso: string;
  status: "PENDENTE" | "APROVADO" | "REPROVADO" | "COMPLETO" | string;
  descricao: string;
  professor: string;
};

export const CardHaeCoordenador = ({
  id,
  titulo,
  curso,
  status,
  descricao,
  professor,
}: CardHaeProps) => {
  const navigate = useNavigate();
  const handleVerMais = () => navigate(`/hae/${id}`);

  return (
    <div
      onClick={handleVerMais}
      className="bg-white shadow-md rounded-lg border border-gray-200 p-5 flex flex-col gap-4 hover:shadow-xl hover:border-blue-400 transition-all duration-300 cursor-pointer"
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-900 leading-tight truncate">
            {titulo}
          </h3>
        </div>
        <div className="flex-shrink-0">
          <StatusBadge status={status} isFullView={false} />
        </div>
      </div>

      <div className="flex-grow">
        <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-2">
          <PersonOutline sx={{ fontSize: "1.2rem", flexShrink: 0 }} />
          <span className="truncate">{professor}</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-2">
          <SchoolOutlined sx={{ fontSize: "1.2rem", flexShrink: 0 }} />
          <span className="truncate">{curso}</span>
        </div>
        <div className="flex items-start gap-1.5 text-sm text-gray-600">
          <NotesOutlined
            sx={{ fontSize: "1.2rem", marginTop: "2px", flexShrink: 0 }}
          />
          <p className="line-clamp-2 text-gray-700">{descricao}</p>
        </div>
      </div>

      <div className="mt-auto pt-4 flex justify-end border-t border-gray-200">
        <Button
          onClick={(e) => {
            e.stopPropagation();
            handleVerMais();
          }}
          sx={{
            bgcolor: "#c10007",
            color: "white",
            "&:hover": { bgcolor: "#a30006" },
          }}
        >
          Ver mais detalhes
        </Button>
      </div>
    </div>
  );
};
