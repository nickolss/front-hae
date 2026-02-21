import React, { useState } from "react";
import { TextField, CircularProgress, Typography } from "@mui/material";
import * as yup from "yup";
import { AppLayout } from "@/layouts";
import { useSnackbar } from "@/hooks/useSnackbar";
import { ToastNotification } from "@/components/ToastNotification";
import { institutionService } from "@/services/institutionService";
import { institutionSchema } from "@/validation/institutionSchema";
import { AxiosError } from "axios";

type FormData = {
  institutionCode: string;
  name: string;
  address: string;
  haeQtd: string;
};

export const CreateInstitution = () => {
  const { open, message, severity, showSnackbar, hideSnackbar } = useSnackbar();
  const [formData, setFormData] = useState<FormData>({
    institutionCode: "",
    name: "",
    address: "",
    haeQtd: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>(
    {}
  );

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const payloadToValidate = {
        ...formData,
        institutionCode: parseInt(formData.institutionCode, 10),
        haeQtd: parseInt(formData.haeQtd, 10),
      };

      await institutionSchema.validate(payloadToValidate, {
        abortEarly: false,
      });

      setIsSubmitting(true);

      await institutionService.createInstitution(payloadToValidate);

      showSnackbar("Instituição criada com sucesso!", "success");
      setFormData({
        institutionCode: "",
        name: "",
        address: "",
        haeQtd: "",
      });
      setErrors({});
    } catch (err) {
      console.log(err);
      if (err instanceof yup.ValidationError) {
        const newErrors: Partial<Record<keyof FormData, string>> = {};
        err.inner.forEach((error) => {
          if (error.path) {
            newErrors[error.path as keyof FormData] = error.message;
          }
        });
        setErrors(newErrors);
        showSnackbar("Por favor, corrija os erros no formulário.", "error");
      } else if (err instanceof AxiosError) {
        const errorMessage = err.response?.data?.message || "Erro ao criar instituição.";
        showSnackbar(errorMessage, "error");
      } else {
        showSnackbar("Ocorreu um erro inesperado.", "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <main className="p-4 md:p-8 overflow-auto w-full h-full flex flex-col pt-20 md:pt-6 bg-gray-50">
        <h2 className="subtitle font-semibold mb-2">Criar Nova Instituição</h2>
        <p className="mb-6 text-gray-600">
          Preencha os dados abaixo para adicionar uma nova instituição ao
          sistema.
        </p>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 max-w-lg">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <Typography variant="h6" className="font-semibold text-gray-800">
              Dados da Instituição
            </Typography>
            <TextField
              label="Código da Instituição (Ex: 111)"
              type="number"
              value={formData.institutionCode}
              onChange={(e) => handleChange("institutionCode", e.target.value)}
              error={!!errors.institutionCode}
              helperText={errors.institutionCode}
              fullWidth
              required
            />
            <TextField
              label="Nome da Instituição (Ex: FATEC Zona Leste)"
              type="text"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              error={!!errors.name}
              helperText={errors.name}
              fullWidth
              required
            />

            <TextField
              label="Endereço"
              type="text"
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              error={!!errors.address}
              helperText={errors.address}
              fullWidth
              required
            />
            <TextField
              label="Limite de HAEs por Semestre"
              type="number"
              value={formData.haeQtd}
              onChange={(e) => handleChange("haeQtd", e.target.value)}
              error={!!errors.haeQtd}
              helperText={errors.haeQtd}
              InputProps={{ inputProps: { min: 0 } }}
              fullWidth
              required
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="btnFatec text-white uppercase bg-red-800 hover:bg-red-900"
            >
              {isSubmitting ? (
                <CircularProgress
                  size={24}
                  sx={{
                    "& .MuiCircularProgress-circle": {
                      stroke: "#fff",
                    },
                  }}
                />
              ) : (
                "Salvar Instituição"
              )}
            </button>
          </form>
        </div>
      </main>
      <ToastNotification
        open={open}
        message={message}
        severity={severity}
        onClose={hideSnackbar}
      />
    </AppLayout>
  );
};
