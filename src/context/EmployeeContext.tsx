import { createContext, useContext, useState, ReactNode } from "react";
import { Employee } from "@/types/employee";

interface EmployeeContextType {
  employee: Employee | null;
  setEmployee: (employee: Employee) => void;
}

const EmployeeContext = createContext<EmployeeContextType | undefined>(
  undefined
);

export const EmployeeProvider = ({ children }: { children: ReactNode }) => {
  const [employee, setEmployee] = useState<Employee | null>(null);

  return (
    <EmployeeContext.Provider value={{ employee, setEmployee }}>
      {children}
    </EmployeeContext.Provider>
  );
};

export const useEmployee = () => {
  const context = useContext(EmployeeContext);
  if (!context) {
    throw new Error("useEmployee deve ser usado dentro de EmployeeProvider");
  }
  return context;
};
