import { FeedbackFormType } from "@/types/feedbackFormType";
import { api } from "./axios.config";

export interface IEmailService {
	sendFeedbackEmail(feedback: FeedbackFormType): Promise<void>;
}

const sendFeedbackEmail = async (feedback: FeedbackFormType): Promise<void> => {
	try {
		const response = await api.post("/feedback", feedback);
		return response.data;
	} catch (error) {
		console.error("Erro ao enviar e-mail de feedback:", error);
		throw error;
	}
};

export const emailService: IEmailService = {
	sendFeedbackEmail,
};
