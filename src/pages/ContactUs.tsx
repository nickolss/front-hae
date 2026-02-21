import { useState, useEffect } from "react";
import {
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  FormHelperText,
  CircularProgress,
} from "@mui/material";
import * as yup from "yup";
import { AppLayout } from "@/layouts";
import { useSnackbar } from "@/hooks/useSnackbar";
import { useAuth } from "@/hooks/useAuth";
import { ToastNotification } from "@/components/ToastNotification";
import { emailService } from "@/services/emailService";
import { FeedbackFormType } from "@/types/feedbackFormType";
import { supportSchema } from "@/validation/supportSchema";

type ErrorFields = Partial<Record<keyof FeedbackFormType, string>>;

export const ContactUs = () => {
  const { open, message, severity, showSnackbar, hideSnackbar } = useSnackbar();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const [formData, setFormData] = useState<FeedbackFormType>({
    name: "",
    email: "",
    subject: "",
    category: "BUG",
    description: "",
  });
  const [errors, setErrors] = useState<ErrorFields>({});

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name,
      }));
    }
  }, [user]);

  const handleChange = (
    field: keyof FeedbackFormType,
    value: string | FeedbackFormType["category"]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      showSnackbar(
        "Não foi possível identificar o usuário. Por favor, faça login novamente.",
        "error"
      );
      return;
    }

    try {
      setErrors({});
      await supportSchema.validate(formData, { abortEarly: false });

      setIsSubmitting(true);
      await emailService.sendFeedbackEmail(formData);
      showSnackbar("Sua mensagem foi enviada com sucesso!", "success");

      setFormData((prev) => ({
        ...prev,
        email: "",
        subject: "",
        category: "BUG",
        description: "",
      }));
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const newErrors: ErrorFields = {};
        err.inner.forEach((error) => {
          if (error.path) {
            newErrors[error.path as keyof FeedbackFormType] = error.message;
          }
        });
        setErrors(newErrors);
        showSnackbar("Por favor, corrija os erros no formulário.", "warning");
      } else {
        console.error("Erro ao enviar feedback:", err);
        showSnackbar("Erro ao enviar mensagem. Tente novamente.", "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <main className="p-4 md:p-8 overflow-auto w-full h-full flex flex-col pt-20 md:pt-6 bg-gray-50">
        <h2 className="subtitle font-semibold mb-2">Entre em Contato</h2>
        <p className="mb-6 text-gray-600">
          Preencha o formulário abaixo para relatar um problema ou nos enviar
          sua dúvida ou sugestão.
        </p>

        <div className="bg-white flex flex-col gap-6 p-6 md:p-10 rounded-lg shadow-lg border border-gray-200">
          <div className="text-center">
            <h2 className="subtitle font-bold text-2xl">
              Formulário de Contato
            </h2>
          </div>

          <TextField
            label="Nome"
            variant="outlined"
            fullWidth
            value={formData.name}
            disabled
          />

          <TextField
            label="E-mail de Contato"
            variant="outlined"
            fullWidth
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            error={!!errors.email}
            helperText={errors.email}
          />

          <TextField
            label="Assunto"
            variant="outlined"
            fullWidth
            value={formData.subject}
            onChange={(e) => handleChange("subject", e.target.value)}
            error={!!errors.subject}
            helperText={errors.subject}
          />
          <FormControl fullWidth error={!!errors.category}>
            <InputLabel id="category-label">Categoria</InputLabel>
            <Select
              labelId="category-label"
              value={formData.category}
              label="Categoria"
              onChange={(e) =>
                handleChange(
                  "category",
                  e.target.value as FeedbackFormType["category"]
                )
              }
            >
              <MenuItem value="BUG">Relatar um Bug</MenuItem>
              <MenuItem value="DOUBT">Tirar uma Dúvida</MenuItem>
              <MenuItem value="FEEDBACK">Enviar Sugestão/Feedback</MenuItem>
            </Select>
            <FormHelperText>{errors.category}</FormHelperText>
          </FormControl>
          <TextField
            label="Mensagem"
            variant="outlined"
            fullWidth
            multiline
            minRows={4}
            maxRows={8}
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            error={!!errors.description}
            helperText={errors.description}
          />

          <div className="flex justify-end mt-4">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !user}
              className=" py-2 btnFatec uppercase hover:bg-red-900 text-white"
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
                "Enviar Mensagem"
              )}
            </button>
          </div>
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
