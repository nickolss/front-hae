import { api, ensureCsrfToken } from "@/shared/api/client";
import type { Role } from "@/shared/domain/labels";

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: Role;
  institution: { id: string; name: string; code: number } | null;
  course: { id: string; name: string } | null;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  institutionCode: number;
  courseId: string;
}

export interface PublicInstitution {
  code: number;
  name: string;
}

export interface CourseOption {
  id: string;
  institutionId: string;
  name: string;
}

export const authApi = {
  async me(): Promise<Profile | null> {
    try {
      return (await api.get<Profile>("/me")).data;
    } catch (error) {
      if ((error as { response?: { status?: number } }).response?.status === 401) return null;
      throw error;
    }
  },
  async login(email: string, password: string) {
    await ensureCsrfToken();
    return (await api.post<Profile>("/auth/login", { email, password })).data;
  },
  async logout() {
    await ensureCsrfToken();
    await api.post("/auth/logout");
  },
  async register(input: RegisterInput) {
    await ensureCsrfToken();
    return (await api.post<{ message: string }>("/auth/register", input)).data;
  },
  async activate(token: string) {
    await ensureCsrfToken();
    return (await api.post<Profile>("/auth/activate", { token })).data;
  },
  async forgotPassword(email: string) {
    await ensureCsrfToken();
    return (await api.post<{ message: string }>("/auth/password/forgot", { email })).data;
  },
  async resetPassword(token: string, newPassword: string) {
    await ensureCsrfToken();
    await api.post("/auth/password/reset", { token, newPassword });
  },
  async publicInstitutions() {
    return (await api.get<PublicInstitution[]>("/public/institutions")).data;
  },
  async publicCourses(code: number) {
    return (await api.get<CourseOption[]>(`/public/institutions/${code}/courses`)).data;
  },
};
