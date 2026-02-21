import React, { useState, useEffect, useCallback } from "react";
import StepOne from "./StepOne";
import StepTwo from "./StepTwo";
import StepThree from "./StepThree";
import {
  HaeDataType,
  StepProps,
  FormErrors,
  WeeklySchedule,
} from "./types/haeFormTypes";
import { useAuth } from "@/hooks/useAuth";
import { haeFormSchema } from "@/validation/haeFormSchema";
import { useNavigate, useLocation } from "react-router-dom";
import { useHaeService } from "@/hooks/useHaeService";
import {
  Snackbar,
  Alert as MuiAlert,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import * as yup from "yup";
import { api, haeService } from "@/services";
import { HaeDetailDTO } from "@/types/hae";

const StepperForm: React.FC = () => {
  const [step, setStep] = useState(1);
  const {
    user: employee,
    loading: isLoadingEmployee,
    error: employeeError,
  } = useAuth();

  const location = useLocation();
  const haeIdToEdit = location.state?.haeId;

  const [isEditMode] = useState(!!haeIdToEdit);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingHae, setIsLoadingHae] = useState(isEditMode);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [originalStatus, setOriginalStatus] = useState<string | null>(null);

  const [formData, setFormData] = useState<HaeDataType>({
    employeeId: "",
    projectTitle: "",
    weeklyHours: 0,
    course: "",
    projectType: "",
    dimensao: "",
    modality: "",
    startDate: "",
    endDate: "",
    observations: "",
    dayOfWeek: [],
    timeRange: "",
    projectDescription: "",
    weeklySchedule: {},
    studentRAs: [],
    institutionId: "",
    institutionCode: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const {
    openSnackbar,
    snackbarMessage,
    snackbarSeverity,
    handleCloseSnackbar: hideSnackbar,
    handleCreateHae,
    handleUpdateHae,
  } = useHaeService(haeService);

  useEffect(() => {
    if (isEditMode && haeIdToEdit && employee) {
      const fetchHaeForEdit = async () => {
        setIsLoadingHae(true);
        try {
          const response = await api.get<HaeDetailDTO>(
            `/hae/getHaeById/${haeIdToEdit}`
          );
          const haeData = response.data;
          setOriginalStatus(haeData.status);

          const formattedWeeklySchedule: WeeklySchedule = {};
          if (haeData.weeklySchedule) {
            for (const day in haeData.weeklySchedule) {
              formattedWeeklySchedule[day] = {
                timeRange: haeData.weeklySchedule[day],
              };
            }
          }

          setFormData((prevData) => ({
            ...prevData,
            projectTitle: haeData.projectTitle || "",
            course: haeData.course || "",
            projectType: haeData.projectType || "",
            dimensao: haeData.dimensao || "",
            modality: haeData.modality || "",
            startDate: haeData.startDate || "",
            endDate: haeData.endDate || "",
            observations: haeData.observations || "",
            dayOfWeek: haeData.dayOfWeek || [],
            projectDescription: haeData.projectDescription || "",
            weeklySchedule: formattedWeeklySchedule,
            studentRAs: haeData.students || [],
            weeklyHours: haeData.weeklyHours || 0,
            employeeId: employee.id,
            institutionCode: employee.institution.institutionCode || "",
          }));

        } catch (error) {
          console.error("Erro ao buscar HAE para edição:", error);
        } finally {
          setIsLoadingHae(false);
        }
      };
      fetchHaeForEdit();
    }
  }, [isEditMode, haeIdToEdit, employee]);

  useEffect(() => {
    if (employee && !isLoadingEmployee && !isEditMode) {
      setFormData((prevData) => ({
        ...prevData,
        employeeId: employee.id || "",
        institutionCode: employee.institution.institutionCode || "",
      }));
    }
    if (employeeError) {
      console.error("Erro ao carregar funcionário:", employeeError.message);
    }
  }, [employee, isLoadingEmployee, employeeError, isEditMode]);

  const updateFormData = useCallback(
    <K extends keyof HaeDataType>(field: K, value: HaeDataType[K]) => {
      setFormData((prevData) => ({ ...prevData, [field]: value }));
      if (errors[field as keyof FormErrors]) {
        setErrors((prevErrors) => ({ ...prevErrors, [field]: undefined }));
      }
    },
    [errors]
  );

  const handleNextStep = () => setStep((prev) => prev + 1);
  const handleBackStep = () => setStep((prev) => prev - 1);
  const navigate = useNavigate();

  const handleSubmitTrigger = useCallback(async () => {
    if (isSubmitting) return;

    try {
      setErrors({});
      await haeFormSchema.validate(formData, {
        abortEarly: false,
        context: { isEditMode },
      });

      if (isEditMode) {
        setIsConfirmDialogOpen(true);
      } else {
        setIsSubmitting(true);
        console.log("Submitting form data:", formData);
        const success = await handleCreateHae(formData);
        if (success) {
          setTimeout(() => navigate("/myrequests"), 2000);
        }
      }
    } catch (error: unknown) {
      if (error instanceof yup.ValidationError) {
        const newErrors: FormErrors = {};
        error.inner.forEach((err) => {
          if (err.path) {
            const key = err.path as keyof HaeDataType;
            if (key in formData) {
              newErrors[key] = err.message;
            }
          }
        });
        setErrors(newErrors);
      } else {
        console.error("Erro inesperado no formulário:", error);
      }
    }
  }, [formData, isEditMode, handleCreateHae, navigate]);

  const handleConfirmUpdate = useCallback(async () => {
    if (isSubmitting) return;

    setIsConfirmDialogOpen(false);
    setIsSubmitting(true);

    if (!haeIdToEdit) {
      console.error("ID da HAE não encontrado para atualização.");
      setIsSubmitting(false);
      return;
    }

    const success = await handleUpdateHae(haeIdToEdit, formData);
    if (success) {
      setTimeout(() => navigate("/myrequests"), 2000);
    }

    setIsSubmitting(false);
  }, [haeIdToEdit, formData, handleUpdateHae, navigate, isSubmitting]);

  const renderCurrentStep = () => {
    const isCompleted = originalStatus === "COMPLETO";
    const commonStepProps: StepProps = {
      formData,
      setFormData: updateFormData,
      errors,
      isEditMode,
      isCompleted,
    };

    switch (step) {
      case 1:
        return <StepOne {...commonStepProps} onNext={handleNextStep} />;
      case 2:
        return (
          <StepTwo
            {...commonStepProps}
            onNext={handleNextStep}
            onBack={handleBackStep}
          />
        );
      case 3:
        return (
          <StepThree
            {...commonStepProps}
            onBack={handleBackStep}
            onSubmit={handleSubmitTrigger}
            onOpenConfirmDialog={handleSubmitTrigger}
            isSubmitting={isSubmitting}
          />
        );
      default:
        return null;
    }
  };

  const isCompleted = originalStatus === "COMPLETO";

  if (isLoadingEmployee || isLoadingHae) {
    return (
      <div className="h-screen flex justify-center items-center">
        <CircularProgress size={70} sx={{ "& .MuiCircularProgress-circle": { stroke: "#c10007" } }} />
      </div>
    );
  }

  if (employeeError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-red-600">
        <p className="text-xl">Ocorreu um erro inesperado ao carregar seus dados.</p>
        <p className="text-md">{employeeError.message}</p>
        <p className="text-sm text-gray-500 mt-2">Por favor, tente recarregar a página.</p>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-xl">Você precisa estar logado para acessar este formulário.</p>
        <p className="text-md mt-2">Por favor, faça login para continuar.</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center my-6">
      <div className="p-8 rounded-md w-full shadow-lg bg-white">
        <h2 className="text-3xl font-bold text-center mb-6">
          {isEditMode ? "Editar Solicitação de HAE" : "Criar Nova HAE"}
        </h2>
        {isCompleted && (
          <MuiAlert severity="info" className="my-4">
            Esta HAE já foi concluída e não pode mais ser editada.
          </MuiAlert>
        )}
        {renderCurrentStep()}
        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={hideSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <MuiAlert onClose={hideSnackbar} severity={snackbarSeverity} sx={{ width: "100%" }}>
            <p className="font-semibold">{snackbarMessage}</p>
          </MuiAlert>
        </Snackbar>

        <Dialog
          open={isConfirmDialogOpen}
          onClose={() => setIsConfirmDialogOpen(false)}
          aria-labelledby="confirm-dialog-title"
        >
          <DialogTitle id="confirm-dialog-title" className="font-semibold">
            Confirmar Alterações
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              Ao salvar as alterações, esta HAE retornará ao status "PENDENTE" e precisará ser reavaliada pelo coordenador.
              <br /><br />
              Você tem certeza que deseja continuar?
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ padding: "16px 24px" }}>
            <button
              onClick={() => setIsConfirmDialogOpen(false)}
              className="btnFatec bg-gray-600 text-white uppercase hover:bg-gray-800"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmUpdate}
              className="btnFatec bg-red-800 text-white uppercase hover:bg-red-900"
              autoFocus
            >
              Confirmar e Enviar
            </button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
};

export default StepperForm;
