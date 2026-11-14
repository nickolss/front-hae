import { api } from "@/shared/api/client";
import { cleanParams, type Page } from "@/shared/api/types";
import type { ClosureInput, Hae, HaeFilters, HaeInput, HaeSummary } from "./types";

export const haeKeys = {
  all: ["haes"] as const,
  list: (scope: "mine" | "all", filters: HaeFilters) => ["haes", scope, filters] as const,
  detail: (id: string) => ["haes", "detail", id] as const,
};

export const haeApi = {
  search: async (filters: HaeFilters) =>
    (await api.get<Page<HaeSummary>>("/haes", { params: cleanParams(filters) })).data,
  mine: async (filters: HaeFilters) =>
    (await api.get<Page<HaeSummary>>("/me/haes", { params: cleanParams(filters) })).data,
  get: async (id: string) => (await api.get<Hae>(`/haes/${id}`)).data,
  create: async (input: HaeInput) => (await api.post<Hae>("/haes", input)).data,
  update: async (id: string, input: HaeInput) => (await api.put<Hae>(`/haes/${id}`, input)).data,
  remove: async (id: string) => {
    await api.delete(`/haes/${id}`);
  },
  review: async (id: string, decision: "APPROVE" | "REJECT", comment?: string) =>
    (await api.post<Hae>(`/haes/${id}/review`, { decision, comment })).data,
  setViewed: async (id: string, viewed: boolean) =>
    (await api.patch<Hae>(`/haes/${id}/viewed`, { viewed })).data,
  requestClosure: async (id: string, input: ClosureInput) =>
    (await api.post<Hae>(`/haes/${id}/closure`, input)).data,
  reviewClosure: async (id: string, decision: "APPROVE" | "REJECT", comment?: string) =>
    (await api.post<Hae>(`/haes/${id}/closure/review`, { decision, comment })).data,
  upload: async (id: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return (await api.post<Hae>(`/haes/${id}/attachments`, form)).data;
  },
  removeAttachment: async (id: string, attachmentId: string) =>
    (await api.delete<Hae>(`/haes/${id}/attachments/${attachmentId}`)).data,
};
