import { useEffect } from "react";
import {
	HaeDataType,
	FormErrors,
} from "@/components/StepperForm/types/haeFormTypes";

// Regex para validar o formato de horário HH:MM - HH:MM
const TIME_RANGE_REGEX =
	/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]\s-\s([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

/**
 * Converte uma string de tempo (HH:MM) para minutos totais desde a meia-noite.
 * @param timeStr A string de tempo no formato "HH:MM".
 * @returns O total de minutos.
 */
const parseTime = (timeStr: string): number => {
	const [hours, minutes] = timeStr.split(":").map(Number);
	return hours * 60 + minutes;
};

/**
 * Hook para calcular e atualizar as horas semanais TOTAIS (weeklyHours)
 * com base no horário diário e no número de dias selecionados.
 *
 * @param timeRange String com a faixa de horário diário (Ex: "08:00 - 12:00").
 * @param dayOfWeek Array com os dias da semana selecionados.
 * @param setFormData Função para atualizar o formData no componente pai.
 * @param errors Objeto de erros do formulário.
 * @param setErrors Função para atualizar o estado de erros.
 */
export const useHaeHoursCalculation = (
	timeRange: string,
	dayOfWeek: string[], // Adicionado parâmetro para os dias da semana
	setFormData: <K extends keyof HaeDataType>(
		field: K,
		value: HaeDataType[K]
	) => void,
	errors: FormErrors,
	setErrors: React.Dispatch<React.SetStateAction<FormErrors>>
) => {
	useEffect(() => {
		// A condição agora verifica se há dias selecionados
		if (timeRange && dayOfWeek.length > 0 && TIME_RANGE_REGEX.test(timeRange)) {
			const [startTimeStr, endTimeStr] = timeRange.split(" - ");
			const startMinutes = parseTime(startTimeStr);
			const endMinutes = parseTime(endTimeStr);

			const durationInMinutes = endMinutes - startMinutes;

			// Apenas calcula se a duração for positiva
			if (durationInMinutes > 0) {
				const dailyDurationInHours = durationInMinutes / 60;

				// Multiplica a duração diária pelo número de dias
				const numberOfDays = dayOfWeek.length;
				const totalWeeklyHours = dailyDurationInHours * numberOfDays;

				setFormData("weeklyHours", Math.round(totalWeeklyHours * 100) / 100);

				// Limpa o erro de timeRange se o formato estiver correto agora
				if (errors.timeRange) {
					setErrors((prevErrors) => ({ ...prevErrors, timeRange: undefined }));
				}
			} else {
				setFormData("weeklyHours", 0);
			}
		} else {
			// Zera as horas se qualquer uma das condições não for atendida
			setFormData("weeklyHours", 0);
		}
	}, [timeRange, dayOfWeek, setFormData, errors.timeRange, setErrors]); // Adicionado dayOfWeek como dependência
};
