import { Institution, InstitutionPayload } from "@/types/institution";
import { api } from ".";

export interface IInstitutionService {
	createInstitution(data: InstitutionPayload): Promise<Institution>;
    getAllInstitutions(): Promise<Institution[]>;
    getInstitutionById(id: string): Promise<Institution>;
    updateInstitution(id: string, data: InstitutionPayload): Promise<Institution>;
}

const createInstitution = async (data: InstitutionPayload): Promise<Institution> => {
	try {
		const response = await api.post<Institution>("/institution/create", data);
		return response.data;
	} catch (error) {
		console.error("Erro no serviço ao criar instituição:", error);
		throw error;
	}
};

const getAllInstitutions = async (): Promise<Institution[]> => {
    try {
        const response = await api.get<Institution[]>("/institution/getAll");
        return response.data;
    } catch (error) {
        console.error("Erro no serviço ao buscar instituições:", error);
        throw error;
    }
}

const getInstitutionById = async (id: string): Promise<Institution> => {
    try {
        const response = await api.get<Institution>(`/institution/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Erro no serviço ao buscar instituição com ID ${id}:`, error);
        throw error;
    }
}

const updateInstitution = async (id: string, data: InstitutionPayload): Promise<Institution> => {
    try {
        const response = await api.put<Institution>(`/institution/update/${id}`, data);
        return response.data;
    } catch (error) {
        console.error(`Erro no serviço ao atualizar instituição com ID ${id}:`, error);
        throw error;
    }
}

export const institutionService: IInstitutionService = {
	createInstitution,
    getAllInstitutions,
    getInstitutionById,
    updateInstitution,
};