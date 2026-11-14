import { api } from "@/shared/api/client";
import { cleanParams, type Page } from "@/shared/api/types";
import type { Role } from "@/shared/domain/labels";
import type { Profile } from "@/features/auth/api";

export interface EmployeeSummary {
  id: string;
  name: string;
  email: string;
  role: Role;
  institutionId: string | null;
  institutionName: string | null;
  courseId: string | null;
  courseName: string | null;
  haeCount: number;
}

export interface EmployeeFilters {
  institutionId?: string;
  role?: Role;
  q?: string;
  page?: number;
  size?: number;
}

export interface CreateEmployeeInput {
  name: string;
  email: string;
  role: Role;
  institutionId?: string;
  courseId?: string;
  temporaryPassword: string;
}

export const employeeKeys = {
  all: ["employees"] as const,
  list: (f: EmployeeFilters) => ["employees", f] as const,
};

export const employeeApi = {
  search: async (filters: EmployeeFilters) =>
    (await api.get<Page<EmployeeSummary>>("/employees", { params: cleanParams(filters) })).data,
  create: async (input: CreateEmployeeInput) => (await api.post<Profile>("/employees", input)).data,
  update: async (id: string, input: { role?: Role; courseId?: string }) =>
    (await api.patch<Profile>(`/employees/${id}`, input)).data,
  remove: async (id: string) => {
    await api.delete(`/employees/${id}`);
  },
};
