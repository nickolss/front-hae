import { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { api } from "@/services";
import { AppLayout } from "@/layouts";
import {
  CircularProgress,
  TextField,
  Typography,
  Alert,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Snackbar,
} from "@mui/material";
import { AxiosError } from "axios";
import { HaeDetailDTO } from "@/types/hae.d";

interface ClosureFormData {
  // TCC fields
  tccRole?: "orientou" | "ajudou";
  tccStudentCount?: number;
  tccStudentNames?: string;
  tccApprovedStudents?: string;
  tccProjectInfo?: string;
  
  // Estágio fields
  estagioStudentInfo?: string;
  estagioApprovedStudents?: string;
  
  // Apoio à Direção fields
  apoioType?: "geral" | "curso";
  apoioGeralDescription?: string;
  apoioApprovedStudents?: string;
  apoioCertificateStudents?: string;
}

export const RequestClosurePage = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { projectTitle } = location.state as { projectTitle: string };

  const [haeDetails, setHaeDetails] = useState<HaeDetailDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<ClosureFormData>({});
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  useEffect(() => {
    const fetchHaeDetails = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const response = await api.get<HaeDetailDTO>(`/hae/getHaeById/${id}`);
        setHaeDetails(response.data);
      } catch (err) {
        console.error("Erro ao carregar detalhes da HAE:", err);
        setError("Não foi possível carregar os detalhes da HAE.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHaeDetails();
  }, [id]);

  const handleInputChange = (field: keyof ClosureFormData, value: ClosureFormData[keyof ClosureFormData]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!haeDetails) return false;

    switch (haeDetails.projectType) {
      case "TCC":
        if (!formData.tccRole) {
          setError("Por favor, informe se orientou ou apenas ajudou.");
          return false;
        }
        if (!formData.tccStudentCount || formData.tccStudentCount < 1) {
          setError("Por favor, informe a quantidade de alunos.");
          return false;
        }
        if (!formData.tccStudentNames?.trim()) {
          setError("Por favor, informe os nomes dos alunos.");
          return false;
        }
        if (!formData.tccApprovedStudents?.trim()) {
          setError("Por favor, informe quais alunos foram aprovados.");
          return false;
        }
        if (formData.tccRole === "orientou" && !formData.tccProjectInfo?.trim()) {
          setError("Por favor, informe as informações do(s) projeto(s) orientado(s).");
          return false;
        }
        return true;

      case "Estagio":
        if (!formData.estagioStudentInfo?.trim()) {
          setError("Por favor, informe as informações dos alunos atendidos.");
          return false;
        }
        if (!formData.estagioApprovedStudents?.trim()) {
          setError("Por favor, informe se os alunos foram aprovados ou não.");
          return false;
        }
        return true;

      case "ApoioDirecao":
        if (!formData.apoioType) {
          setError("Por favor, selecione o tipo de apoio (Geral ou Curso).");
          return false;
        }
        if (formData.apoioType === "geral") {
          if (!formData.apoioGeralDescription?.trim()) {
            setError("Por favor, forneça a descrição do que foi feito.");
            return false;
          }
          if (formData.apoioGeralDescription.length < 4000) {
            setError("A descrição deve ter no mínimo 4.000 caracteres.");
            return false;
          }
        } else if (formData.apoioType === "curso") {
          if (!formData.apoioApprovedStudents?.trim()) {
            setError("Por favor, informe os alunos aprovados.");
            return false;
          }
          if (!formData.apoioCertificateStudents?.trim()) {
            setError("Por favor, informe os alunos que receberão certificado.");
            return false;
          }
        }
        return true;

      default:
        setError("Tipo de HAE não reconhecido.");
        return false;
    }
  };

  const handleSubmit = async () => {
    if (!id || !haeDetails) {
      setError("Dados da HAE não disponíveis.");
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await api.post(`/hae/request-closure/${id}`, formData);
      setSnackbar({
        open: true,
        message: "Solicitação de fechamento enviada com sucesso!",
        severity: "success",
      });
      setTimeout(() => navigate("/myrequests"), 2000);
    } catch (err) {
      console.error("Erro ao solicitar fechamento:", err);
      let errorMessage = "Falha ao enviar a solicitação. Tente novamente.";
      
      if (err instanceof AxiosError) {
        errorMessage =
          err.response?.data?.message ||
          "Falha ao enviar a solicitação. Tente novamente.";
      }
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const baseButtonStyles =
    "px-4 py-2 uppercase font-semibold rounded-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2";

  const cancelButtonStyles = `${baseButtonStyles} bg-transparent border border-gray-400 text-gray-700 hover:bg-gray-100 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed`;

  const submitButtonStyles = `${baseButtonStyles} bg-red-800 text-white hover:bg-red-900 focus:ring-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed`;

  const renderTCCForm = () => (
    <div className="space-y-4">
      <FormControl component="fieldset">
        <FormLabel component="legend">O professor orientou ou apenas ajudou?</FormLabel>
        <RadioGroup
          value={formData.tccRole || ""}
          onChange={(e) => handleInputChange("tccRole", e.target.value as "orientou" | "ajudou")}
        >
          <FormControlLabel value="orientou" control={<Radio />} label="Orientou" />
          <FormControlLabel value="ajudou" control={<Radio />} label="Apenas ajudou" />
        </RadioGroup>
      </FormControl>

      <TextField
        fullWidth
        label="Quantidade de alunos"
        type="number"
        variant="outlined"
        value={formData.tccStudentCount || ""}
        onChange={(e) => handleInputChange("tccStudentCount", parseInt(e.target.value) || 0)}
        inputProps={{ min: 1 }}
      />

      <TextField
        fullWidth
        label="Nomes dos alunos (separados por vírgula)"
        variant="outlined"
        multiline
        rows={3}
        value={formData.tccStudentNames || ""}
        onChange={(e) => handleInputChange("tccStudentNames", e.target.value)}
      />

      <TextField
        fullWidth
        label="Quais alunos foram aprovados?"
        variant="outlined"
        multiline
        rows={3}
        value={formData.tccApprovedStudents || ""}
        onChange={(e) => handleInputChange("tccApprovedStudents", e.target.value)}
      />

      {formData.tccRole === "orientou" && (
        <TextField
          fullWidth
          label="Informações do(s) projeto(s) orientado(s) (tema e breve descrição)"
          variant="outlined"
          multiline
          rows={6}
          value={formData.tccProjectInfo || ""}
          onChange={(e) => handleInputChange("tccProjectInfo", e.target.value)}
          helperText="Informe o tema e uma breve descrição do(s) projeto(s)"
        />
      )}
    </div>
  );

  const renderEstagioForm = () => (
    <div className="space-y-4">
      <TextField
        fullWidth
        label="Informações sobre os alunos atendidos no estágio"
        variant="outlined"
        multiline
        rows={6}
        value={formData.estagioStudentInfo || ""}
        onChange={(e) => handleInputChange("estagioStudentInfo", e.target.value)}
      />

      <TextField
        fullWidth
        label="Alunos aprovados ou não aprovados"
        variant="outlined"
        multiline
        rows={4}
        value={formData.estagioApprovedStudents || ""}
        onChange={(e) => handleInputChange("estagioApprovedStudents", e.target.value)}
        helperText="Informe quais alunos foram aprovados e quais não foram"
      />
    </div>
  );

  const renderApoioDirecaoForm = () => (
    <div className="space-y-4">
      <FormControl component="fieldset">
        <FormLabel component="legend">Tipo de Apoio à Direção</FormLabel>
        <RadioGroup
          value={formData.apoioType || ""}
          onChange={(e) => handleInputChange("apoioType", e.target.value as "geral" | "curso")}
        >
          <FormControlLabel value="geral" control={<Radio />} label="Geral" />
          <FormControlLabel value="curso" control={<Radio />} label="Curso" />
        </RadioGroup>
      </FormControl>

      {formData.apoioType === "geral" && (
        <TextField
          fullWidth
          label="Descrição detalhada do que foi feito"
          variant="outlined"
          multiline
          rows={12}
          value={formData.apoioGeralDescription || ""}
          onChange={(e) => handleInputChange("apoioGeralDescription", e.target.value)}
          helperText={`${formData.apoioGeralDescription?.length || 0} / 4000 caracteres mínimos`}
          error={(formData.apoioGeralDescription?.length || 0) < 4000}
        />
      )}

      {formData.apoioType === "curso" && (
        <>
          <TextField
            fullWidth
            label="Alunos aprovados"
            variant="outlined"
            multiline
            rows={4}
            value={formData.apoioApprovedStudents || ""}
            onChange={(e) => handleInputChange("apoioApprovedStudents", e.target.value)}
          />

          <TextField
            fullWidth
            label="Alunos que receberão certificado"
            variant="outlined"
            multiline
            rows={4}
            value={formData.apoioCertificateStudents || ""}
            onChange={(e) => handleInputChange("apoioCertificateStudents", e.target.value)}
          />
        </>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <AppLayout>
        <main className="col-start-2 row-start-2 p-4 md:p-8 flex items-center justify-center">
          <CircularProgress />
        </main>
      </AppLayout>
    );
  }

  if (!haeDetails) {
    return (
      <AppLayout>
        <main className="col-start-2 row-start-2 p-4 md:p-8">
          <Alert severity="error">Não foi possível carregar os detalhes da HAE.</Alert>
        </main>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <main className="col-start-2 row-start-2 p-4 md:p-8">
        <Typography variant="h4" className="subtitle font-semibold mb-2">
          Solicitar Fechamento de HAE
        </Typography>
        <Typography variant="h6" className="text-gray-700 mb-6">
          {projectTitle}
        </Typography>

        <div className="bg-white p-6 rounded-lg shadow-md max-w-3xl space-y-6">
          <Typography variant="body1" className="mb-4">
            Por favor, preencha as informações necessárias para concluir sua HAE.
          </Typography>

          {haeDetails.projectType === "TCC" && renderTCCForm()}
          {haeDetails.projectType === "Estagio" && renderEstagioForm()}
          {haeDetails.projectType === "ApoioDirecao" && renderApoioDirecaoForm()}

          {error && <Alert severity="error">{error}</Alert>}

          <div className="flex justify-end pt-4 gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
              className={cancelButtonStyles}
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={submitButtonStyles}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <CircularProgress size={20} color="inherit" />
                  <span>Enviando...</span>
                </div>
              ) : (
                "Enviar Solicitação"
              )}
            </button>
          </div>
        </div>

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
      </main>
    </AppLayout>
  );
};
