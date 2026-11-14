import { isAxiosError } from "axios";

/** Corpo de erro RFC 9457 retornado pela API. */
export interface ProblemDetail {
  title?: string;
  status?: number;
  detail?: string;
  errors?: Record<string, string>;
}

const FALLBACK = "Não foi possível concluir a operação. Tente novamente.";

export function problemOf(error: unknown): ProblemDetail | undefined {
  if (isAxiosError(error) && error.response?.data && typeof error.response.data === "object") {
    return error.response.data as ProblemDetail;
  }
  return undefined;
}

/** Mensagem amigável para exibir ao usuário. */
export function errorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    if (!error.response) {
      return "Sem conexão com o servidor. Verifique sua internet; se o sistema estava inativo, ele pode levar até 1 minuto para acordar.";
    }
    if (error.response.status >= 500) {
      return "O servidor encontrou um erro. Tente novamente em instantes.";
    }
  }
  return problemOf(error)?.detail ?? FALLBACK;
}

/** Erros de validação por campo, quando a API os informa. */
export function fieldErrors(error: unknown): Record<string, string> {
  return problemOf(error)?.errors ?? {};
}
