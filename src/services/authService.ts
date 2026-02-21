import { LoggedUser } from "@/hooks/useAuth";
import { api } from "./axios.config";

export interface IAuthService {
  register(data: RegisterRequest): Promise<unknown>;
  login(data: LoginRequest): Promise<LoggedUser>;
  verifyCode(token: string, institutionCode: number): Promise<LoggedUser>;
  logout(): Promise<unknown>;
  checkCookie(email: string): Promise<unknown>;
}

interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  course: string;
  institution: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

const register = async (data: RegisterRequest) => {
  try {
    const response = await api.post("/auth/send-email-code", data);
    return response.data;
  } catch (error) {
    console.error("Erro ao cadastrar", error);
    throw error;
  }
};

const verifyEmailCode = async (token: string, institutionCode: number) => {
  try {
    const response = await api.get(
      `/auth/verify-email?token=${token}&institutionCode=${institutionCode}`
    );
    return response.data;
  } catch (error) {
    console.log("Erro ao verificar token: " + error);
    throw error;
  }
};

const login = async (data: LoginRequest) => {
  try {
    const response = await api.post("/auth/login", data);
    return response.data;
  } catch (error) {
    console.log("Erro ao fazer login." + error);
    throw error;
  }
};

const logout = async () => {
  try {
    await api.post("/auth/logout");
  } catch (error) {
    console.log("Erro ao fazer logout." + error);
    throw error;
  }
};

const checkCookie = async (email: string) => {
  try {
    const response = await api.get(`/employee/get-professor?email=${email}`);
    return response.data.id;
  } catch (error) {
    console.error("Erro ao verificar cookie");
    throw error;
  }
};

export const authService: IAuthService = {
  register: async (data) => {
    return await register(data);
  },
  login: async (data) => {
    return await login(data);
  },
  verifyCode: async (token: string, institutionCode: number) => {
    return await verifyEmailCode(token, institutionCode);
  },
  logout: async () => {
    return await logout();
  },
  checkCookie: async (emailRequest: string) => {
    return await checkCookie(emailRequest);
  },
};
