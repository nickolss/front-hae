import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  MenuItem,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";
import { PasswordField } from "@components/PasswordField";
import { ToastNotification } from "@components/ToastNotification";
import { registerSchema } from "@/validation/registerSchema";
import { api, authService } from "@/services";
import { useAuthForms } from "@/hooks/useAuthForms";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { COURSE_OPTIONS } from "@/constants/options";

interface Institution {
  id: string;
  institutionCode: number;
  name: string;
}

type FormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  course: string;
  institution: string;
};

export const Register = () => {
  const {
    openSnackbar,
    snackbarMessage,
    snackbarSeverity,
    handleCloseSnackbar,
    handleRegister,
  } = useAuthForms(authService);
  const navigate = useNavigate();

  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [isLoadingInstitutions, setIsLoadingInstitutions] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: yupResolver(registerSchema),
  });

  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        const response = await api.get<Institution[]>("/institution/getAll");
        setInstitutions(response.data);
        console.log("Instituições carregadas:", response.data);
        console.log("api base URL:", api.defaults.baseURL);
      } catch (error) {
        console.error("Erro ao buscar instituições:", error);
      } finally {
        setIsLoadingInstitutions(false);
      }
    };
    fetchInstitutions();
  }, []);

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    const success = await handleRegister(data);
    if (success) {
      setRegistrationSuccess(true);
    }
  };

  if (registrationSuccess) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center p-4">
        <div className="p-8 max-w-md">
          <img
            src="/fatec_zona_leste_icon.png"
            alt="Logo da Fatec da Zona Leste"
            className="mb-4 w-26 mx-auto"
          />
          <Typography
            variant="h5"
            component="h1"
            className="font-semibold text-green-700 mt-3"
          >
            Cadastro enviado com sucesso!
          </Typography>
          <Typography className=" text-gray-600 py-5">
            Enviamos um link de ativação para o seu e-mail institucional. Por
            favor, verifique sua caixa de entrada (e a pasta de spam) para
            ativar sua conta.
          </Typography>
          <button
            onClick={() => navigate("/login")}
            className="bg-red-fatec text-white p-2 rounded mt-4 uppercase w-full hover:bg-red-900 "
          >
            Voltar para o Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="p-8 xl:w-xl">
          <img
            src="/fatec_zona_leste_icon.png"
            alt="Logo da Fatec da Zona Leste"
            className="mb-4 w-24"
          />
          <h1 className="text-xl my-4 font-semibold">
            Sistema de Controle de
            <span className="text-red-fatec"> HAEs</span>
          </h1>

          <form
            className="flex flex-col"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            <TextField
              label="Nome Completo"
              {...register("name")}
              error={!!errors.name}
              helperText={errors.name?.message}
              required
            />

            <TextField
              label="E-mail institucional"
              placeholder="nome@fatec.sp.gov.br ou nome@cps.sp.gov.br"
              {...register("email")}
              error={!!errors.email}
              helperText={errors.email?.message}
              sx={{ margin: "1rem 0" }}
              required
            />

            <TextField
              label="Instituição"
              select
              defaultValue=""
              {...register("institution")}
              error={!!errors.institution}
              helperText={errors.institution?.message}
              sx={{ margin: "1rem 0" }}
              required
              disabled={isLoadingInstitutions}
            >
              {isLoadingInstitutions ? (
                <MenuItem disabled>Carregando instituições...</MenuItem>
              ) : (
                institutions.map((inst) => (
                  <MenuItem key={inst.id} value={inst.name}>
                    {inst.name}
                  </MenuItem>
                ))
              )}
            </TextField>

            <TextField
              label="Curso"
              select
              defaultValue=""
              {...register("course")}
              error={!!errors.course}
              helperText={errors.course?.message}
              sx={{ margin: "1rem 0" }}
              required
            >
              {COURSE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>

            <PasswordField
              {...register("password")}
              error={!!errors.password}
              helperText={errors.password?.message}
            />
            <PasswordField
              label="Confirmar Senha"
              {...register("confirmPassword")}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-red-fatec text-white p-2 rounded my-2 uppercase hover:bg-red-900 flex items-center justify-center"
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
                "Cadastrar"
              )}
            </button>
          </form>

          <p className="text-center mt-4">
            Já possui uma conta?{" "}
            <a
              href="/login"
              className="font-semibold text-red-fatec hover:underline"
            >
              Entre
            </a>
          </p>
        </div>
      </div>

      <ToastNotification
        open={openSnackbar}
        message={snackbarMessage}
        severity={snackbarSeverity}
        onClose={handleCloseSnackbar}
      />
    </>
  );
};
