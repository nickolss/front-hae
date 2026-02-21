import { useLoggedEmployee } from "@/hooks/useLoggedEmployee";
import { EmployeeInfoDisplay } from "@components/EmployeeInfoDisplay";

export const Header = () => {
  const { employee, isLoadingEmployee } = useLoggedEmployee();

  return (
    <header className="col-start-2 row-start-1 border-b border-gray-400 shadow-black/10 bg-white flex items-center justify-between p-4 ">
      <h1 className="text-2xl font-bold text-red-600">
        Sistema de Controle de HAEs
      </h1>
      <EmployeeInfoDisplay employee={employee} isLoading={isLoadingEmployee} />
    </header>
  );
};
