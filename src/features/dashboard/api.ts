import { api } from "@/shared/api/client";
import { cleanParams } from "@/shared/api/types";
import type { HaeStatus, HaeType } from "@/shared/domain/labels";

export interface Dashboard {
  semester: string;
  weeklyHoursLimit: number | null;
  stats: {
    totalHaes: number;
    allocatedWeeklyHours: number;
    byStatus: Record<HaeStatus, number>;
    byType: Record<HaeType, number>;
    byCourse: Record<string, number>;
    employees: number;
  };
}

export const dashboardApi = {
  get: async (params: { institutionId?: string; semester?: string }) =>
    (await api.get<Dashboard>("/dashboard", { params: cleanParams(params) })).data,
};
