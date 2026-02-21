import * as yup from "yup";

export const loginSchema = yup
	.object({
		email: yup
			.string()
			.email("E-mail inválido")
			.matches(
				/@(fatec|cps)\.sp\.gov\.br$/,
				"E-mail deve ser institucional (@fatec ou @cps)"
			)
			.required("E-mail é obrigatório"),
		password: yup
			.string()
			.min(6, "Senha deve ter no mínimo 6 caracteres")
			.required("Senha é obrigatória"),
	})
	.required();
