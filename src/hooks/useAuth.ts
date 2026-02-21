import { api } from "@/services";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

export interface InstitutionInfo {
  id: string;
  name: string;
  institutionCode: number;
}

export interface LoggedUser {
  id: string;
  name: string;
  email: string;
  role: "PROFESSOR" | "COORDENADOR" | "ADMIN" | "DIRETOR" | "DEV";
  course: string;
  institution: InstitutionInfo;
}

/**
 * Este hook é a fonte única de verdade sobre o estado da autenticação na aplicação.
 * Ele verifica quem está logado ao carregar a página e fornece esses dados para
 * qualquer componente que precisar.
 */
export const useAuth = () => {
  const [user, setUser] = useState<LoggedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [error, setError] = useState<Error | null>(null);

  const fetchUser = useCallback(async () => {
    const email = localStorage.getItem("email");
    const token = localStorage.getItem("token");

    if (!email || !token) {
      setLoading(false);
      setUser(null);
      return;
    }

    try {
      const response = await api.get<LoggedUser>(
        `/employee/get-professor?email=${email}`
      );
      setUser(response.data);
    } catch (error) {
      console.error("Sessão inválida ou erro ao buscar usuário:", error);
      setError(
        error instanceof Error
          ? error
          : new Error("Falha ao carregar dados do usuário.")
      );

      localStorage.removeItem("token");
      localStorage.removeItem("email");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    setUser(null);
    navigate("/login");
  }, [navigate]);

  return { user, loading, error, logout, refetchUser: fetchUser };
};
