import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { authApi, type Profile } from "./api";

export const SESSION_KEY = ["session"] as const;

/** Usuário logado (fonte única de verdade: GET /me; o cookie é HttpOnly e invisível ao JS). */
export function useSession() {
  const query = useQuery({ queryKey: SESSION_KEY, queryFn: authApi.me, staleTime: 5 * 60_000, retry: false });
  return { user: query.data ?? null, isLoading: query.isPending, error: query.error };
}

/** Usuário garantido (para uso dentro de rotas protegidas). */
export function useUser(): Profile {
  const { user } = useSession();
  if (!user) throw new Error("useUser fora de rota autenticada");
  return user;
}

export function useLogout() {
  const client = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      client.clear();
      client.setQueryData(SESSION_KEY, null);
      navigate("/login", { replace: true });
    },
  });
}
