import { useNavigate } from "react-router-dom";
import { SchoolOutlined } from "@mui/icons-material";
import { StatusBadge } from "@components/StatusBadge";
import { Button } from "@mui/material";

type CardHaeProps = {
  id: string;
  titulo: string;
  curso: string;
  status: "PENDENTE" | "APROVADO" | "REPROVADO" | "COMPLETO" | string;
  descricao: string;
};

export const CardHae = ({
  id,
  titulo,
  curso,
  status,
  descricao,
}: CardHaeProps) => {
  const navigate = useNavigate();

  const handleVerMais = () => {
    navigate(`/hae/${id}`);
  };

  return (
    <div
      onClick={handleVerMais}
      className="bg-white shadow-md rounded-lg border border-gray-200 p-5 flex flex-col gap-4 hover:shadow-lg transition-shadow duration-300"
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 leading-tight">
            {titulo}
          </h3>
        </div>
        <StatusBadge status={status} isFullView={false} />
      </div>

      <div className="flex-grow">
        <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-2">
          <SchoolOutlined sx={{ fontSize: "1rem" }} />
          <span>{curso}</span>
        </div>
        <p className="text-gray-700 text-sm line-clamp-2" title={descricao}>
          {descricao}
        </p>
      </div>

      <div className="mt-auto pt-4 flex justify-end border-t border-gray-100">
        <Button
          onClick={handleVerMais}
          sx={{
            bgcolor: "#c10007",
            color: "white",
            "&:hover": {
              bgcolor: "#a30006",
            },
          }}
        >
          Ver Detalhes
        </Button>
      </div>
    </div>
  );
};
