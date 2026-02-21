import { useForm, SubmitHandler } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { PasswordField } from "@/components/PasswordField";
import { api } from "@/services";
import { useState } from "react";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { resetPasswordSchema } from "@/validation/resetPasswordSchema";
import { AxiosError } from "axios";

type FormData = yup.InferType<typeof resetPasswordSchema>;

export const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = new URLSearchParams(location.search).get("token");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: yupResolver(resetPasswordSchema) });

  if (!token) {
    return <div>Token inválido ou ausente.</div>;
  }

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await api.post("/auth/reset-password", {
        token,
        newPassword: data.newPassword,
      });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 5000);
    } catch (error) {
      let errorMessage = "Ocorreu uma falha. Tente novamente.";

      if (error instanceof AxiosError) {
        errorMessage = error.response?.data?.message || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="p-8 text-center">
          <h1 className="text-xl font-semibold text-green-700">
            Senha Redefinida!
          </h1>
          <p className="my-4">
            Sua senha foi alterada com sucesso. Você será redirecionado para a
            página de login em 5 segundos.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="p-8 xl:w-xl">
        <h1 className="text-xl my-4 font-semibold">Crie sua Nova Senha</h1>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <PasswordField
            label="Nova Senha"
            {...register("newPassword")}
            error={!!errors.newPassword}
            helperText={errors.newPassword?.message}
          />
          <PasswordField
            label="Confirmar Nova Senha"
            {...register("confirmPassword")}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-red-fatec text-white p-2 rounded mt-4 uppercase"
          >
            {isSubmitting ? "Salvando..." : "Salvar Nova Senha"}
          </button>
        </form>
      </div>
    </div>
  );
};
