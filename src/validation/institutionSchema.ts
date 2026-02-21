import * as yup from "yup";

export const institutionSchema = yup.object({
  institutionCode: yup
    .number()
    .typeError("O código deve ser um número")
    .positive("O código deve ser positivo")
    .required("O código é obrigatório"),
  name: yup.string().required("O nome é obrigatório"),
  address: yup.string().required("O endereço é obrigatório"),
  haeQtd: yup
    .number()
    .typeError("O limite deve ser um número")
    .min(0, "O limite não pode ser negativo")
    .required("O limite de HAEs é obrigatório"),
});
