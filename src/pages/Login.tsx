import { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
  Divider,
  CircularProgress,
} from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { PasswordField } from "@components/PasswordField";
import { ToastNotification } from "@components/ToastNotification";
import { loginSchema } from "@/validation/loginSchema";
import { authService } from "@/services";
import { useAuthForms } from "@/hooks/useAuthForms";
import { useNavigate } from "react-router-dom";

type FormData = {
  email: string;
  password: string;
};

const FATEC_RED_COLOR = "#D32F2F";
const FATEC_RED_HOVER_COLOR = "#B71C1C";

export const Login = () => {
  const navigate = useNavigate();
  const [isWarningDialogOpen, setWarningDialogOpen] = useState(false);

  const {
    openSnackbar,
    snackbarMessage,
    snackbarSeverity,
    handleCloseSnackbar,
    handleLogin,
  } = useAuthForms(authService);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: yupResolver(loginSchema),
  });

  useEffect(() => {
    setWarningDialogOpen(true);
  }, []);

  const handleCloseWarningDialog = () => {
    setWarningDialogOpen(false);
  };

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    const result = await handleLogin(data);

    if (result.success && result.user) {
      navigate("/");
    }
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="p-8 xl:w-xl">
          <img
            src="/logo_fatec_cor.png"
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
              label="E-mail institucional"
              placeholder="nome@fatec.sp.gov.br"
              {...register("email")}
              error={!!errors.email}
              helperText={errors.email?.message}
              sx={{ margin: "1rem 0" }}
              required
            />

            <PasswordField
              label="Senha"
              {...register("password")}
              error={!!errors.password}
              helperText={errors.password?.message}
            />

            <a
              href="/forgot-password"
              className="text-red-fate hover:underline text-sm my-2"
            >
              Esqueceu a senha?
            </a>

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-red-fatec text-white p-2.5 rounded mt-6 mb-2 uppercase hover:bg-red-900 flex items-center justify-center"
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
                "Entrar"
              )}
            </button>
          </form>

          <p>
            É seu primeiro acesso?{" "}
            <a href="/register" className="text-red-fate hover:underline">
              Cadastre-se
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

      <Dialog
        open={isWarningDialogOpen}
        disableEscapeKeyDown
        onClose={(_, reason) => {
          if (reason && reason === "backdropClick") return;
          handleCloseWarningDialog();
        }}
        aria-labelledby="development-warning-title"
      >
        <DialogTitle id="development-warning-title" sx={{ fontWeight: "600" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <WarningAmberIcon sx={{ color: FATEC_RED_COLOR }} />
            Aviso Importante
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bem-vindo! Este sistema ainda está em fase de desenvolvimento e pode
            apresentar instabilidades.
            <br />
            <br />
            Se encontrar algum problema, por favor, tente novamente entre 5 a 10
            minutos. Se o erro persistir, contate um coordenador.
          </DialogContentText>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ padding: "16px 24px" }}>
          <Button
            onClick={handleCloseWarningDialog}
            variant="contained"
            autoFocus
            sx={{
              backgroundColor: FATEC_RED_COLOR,
              color: "white",
              textTransform: "uppercase",
              borderRadius: "0.25rem",
              padding: "8px 22px",
              "&:hover": {
                backgroundColor: FATEC_RED_HOVER_COLOR,
              },
            }}
          >
            Entendido
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
