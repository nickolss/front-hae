import axios from "axios";

/**
 * Cliente HTTP único. A API é servida na mesma origem (proxy do Vite em dev e rewrite da Vercel em produção),
 * então o cookie de sessão HttpOnly e o cookie XSRF-TOKEN funcionam sem CORS.
 */
export const api = axios.create({
  baseURL: "/api/v1",
  withCredentials: true,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
  timeout: 30_000,
});

type UnauthorizedListener = () => void;
const listeners = new Set<UnauthorizedListener>();

/** Notifica a aplicação quando uma requisição autenticada recebe 401 (sessão expirada). */
export function onUnauthorized(listener: UnauthorizedListener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

api.interceptors.response.use(undefined, (error) => {
  const url: string = error?.config?.url ?? "";
  if (error?.response?.status === 401 && !url.startsWith("/auth/") && url !== "/me") {
    listeners.forEach((listener) => listener());
  }
  return Promise.reject(error);
});

/** Garante o cookie XSRF-TOKEN antes do primeiro POST (ex.: tela de login). */
export async function ensureCsrfToken() {
  if (!document.cookie.split("; ").some((c) => c.startsWith("XSRF-TOKEN="))) {
    await api.get("/auth/csrf");
  }
}
