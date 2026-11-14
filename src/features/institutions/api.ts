import { api } from "@/shared/api/client";

export interface Institution {
  id: string;
  code: number;
  name: string;
  address: string;
  weeklyHoursLimit: number;
  active: boolean;
}

export interface InstitutionInput {
  code: number;
  name: string;
  address: string;
  weeklyHoursLimit: number;
}

export interface Course {
  id: string;
  institutionId: string;
  name: string;
}

export interface HoursSummary {
  institutionId: string;
  semester: string;
  limit: number;
  allocated: number;
  remaining: number;
}

export const institutionKeys = {
  all: ["institutions"] as const,
  detail: (id: string) => ["institutions", id] as const,
  courses: (id: string) => ["institutions", id, "courses"] as const,
  hours: (id: string, semester?: string) => ["institutions", id, "hours", semester] as const,
};

export const institutionApi = {
  list: async () => (await api.get<Institution[]>("/institutions")).data,
  get: async (id: string) => (await api.get<Institution>(`/institutions/${id}`)).data,
  create: async (input: InstitutionInput) => (await api.post<Institution>("/institutions", input)).data,
  update: async (id: string, input: InstitutionInput) =>
    (await api.put<Institution>(`/institutions/${id}`, input)).data,
  setActive: async (id: string, active: boolean) =>
    (await api.patch<Institution>(`/institutions/${id}/status`, { active })).data,
  setHoursLimit: async (id: string, weeklyHoursLimit: number) =>
    (await api.patch<Institution>(`/institutions/${id}/hours-limit`, { weeklyHoursLimit })).data,
  hours: async (id: string, semester?: string) =>
    (
      await api.get<HoursSummary>(`/institutions/${id}/hours-summary`, {
        params: semester ? { semester } : {},
      })
    ).data,
  courses: async (id: string) => (await api.get<Course[]>(`/institutions/${id}/courses`)).data,
  addCourse: async (id: string, name: string) =>
    (await api.post<Course>(`/institutions/${id}/courses`, { name })).data,
  removeCourse: async (id: string, courseId: string) => {
    await api.delete(`/institutions/${id}/courses/${courseId}`);
  },
};
