import { useEffect, type ReactNode } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { onUnauthorized } from "@/shared/api/client";
import { LoadingState } from "@/shared/components/States";
import { SESSION_KEY, useSession } from "@/features/auth/session";
import type { Role } from "@/shared/domain/labels";

/** Exige sessão; ao expirar (401), volta ao login preservando o destino. */
export function RequireAuth({ children }: { children?: ReactNode }) {
  const { user, isLoading } = useSession();
  const location = useLocation();
  const navigate = useNavigate();
  const client = useQueryClient();

  useEffect(() => {
    const unsubscribe = onUnauthorized(() => {
      client.setQueryData(SESSION_KEY, null);
      navigate("/login", { replace: true, state: { from: location.pathname, expired: true } });
    });
    return () => {
      unsubscribe();
    };
  }, [client, navigate, location.pathname]);

  if (isLoading) return <LoadingState label="Verificando sua sessão…" />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children ?? <Outlet />;
}

/** Restringe uma rota a papéis específicos (a API também valida). */
export function RequireRole({ roles, children }: { roles: Role[]; children?: ReactNode }) {
  const { user } = useSession();
  if (!user || !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children ?? <Outlet />;
}

/** Telas públicas: quem já está logado vai direto ao início. */
export function PublicOnly({ children }: { children?: ReactNode }) {
  const { user, isLoading } = useSession();
  if (isLoading) return <LoadingState />;
  if (user) return <Navigate to="/" replace />;
  return children ?? <Outlet />;
}
