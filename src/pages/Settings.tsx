import { useEffect, useState } from "react";
import { api } from "@/services";
import { useAuth } from "@/hooks/useAuth";
import {
  CircularProgress,
  TextField,
  Snackbar,
  Alert,
  Typography,
  Box,
} from "@mui/material";
import { AppLayout } from "@/layouts";
import { AxiosError } from "axios";

export const Settings = () => {
  const [currentLimit, setCurrentLimit] = useState<number | null>(null);
  const [newLimit, setNewLimit] = useState<string>("");

  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  } | null>(null);

  useEffect(() => {
    if (!user) {
      if (!authLoading) {
        setLoading(false);
      }
      return;
    }

    const fetchCurrentLimit = async () => {
      setLoading(true);
      try {
        const institutionId = user.institution.id;
        const response = await api.get<number>(
          "/institution/getAvailableHaesCount",
          {
            params: { institutionId },
          }
        );
        setCurrentLimit(response.data);
        setNewLimit(response.data.toString());
      } catch (err) {
        console.error("Erro ao buscar o limite de HAEs:", err);
        setSnackbar({
          open: true,
          message: "Falha ao carregar a configuração atual da instituição.",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchCurrentLimit();
  }, [user, authLoading]);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user?.institution.id || !user?.id) {
      setSnackbar({
        open: true,
        message:
          "Sua identidade ou instituição não pôde ser verificada. Tente novamente.",
        severity: "error",
      });
      return;
    }

    const count = parseInt(newLimit, 10);
    if (isNaN(count) || count < 0) {
      setSnackbar({
        open: true,
        message: "Por favor, insira um número válido e positivo.",
        severity: "error",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const institutionId = user.institution.id;

      await api.post(`/institution/setAvailableHaesCount`, null, {
        params: {
          count: count,
          institutionId: institutionId,
          userId: user.id,
        },
      });

      setCurrentLimit(count);
      setSnackbar({
        open: true,
        message: "Limite de HAEs da instituição atualizado com sucesso!",
        severity: "success",
      });
    } catch (error) {
      let errorMessage = "Ocorreu uma falha. Tente novamente.";
      if (error instanceof AxiosError) {
        errorMessage = error.response?.data?.message || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      console.error("...", error);
      setSnackbar({ open: true, message: errorMessage, severity: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <AppLayout>
        <main className="h-full flex justify-center items-center">
          <CircularProgress
            size={70}
            sx={{ "& .MuiCircularProgress-circle": { stroke: "#c10007" } }}
          />
        </main>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <main className="col-start-2 row-start-2 p-4 md:p-8 overflow-auto bg-gray-50 pt-20 md:pt-4 h-full">
        <h2 className="subtitle font-semibold">Configurações da Instituição</h2>
        <p className="text-gray-600 mb-6">
          Ajuste os parâmetros da instituição:{" "}
          <span className="font-bold text-gray-800">
            {user?.institution.name}
          </span>
          .
        </p>

        <Box
          component="form"
          onSubmit={handleSave}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 max-w-md flex flex-col gap-4"
        >
          <Typography variant="h6" className="font-semibold text-gray-800">
            Limite de HAEs por Semestre
          </Typography>
          <Typography variant="body2" className="text-gray-500 mb-2">
            Defina o número máximo de HAEs que podem ser criadas na sua
            instituição. O limite atual é:{" "}
            <span className="font-bold text-blue-600">
              {currentLimit ?? "..."}
            </span>
          </Typography>

          <TextField
            fullWidth
            label="Novo Limite de HAEs"
            type="number"
            variant="outlined"
            value={newLimit}
            onChange={(e) => setNewLimit(e.target.value)}
            InputProps={{ inputProps: { min: 0 } }}
            required
            disabled={isSubmitting}
          />

          <button
            type="submit"
            disabled={isSubmitting || loading}
            className="btnFatec text-white uppercase hover:bg-red-900"
          >
            {isSubmitting ? "Salvando..." : "Salvar Alterações"}
          </button>
        </Box>
      </main>

      <Snackbar
        open={snackbar?.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar(null)}
          severity={snackbar?.severity}
          sx={{ width: "100%" }}
        >
          {snackbar?.message}
        </Alert>
      </Snackbar>
    </AppLayout>
  );
};
