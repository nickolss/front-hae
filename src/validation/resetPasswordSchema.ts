import * as yup from "yup";

export const resetPasswordSchema = yup
  .object({
    newPassword: yup
      .string()
      .min(6, "A nova senha deve ter no mínimo 6 caracteres")
      .required("Nova senha é obrigatória"),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref("newPassword")], "As senhas devem ser iguais")
      .required("Confirmação de senha é obrigatória"),
  })
  .required();
