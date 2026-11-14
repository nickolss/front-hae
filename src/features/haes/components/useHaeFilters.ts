import { useSearchParams } from "react-router";
import type { HaeStatus, HaeType } from "@/shared/domain/labels";
import type { HaeFilters } from "../types";

/** Filtros guardados na URL: compartilháveis e preservados ao voltar (Nielsen #3 e #6). */
export function useHaeFilters(defaults: Partial<HaeFilters> = {}) {
  const [params, setParams] = useSearchParams();
  const filters: HaeFilters = {
    status: (params.get("status") as HaeStatus) || defaults.status,
    type: (params.get("type") as HaeType) || undefined,
    courseId: params.get("courseId") || undefined,
    institutionId: params.get("institutionId") || undefined,
    semester: params.get("semester") || defaults.semester,
    viewed: params.get("viewed") === null ? undefined : params.get("viewed") === "true",
    q: params.get("q") || undefined,
    page: Number(params.get("page") ?? 0),
    size: Number(params.get("size") ?? 20),
  };

  const update = (patch: Partial<HaeFilters>) => {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries({ page: 0, ...patch })) {
      if (value === undefined || value === "" || value === null || (key === "page" && value === 0))
        next.delete(key);
      else next.set(key, String(value));
    }
    setParams(next, { replace: true });
  };

  const clear = () => setParams(new URLSearchParams(), { replace: true });
  return { filters, update, clear };
}
