import { useQuery } from "@tanstack/react-query";
import { api } from "./client";
import type { Role } from "@/shared/domain/labels";

export interface DemoAccount {
  name: string;
  email: string;
  role: Role;
  description: string;
}

export interface SystemInfo {
  demo: boolean;
  demoAccounts: DemoAccount[];
}

const OFF: SystemInfo = { demo: false, demoAccounts: [] };

/** Informações públicas do ambiente (ex.: se é uma demonstração). Falhas não bloqueiam a interface. */
export function useSystemInfo(): SystemInfo {
  const query = useQuery({
    queryKey: ["system-info"],
    queryFn: async () => (await api.get<SystemInfo>("/public/info")).data,
    staleTime: Infinity,
    retry: false,
  });
  return query.data ?? OFF;
}
