import * as yup from "yup";
import { WeeklySchedule } from "@/components/StepperForm/types/haeFormTypes";

const getToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

const parseTime = (timeStr: string) => {
	if (!timeStr) return 0;
	const [hours, minutes] = timeStr.split(":").map(Number);
	return hours * 60 + minutes;
};

export const haeFormSchema = yup.object().shape({
	employeeId: yup.string().required("O ID do funcionário é obrigatório"),
	course: yup.string().required("Curso é obrigatório"),
	projectTitle: yup.string().required("Título do projeto é obrigatório"),
	projectType: yup.string().required("Tipo de projeto é obrigatório"),
	projectDescription: yup
		.string()
		.required("Descrição do projeto é obrigatória"),

	dayOfWeek: yup
		.array()
		.of(yup.string().required())
		.min(1, "Selecione pelo menos um dia da semana")
		.required("Os dias da semana são obrigatórios"),

	weeklySchedule: yup
		.object()
		.test(
			"schedule-validation",
			"Todos os dias selecionados devem ter horários válidos.",
			(value, context) => {
				const schedule = value as WeeklySchedule;
				const dayOfWeek = context.parent.dayOfWeek as string[];

				if (!schedule || dayOfWeek.length === 0) {
					return true;
				}

				for (const day of dayOfWeek) {
					const entry = schedule[day];
					if (!entry || !entry.timeRange) {
						return context.createError({
							message: `O horário para ${day} é obrigatório.`,
						});
					}

					const [startTime, endTime] = entry.timeRange.split(" - ");
					if (!startTime || !endTime) {
						return context.createError({
							message: `Formato de horário inválido para ${day}.`,
						});
					}

					const startMinutes = parseTime(startTime);
					const endMinutes = parseTime(endTime);

					if (startMinutes >= endMinutes) {
						return context.createError({
							message: `Em ${day}, a hora final deve ser após a inicial.`,
						});
					}

					const durationHours = (endMinutes - startMinutes) / 60;
					if (durationHours < 1 || durationHours > 8) {
						return context.createError({
							message: `Em ${day}, a duração deve ser entre 1 e 8 horas.`,
						});
					}
				}

				return true;
			}
		),

	startDate: yup
		.date()
		.required("Data de início é obrigatória")
		.typeError("Forneça uma data de início válida")
		.when('$isEditMode', {
			is: false,
			then: (schema) => 
				schema.min(getToday(), 'A data de início não pode ser no passado.'),
			otherwise: (schema) => schema,
		}),

	endDate: yup
		.date()
		.required("Data de fim é obrigatória")
		.typeError("Forneça uma data de fim válida")
		.min(
			yup.ref("startDate"),
			"A data final não pode ser anterior à data de início"
		),

	modality: yup.string().required("Modalidade é obrigatória"),
	dimensao: yup.string().required("A dimensão da HAE é obrigatória"),
	studentRAs: yup.array().when("projectType", {
		is: (type: string) => type === "TCC" || type === "Estagio",
		then: (schema) =>
			schema
				.of(
					yup
						.string()
						.transform((value) => value.trimEnd().replace(/\D/g, ""))
						.length(13, "O RA deve conter exatamente 13 números")
						.required("RA é obrigatório")
				)
				.min(1, "Informe pelo menos um RA")
				.required("É necessário informar os RAs"),
		otherwise: (schema) => schema.strip(),
	}),

	weeklyHours: yup
		.number()
		.min(1, "O total de horas semanais deve ser de no mínimo 1.")
		.required(),
	timeRange: yup.string().optional(),
	observations: yup.string().optional(),
});

export const stepOneSchema = yup.object().shape({
	projectTitle: yup.string().required("Título do projeto é obrigatório"),
	projectType: yup.string().required("Tipo de projeto é obrigatório"),
	course: yup.string().required("Curso é obrigatório"),
	projectDescription: yup
		.string()
		.required("Descrição do projeto é obrigatória"),
	modality: yup.string().required("Modalidade é obrigatória"),
	dimensao: yup.string().required("A dimensão da HAE é obrigatória"),
	studentRAs: yup.array().when("projectType", {
		is: (type: string) => type === "TCC" || type === "Estagio",
		then: (schema) =>
			schema
				.of(
					yup
						.string()
						.transform((value) => value.trimEnd().replace(/\D/g, ""))
						.length(13, "O RA deve conter exatamente 13 números")
						.required("RA é obrigatório")
				)
				.min(1, "Informe pelo menos um RA")
				.required("É necessário informar os RAs"),
		otherwise: (schema) => schema.strip(),
	}),
});
