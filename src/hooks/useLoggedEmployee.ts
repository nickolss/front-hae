import { useEffect, useState } from "react";

import { Employee } from "@/types/employee";
import { authService, employeeService } from "../services";

interface UseLoggedEmployeeReturn {
  employee: Employee | null;
  isLoadingEmployee: boolean;
  error: Error | null;
}

export const useLoggedEmployee = (): UseLoggedEmployeeReturn => {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isLoadingEmployee, setIsLoadingEmployee] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchEmployeeData = async (emailRequest: string) => {
      try {
        if (!authService.checkCookie) {
          throw new Error(
            "Método checkCookie não implementado no authService."
          );
        }
        const userId = await authService.checkCookie(emailRequest);

        if (!userId) {
          setEmployee(null);
          return;
        }

        const employeeData = await employeeService.getProfessor(emailRequest);
        setEmployee(employeeData);
      } catch (err) {
        console.error("Erro ao carregar dados do funcionário logado:", err);
        setError(
          err instanceof Error
            ? err
            : new Error("Erro desconhecido ao carregar o funcionário.")
        );
        setEmployee(null);
      } finally {
        setIsLoadingEmployee(false);
      }
    };

    const email = localStorage.getItem("email");
    if (email) {
      fetchEmployeeData(email);
    } else {
      setIsLoadingEmployee(false);
      setEmployee(null);
    }
  }, []);

  return { employee, isLoadingEmployee, error };
};
