import { useEffect, useState } from "react";
import { api } from "@/services";
import { useAuth } from "@/hooks/useAuth";
import { AppLayout } from "@/layouts";
import { HaeResponseDTO, HaeDetailDTO } from "@/types/hae";
import {
  CircularProgress,
  Typography,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Chip,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  VisibilityOutlined,
  CheckCircleOutlined,
  CancelOutlined,
} from "@mui/icons-material";

export const ClosureRequests = () => {
  const { user, loading: userLoading } = useAuth();
  const [requests, setRequests] = useState<HaeResponseDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedHae, setSelectedHae] = useState<HaeDetailDTO | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({ open: false, message: "", severity: "success" });
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    haeId: string;
    action: "COMPLETO" | "APROVADO";
  }>({ open: false, haeId: "", action: "APROVADO" });

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleOpenConfirmDialog = (haeId: string, action: "COMPLETO" | "APROVADO") => {
    setConfirmDialog({ open: true, haeId, action });
  };

  const handleCloseConfirmDialog = () => {
    setConfirmDialog({ open: false, haeId: "", action: "APROVADO" });
  };

  const handleConfirmAction = async () => {
    await handleUpdateStatus(confirmDialog.haeId, confirmDialog.action);
    handleCloseConfirmDialog();
  };

  const fetchRequests = async () => {
    if (!user || (user.role !== "COORDENADOR" && user.role !== "DEV")) return;
    setIsLoading(true);
    try {
      const response = await api.get<HaeResponseDTO[]>(
        `/hae/getHaeByStatus/FECHAMENTO_SOLICITADO`
      );

      const filteredRequests = response.data.filter(
        (hae) => hae.course === user.course
      );

      setRequests(filteredRequests);
    } catch (error) {
      console.error("Erro ao buscar solicitações de fechamento:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!userLoading) {
      fetchRequests();
    }
  }, [user, userLoading]);

  const handleViewDetails = async (haeId: string) => {
    setIsLoadingDetails(true);
    setIsDialogOpen(true);
    try {
      const response = await api.get<HaeDetailDTO>(`/hae/getHaeById/${haeId}`);
      setSelectedHae(response.data);
    } catch (error) {
      console.error("Erro ao buscar detalhes da HAE:", error);
      setSnackbar({
        open: true,
        message: "Não foi possível carregar os detalhes da HAE.",
        severity: "error",
      });
      setIsDialogOpen(false);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedHae(null);
  };

  const handleUpdateStatus = async (
    haeId: string,
    newStatus: "COMPLETO" | "APROVADO"
  ) => {
    if (!user) return;
    
    try {
      const payload = { newStatus, coordenadorId: user.id };
      await api.put(`/hae/change-status/${haeId}`, payload);
      setRequests((prev) => prev.filter((req) => req.id !== haeId));
      handleCloseDialog();
      setSnackbar({
        open: true,
        message: newStatus === "COMPLETO" 
          ? "Fechamento aprovado com sucesso! HAE concluída."
          : "Fechamento rejeitado. HAE voltou para o status APROVADO.",
        severity: "success",
      });
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      setSnackbar({
        open: true,
        message: "Não foi possível processar a solicitação.",
        severity: "error",
      });
    }
  };

  const renderClosureDetails = () => {
    if (!selectedHae) return null;

    const { projectType } = selectedHae;

    return (
      <div className="space-y-4 mt-4">
        <Divider />
        <Typography variant="h6" className="font-semibold text-gray-800">
          Informações do Fechamento
        </Typography>

        {projectType === "TCC" && (
          <div className="space-y-3">
            <div>
              <Typography variant="subtitle2" className="font-semibold text-gray-700">
                Papel do Professor:
              </Typography>
              <Chip 
                label={selectedHae.tccRole === "orientou" ? "Orientou" : "Apenas Ajudou"} 
                color="primary" 
                size="small" 
                className="mt-1"
              />
            </div>
            
            <div>
              <Typography variant="subtitle2" className="font-semibold text-gray-700">
                Quantidade de Alunos:
              </Typography>
              <Typography variant="body2">{selectedHae.tccStudentCount || "Não informado"}</Typography>
            </div>

            <div>
              <Typography variant="subtitle2" className="font-semibold text-gray-700">
                Nomes dos Alunos:
              </Typography>
              <Typography variant="body2" className="whitespace-pre-wrap">
                {selectedHae.tccStudentNames || "Não informado"}
              </Typography>
            </div>

            <div>
              <Typography variant="subtitle2" className="font-semibold text-gray-700">
                Alunos Aprovados:
              </Typography>
              <Typography variant="body2" className="whitespace-pre-wrap">
                {selectedHae.tccApprovedStudents || "Não informado"}
              </Typography>
            </div>

            {selectedHae.tccRole === "orientou" && selectedHae.tccProjectInfo && (
              <div>
                <Typography variant="subtitle2" className="font-semibold text-gray-700">
                  Informações do(s) Projeto(s):
                </Typography>
                <Typography variant="body2" className="whitespace-pre-wrap">
                  {selectedHae.tccProjectInfo}
                </Typography>
              </div>
            )}
          </div>
        )}

        {projectType === "Estagio" && (
          <div className="space-y-3">
            <div>
              <Typography variant="subtitle2" className="font-semibold text-gray-700">
                Informações dos Alunos Atendidos:
              </Typography>
              <Typography variant="body2" className="whitespace-pre-wrap">
                {selectedHae.estagioStudentInfo || "Não informado"}
              </Typography>
            </div>

            <div>
              <Typography variant="subtitle2" className="font-semibold text-gray-700">
                Alunos Aprovados/Não Aprovados:
              </Typography>
              <Typography variant="body2" className="whitespace-pre-wrap">
                {selectedHae.estagioApprovedStudents || "Não informado"}
              </Typography>
            </div>
          </div>
        )}

        {projectType === "ApoioDirecao" && (
          <div className="space-y-3">
            <div>
              <Typography variant="subtitle2" className="font-semibold text-gray-700">
                Tipo de Apoio:
              </Typography>
              <Chip 
                label={selectedHae.apoioType === "geral" ? "Geral" : "Curso"} 
                color="secondary" 
                size="small" 
                className="mt-1"
              />
            </div>

            {selectedHae.apoioType === "geral" && selectedHae.apoioGeralDescription && (
              <div>
                <Typography variant="subtitle2" className="font-semibold text-gray-700">
                  Descrição do que foi feito:
                </Typography>
                <Typography variant="body2" className="whitespace-pre-wrap">
                  {selectedHae.apoioGeralDescription}
                </Typography>
                <Typography variant="caption" className="text-gray-500">
                  {selectedHae.apoioGeralDescription.length} caracteres
                </Typography>
              </div>
            )}

            {selectedHae.apoioType === "curso" && (
              <>
                <div>
                  <Typography variant="subtitle2" className="font-semibold text-gray-700">
                    Alunos Aprovados:
                  </Typography>
                  <Typography variant="body2" className="whitespace-pre-wrap">
                    {selectedHae.apoioApprovedStudents || "Não informado"}
                  </Typography>
                </div>

                <div>
                  <Typography variant="subtitle2" className="font-semibold text-gray-700">
                    Alunos que Receberão Certificado:
                  </Typography>
                  <Typography variant="body2" className="whitespace-pre-wrap">
                    {selectedHae.apoioCertificateStudents || "Não informado"}
                  </Typography>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  if (userLoading || isLoading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <CircularProgress size={70} sx={{ color: "#c10007" }} />
      </div>
    );
  }

  return (
    <AppLayout>
      <main className="col-start-2 row-start-2 p-4 md:p-8">
        <Typography variant="h4" className="subtitle font-semibold mb-6">
          Solicitações de Fechamento de HAE
        </Typography>

        {requests.length === 0 ? (
          <Paper className="p-6 text-center text-gray-600">
            <Typography>
              Nenhuma solicitação de fechamento pendente para o seu curso.
            </Typography>
          </Paper>
        ) : (
          <div className="space-y-4">
            {requests.map((hae) => (
              <Paper
                key={hae.id}
                elevation={2}
                className="p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <Typography variant="h6" className="font-semibold text-gray-800 mb-2">
                      {hae.projectTitle}
                    </Typography>
                    <div className="space-y-1">
                      <Typography variant="body2" color="textSecondary">
                        <strong>Professor:</strong> {hae.professorName}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        <strong>Curso:</strong> {hae.course}
                      </Typography>
                      <Typography variant="body2" className="mt-2">
                        {hae.projectDescription.substring(0, 150)}
                        {hae.projectDescription.length > 150 && "..."}
                      </Typography>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 flex-shrink-0 w-full md:w-auto">
                    <button
                      className="btnFatec bg-blue-600 text-white uppercase hover:bg-blue-900 flex items-center justify-center gap-2"
                      onClick={() => handleViewDetails(hae.id)}
                    >
                      <VisibilityOutlined fontSize="small" sx={{ fill: "white" }} />
                      Ver Detalhes
                    </button>
                    
                    <button
                      className="btnFatec bg-gray-600 text-white uppercase hover:bg-gray-800 flex items-center justify-center gap-2"
                      onClick={() => handleOpenConfirmDialog(hae.id, "APROVADO")}
                    >
                      <CancelOutlined fontSize="small" sx={{ fill: "white" }} />
                      Rejeitar
                    </button>
                    
                    <button
                      className="btnFatec text-white uppercase bg-red-800 hover:bg-red-900 flex items-center justify-center gap-2"
                      onClick={() => handleOpenConfirmDialog(hae.id, "COMPLETO")}
                    >
                      <CheckCircleOutlined fontSize="small" sx={{ fill: "white" }} />
                      Aprovar Fechamento
                    </button>
                  </div>
                </div>
              </Paper>
            ))}
          </div>
        )}
      </main>

      <Dialog 
        open={isDialogOpen} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle className="bg-red-800 text-white">
          <Typography variant="h6" className="font-semibold text-white">
            Detalhes da Solicitação de Fechamento
          </Typography>
        </DialogTitle>
        
        <DialogContent className="mt-4">
          {isLoadingDetails ? (
            <div className="flex justify-center items-center py-10">
              <CircularProgress />
            </div>
          ) : selectedHae ? (
            <div className="space-y-4">
              <div>
                <Typography variant="subtitle2" className="font-semibold text-gray-700">
                  Título do Projeto:
                </Typography>
                <Typography variant="body1">{selectedHae.projectTitle}</Typography>
              </div>

              <div>
                <Typography variant="subtitle2" className="font-semibold text-gray-700">
                  Professor:
                </Typography>
                <Typography variant="body1">{selectedHae.professorName}</Typography>
              </div>

              <div>
                <Typography variant="subtitle2" className="font-semibold text-gray-700">
                  Tipo de HAE:
                </Typography>
                <Typography variant="body1">
                  {selectedHae.projectType === "TCC" 
                    ? "Trabalho de Conclusão de Curso" 
                    : selectedHae.projectType === "Estagio" 
                    ? "Estágio" 
                    : "Apoio à Direção"}
                </Typography>
              </div>

              <div>
                <Typography variant="subtitle2" className="font-semibold text-gray-700">
                  Descrição do Projeto:
                </Typography>
                <Typography variant="body2" className="whitespace-pre-wrap">
                  {selectedHae.projectDescription}
                </Typography>
              </div>

              {renderClosureDetails()}
            </div>
          ) : (
            <Typography color="error">Erro ao carregar detalhes</Typography>
          )}
        </DialogContent>
        
        <DialogActions className="p-4">
          <button
            className="btnFatec bg-gray-600 text-white uppercase hover:bg-gray-800"
            onClick={handleCloseDialog}
          >
            Fechar
          </button>
          
          {selectedHae && (
            <>
              <button
                className="btnFatec bg-gray-600 text-white uppercase hover:bg-gray-800"
                onClick={() => handleOpenConfirmDialog(selectedHae.id, "APROVADO")}
              >
                Rejeitar Fechamento
              </button>
              
              <button
                className="btnFatec text-white uppercase bg-red-800 hover:bg-red-900"
                onClick={() => handleOpenConfirmDialog(selectedHae.id, "COMPLETO")}
              >
                Aprovar Fechamento
              </button>
            </>
          )}
        </DialogActions>
      </Dialog>
  
      <Dialog
        open={confirmDialog.open}
        onClose={handleCloseConfirmDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle className="bg-red-800 text-white">
          <Typography variant="h6" className="font-semibold text-white">
            Confirmar Ação
          </Typography>
        </DialogTitle>
        
        <DialogContent className="mt-4">
          <Typography variant="body1">
            {confirmDialog.action === "COMPLETO"
              ? "Tem certeza que deseja APROVAR este fechamento? A HAE será marcada como CONCLUÍDA."
              : "Tem certeza que deseja REJEITAR este fechamento? A HAE voltará para o status APROVADO."}
          </Typography>
        </DialogContent>
        
        <DialogActions className="p-4">
          <button
            className="btnFatec bg-gray-600 text-white uppercase hover:bg-gray-800"
            onClick={handleCloseConfirmDialog}
          >
            Cancelar
          </button>
          
          <button
            className={`btnFatec text-white uppercase ${
              confirmDialog.action === "COMPLETO"
                ? "bg-red-800 hover:bg-red-900"
                : "bg-gray-600 hover:bg-gray-800"
            }`}
            onClick={handleConfirmAction}
          >
            Confirmar
          </button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </AppLayout>
  );
};
