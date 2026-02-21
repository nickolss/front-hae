export interface FeedbackFormType {
	name: string;
	email: string;
	subject: string;
	description: string;
	category: "BUG" | "DOUBT" | "FEEDBACK";
}
