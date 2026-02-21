import * as yup from "yup";

export const registerSchema = yup
  .object({
    name: yup
      .string()
      .min(3, "Nome deve ter no mínimo 3 caracteres")
      .matches(/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/, "O nome deve conter apenas letras.")
      .required("Nome é obrigatório"),
    email: yup
      .string()
      .email("E-mail inválido")
      .matches(
        /@(fatec|cps)\.sp\.gov\.br$/,
        "E-mail deve ser institucional (@fatec ou @cps)"
      )
      .required("E-mail é obrigatório"),
    institution: yup.string().required("A unidade da Fatec é obrigatória"),
    course: yup.string().required("Curso é obrigatório"),
    password: yup
      .string()
      .min(6, "Senha deve ter no mínimo 6 caracteres")
      .required("Senha é obrigatória"),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref("password")], "As senhas devem coincidir")
      .required("Confirmação de senha é obrigatória"),
  })
  .required();
