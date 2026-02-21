import { useEffect, useState } from "react";
import { CardRequestHae } from "@components/CardRequestHae";
import { api } from "@/services";
import { Employee } from "@/types/employee";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
} from "@mui/material";
import { HaeResponseDTO } from "@/types/hae";
import { AppLayout } from "@/layouts";
import { useNavigate } from "react-router-dom";

export const MyRequests = () => {
  const [haes, setHaes] = useState<HaeResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [haeToDelete, setHaeToDelete] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchHaes = async () => {
      try {
        setLoading(true);
        const email = localStorage.getItem("email");
        if (!email) {
          setError("Usuário não autenticado.");
          setLoading(false);
          return;
        }

        const userResponse = await api.get<Employee>(
          `/employee/get-professor?email=${email}`
        );
        const professorId = userResponse.data.id;

        const haeResponse = await api.get<HaeResponseDTO[]>(
          `/hae/getHaesByProfessor/${professorId}`
        );

        setHaes(haeResponse.data);
      } catch (err: unknown) {
        console.error(err);
        setError("Erro ao carregar as HAEs");
      } finally {
        setLoading(false);
      }
    };
    fetchHaes();
  }, []);

  const openDeleteDialog = (id: string) => {
    setHaeToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setHaeToDelete(null);
    setIsDeleteDialogOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (!haeToDelete) return;
    try {
      await api.delete(`/hae/delete/${haeToDelete}`);
      setHaes((prev) => prev.filter((hae) => hae.id !== haeToDelete));
    } catch (error) {
      console.error("Erro ao deletar HAE:", error);
      alert("Não foi possível deletar a solicitação.");
    } finally {
      closeDeleteDialog();
    }
  };

  const handleEdit = (haeId: string) => {
    navigate(`/requestHae`, { state: { haeId: haeId } });
  };

  return (
    <AppLayout>
      <main className="col-start-2 row-start-2 p-4 md:p-6 overflow-auto pt-20 md-pt-4">
        <h2 className="subtitle font-semibold">Minhas Solicitações</h2>
        <p className="max-w-3xl mb-6">
          Acompanhe o andamento de todas as suas solicitações de HAEs. Você pode
          editar ou excluir atividades pendentes, e solicitar o fechamento de
          HAEs aprovadas.
        </p>

        {loading && (
          <div className="flex justify-center items-center py-10">
            <CircularProgress
              size={70}
              sx={{ "& .MuiCircularProgress-circle": { stroke: "#c10007" } }}
            />
          </div>
        )}
        {error && <p className="text-red-500 text-center">{error}</p>}
        {!loading && haes.length === 0 && (
          <p className="mt-4 text-center text-gray-500">
            Você ainda não possui nenhuma solicitação.
          </p>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {haes.map((hae) => (
            <CardRequestHae
              key={hae.id}
              id={hae.id}
              titulo={hae.projectTitle}
              curso={hae.course}
              descricao={hae.projectDescription}
              status={hae.status}
              endDate={hae.endDate}
              professor={hae.professorName}
              onDelete={() => openDeleteDialog(hae.id)}
              onEdit={() => handleEdit(hae.id)}
            />
          ))}
        </div>
      </main>

      <Dialog
        open={isDeleteDialogOpen}
        onClose={closeDeleteDialog}
        aria-labelledby="alert-dialog-title"
      >
        <DialogTitle id="alert-dialog-title" className="font-semibold subtitle">
          {"Confirmar Exclusão"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Você tem certeza que deseja excluir esta solicitação de HAE? Esta
            ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <button
            className="btnFatec bg-gray-600 text-white uppercase hover:bg-gray-900"
            onClick={closeDeleteDialog}
          >
            Cancelar
          </button>
          <button
            className="btnFatec text-white uppercase hover:bg-red-900"
            onClick={handleDeleteConfirm}
            autoFocus
          >
            Confirmar Exclusão
          </button>
        </DialogActions>
      </Dialog>
    </AppLayout>
  );
};
