import { HaeDataType } from "@components/StepperForm/types/haeFormTypes";
import { api } from "./axios.config";
import { Hae } from "@/types/hae";

export interface IHaeService {
  createHae(data: HaeDataType): Promise<unknown>;
  getHaesByProfessorId(professorId: string): Promise<[Hae]>;
  updateHae(id: string, data: HaeDataType): Promise<unknown>;
}

const createHae = async (data: HaeDataType) => {
  try {
    const result = await api.post("/hae/create", data);
    return result.data;
  } catch (error) {
    console.log("Erro ao cadastrar HAE: " + error);
    throw error;
  }
};

const getHaesByProfessorId = async (professorId: string) => {
  try {
    const result = await api.get(`hae/getHaesByProfessor/${professorId}`);
    return result.data;
  } catch (error) {
    console.log("Erro recuperar HAE por professor: " + error);
    throw error;
  }
};

const updateHae = async (id: string, data: HaeDataType) => {
  const response = await api.put(`/hae/update/${id}`, data);
  return response.data;
};

export const haeService: IHaeService = {
  createHae: async (data: HaeDataType) => {
    return await createHae(data);
  },
  getHaesByProfessorId: async (professorId: string) => {
    return await getHaesByProfessorId(professorId);
  },
  updateHae: async (id: string, data: HaeDataType) => {
    return await updateHae(id, data);
  },
};
