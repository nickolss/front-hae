import { useState } from "react";
import { HaeDataType } from "@/components/StepperForm/types/haeFormTypes";
import { AxiosError } from "axios";
import { IHaeService } from "@/services";

/**
 * Obtém o semestre de uma data.
 * @param date A data (objeto Date do JS).
 * @returns Uma string no formato "AAAA/S" (ex: "2025/1" ou "2025/2").
 */
const getSemestre = (date: Date): string => {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth(); // 0 (Jan) a 11 (Dez)
  const semestre = month < 6 ? 1 : 2; // Jan-Jun é S1, Jul-Dez é S2
  return `${year}/${semestre}`;
};

interface SpringErrorResponse {
  message: string;
}

export const useHaeService = (haeService: IHaeService) => {
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    "error" | "success" | "info" | "warning"
  >("info");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCloseSnackbar = () => setOpenSnackbar(false);

  const handleCreateHae = async (data: HaeDataType): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      const newHaeStartDate = new Date(data.startDate);
      const newHaeSemestre = getSemestre(newHaeStartDate);

      const existingHaes = await haeService.getHaesByProfessorId(
        data.employeeId
      );

      const hasUnfinishedPastHae = existingHaes.some((hae) => {
        const existingHaeStartDate = new Date(hae.startDate);
        const existingHaeSemestre = getSemestre(existingHaeStartDate);

        return (
          existingHaeSemestre < newHaeSemestre && hae.status !== "COMPLETO"
        );
      });

      if (hasUnfinishedPastHae) {
        setSnackbarMessage(
          "Você possui HAEs de semestres anteriores que não foram concluídas. Finalize-as para poder criar novas."
        );
        setSnackbarSeverity("error");
        setOpenSnackbar(true);
        return false;
      }

      await haeService.createHae(data);
      setSnackbarMessage("HAE solicitada com sucesso!");
      setSnackbarSeverity("success");
      setOpenSnackbar(true);
      return true;
    } catch (error) {
      console.error("Erro detalhado no serviço HAE:", error);
      const axiosError = error as AxiosError<SpringErrorResponse>;
      const displayMessage =
        axiosError.response?.data?.message ||
        "Erro ao processar sua solicitação.";
      setSnackbarMessage(displayMessage);
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateHae = async (
    id: string,
    data: HaeDataType
  ): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      await haeService.updateHae(id, data);
      setSnackbarMessage("HAE atualizada com sucesso!");
      setSnackbarSeverity("success");
      setOpenSnackbar(true);
      return true;
    } catch (error) {
      const axiosError = error as AxiosError<SpringErrorResponse>;
      const displayMessage =
        axiosError.response?.data?.message || "Erro ao atualizar HAE.";
      setSnackbarMessage(displayMessage);
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    openSnackbar,
    snackbarMessage,
    snackbarSeverity,
    isSubmitting,
    handleCloseSnackbar,
    handleCreateHae,
    handleUpdateHae,
  };
};
