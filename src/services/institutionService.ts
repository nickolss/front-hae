import { Institution, InstitutionPayload } from "@/types/institution";
import { api } from ".";

export interface InstitutionCourse {
    id: string;
    courseName: string;
    institutionId: string;
    institutionCode: number;
    institutionName: string;
}

export interface IInstitutionService {
	createInstitution(data: InstitutionPayload): Promise<Institution>;
    getAllInstitutions(): Promise<Institution[]>;
    getInstitutionById(id: string): Promise<Institution>;
    updateInstitution(id: string, data: InstitutionPayload): Promise<Institution>;
    getCoursesByInstitutionId(institutionId: string): Promise<InstitutionCourse[]>;
	getCoursesByInstitutionCode(institutionCode: number): Promise<InstitutionCourse[]>;
    addInstitutionCourse(institutionId: string, courseName: string): Promise<InstitutionCourse>;
    removeInstitutionCourse(courseId: string): Promise<void>;
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

const getCoursesByInstitutionId = async (institutionId: string): Promise<InstitutionCourse[]> => {
    try {
        const response = await api.get<InstitutionCourse[]>("/institution/getCoursesByInstitutionId", {
            params: { institutionId },
        });
        return response.data;
    } catch (error) {
        console.error("Erro no serviço ao buscar cursos por instituição:", error);
        throw error;
    }
};

const getCoursesByInstitutionCode = async (institutionCode: number): Promise<InstitutionCourse[]> => {
    try {
        const response = await api.get<InstitutionCourse[]>("/institution/getCoursesByInstitutionCode", {
            params: { institutionCode },
        });
        return response.data;
    } catch (error) {
        console.error("Erro no serviço ao buscar cursos por código de instituição:", error);
        throw error;
    }
};

const addInstitutionCourse = async (institutionId: string, courseName: string): Promise<InstitutionCourse> => {
    try {
        const response = await api.post<InstitutionCourse>("/institution/course", {
            institutionId,
            courseName,
        });
        return response.data;
    } catch (error) {
        console.error("Erro no serviço ao adicionar curso:", error);
        throw error;
    }
};

const removeInstitutionCourse = async (courseId: string): Promise<void> => {
    try {
        await api.delete(`/institution/course/${courseId}`);
    } catch (error) {
        console.error("Erro no serviço ao remover curso:", error);
        throw error;
    }
};

export const institutionService: IInstitutionService = {
	createInstitution,
    getAllInstitutions,
    getInstitutionById,
    updateInstitution,
    getCoursesByInstitutionId,
	getCoursesByInstitutionCode,
    addInstitutionCourse,
    removeInstitutionCourse,
};