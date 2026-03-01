import { useForm, SubmitHandler } from "react-hook-form";
import { TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { api } from "@/services";
import { useState } from "react";

type FormData = { email: string };

export const ForgotPassword = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsSubmitting(true);
    try {
      await api.post("/auth/forgot-password", { email: data.email });
      setMessage(
        "Se o seu e-mail estiver cadastrado, você receberá um link para redefinir sua senha em breve."
      );
    } catch (error) {
      console.error("Erro ao solicitar redefinição de senha:", error);
      setMessage(
        "Se o seu e-mail estiver cadastrado, você receberá um link para redefinir sua senha em breve."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="p-8 xl:w-xl text-center">
        <img
          src="/logo_fatec_cor.png"
          alt="Logo"
          className="mb-4 w-24 mx-auto"
        />
        <h1 className="text-xl my-4 font-semibold">Redefinir Senha</h1>

        {!message ? (
          <>
            <p className="my-4 text-gray-600">
              Por favor, insira seu e-mail institucional para receber um link de
              redefinição de senha.
            </p>
            <form className="flex flex-col" onSubmit={handleSubmit(onSubmit)}>
              <TextField
                label="E-mail institucional"
                {...register("email", { required: "E-mail é obrigatório" })}
                error={!!errors.email}
                helperText={errors.email?.message}
                sx={{ margin: "1rem 0" }}
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-red-fatec text-white p-2 rounded mt-2  mb-4 uppercase hover:bg-red-900"
              >
                {isSubmitting ? "Enviando..." : "Enviar Link"}
              </button>
            </form>
          </>
        ) : (
          <p className="my-4 text-green-700 bg-green-100 p-4 rounded-md">
            {message}
          </p>
        )}
        <button
          className="btnFatec w-full bg-gray-600  text-white uppercase hover:bg-gray-900"
          onClick={() => navigate("/login")}
        >
          Voltar
        </button>
      </div>
    </div>
  );
};
