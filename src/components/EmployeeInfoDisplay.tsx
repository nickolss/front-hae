import PersonIcon from "@mui/icons-material/Person";
import { Employee } from "@/types/employee";

interface EmployeeInfoDisplayProps {
	employee: Employee | null;
	isLoading: boolean;
	showIcon?: boolean;
}

export const EmployeeInfoDisplay = ({
	employee,
	isLoading,
	showIcon = true,
}: EmployeeInfoDisplayProps) => {
	if (isLoading) {
		return (
			<div className="flex items-center text-sm text-gray-700 px-2 animate-pulse">
				<div className="flex flex-col">
					<div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
					<div className="h-3 bg-gray-200 rounded w-32"></div>
				</div>
				{showIcon && (
					<div className="pl-4">
						<PersonIcon className="text-gray-400" />
					</div>
				)}
			</div>
		);
	}

	if (!employee) {
		return (
			<div className="flex items-center text-sm text-gray-700 px-2">
				<div>
					<p className="font-semibold">Visitante</p>
					<p className="text-gray-500">Não autenticado</p>
				</div>
				{showIcon && (
					<div className="pl-4">
						<PersonIcon className="text-gray-500" />
					</div>
				)}
			</div>
		);
	}

	return (
		<div className="flex items-center text-sm text-gray-700 px-2">
			<div className="px-2 text-right md:text-left">
				<p className="font-semibold truncate">{employee.name}</p>
				<p className="text-gray-500">{employee.email}</p>
				<p className="text-gray-500 text-xs">{employee.role}</p>
			</div>
			{showIcon && (
				<div className="pl-4 hidden md:flex items-center justify-center">
					<PersonIcon className="text-blue-600 text-3xl" />
				</div>
			)}
		</div>
	);
};
