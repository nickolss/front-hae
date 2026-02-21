import { useState } from "react";
import { useSnackbar } from "./useSnackbar";
import { FeedbackFormType } from "@/types/feedbackFormType";
import { IEmailService } from "@/services/emailService";

export const useFeedback = (feedbackService: IEmailService) => {
	const { showSnackbar } = useSnackbar();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleFeedback = async (
		feedback: FeedbackFormType
	): Promise<boolean> => {
		setIsSubmitting(true);
		try {
			await feedbackService.sendFeedbackEmail(feedback);
			showSnackbar(
				"Sua mensagem foi enviada com sucesso! Agradecemos o contato.",
				"success"
			);
			return true;
		} catch (error) {
			console.error("Erro ao enviar feedback:", error);
			showSnackbar(
				"Erro ao enviar sua mensagem. Tente novamente mais tarde.",
				"error"
			);
			return false;
		} finally {
			setIsSubmitting(false);
		}
	};

	return { handleFeedback, isSubmitting };
};
