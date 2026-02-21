export interface Institution {
	id: string;
	institutionCode: number;
	name: string;
	haeQtd: number;
	address: string;
	active: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface InstitutionPayload {
	institutionCode: number;
	name: string;
	address: string;
	haeQtd: number;
}