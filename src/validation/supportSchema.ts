import { FeedbackFormType } from "@/types/feedbackFormType";
import * as yup from "yup";

export type ErrorFields = {
  email: string;
  subject: string;
  description: string;
};

export const supportSchema: yup.ObjectSchema<FeedbackFormType> = yup.object().shape({
  name: yup.string().required(),
  email: yup
    .string()
    .email("E-mail inválido")
    .required("O e-mail de contato é obrigatório"),
  subject: yup.string().required("O assunto é obrigatório"),
  category: yup
    .mixed<"BUG" | "DOUBT" | "FEEDBACK">()
    .oneOf(["BUG", "DOUBT", "FEEDBACK"], "Selecione uma categoria válida")
    .required("A categoria é obrigatória"),
  description: yup.string().required("A mensagem é obrigatória"),
});
