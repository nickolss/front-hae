import { InstitutionInfo } from "@/hooks/useAuth";

export interface Employee {
	id: string;
	name: string;
	email: string;
	role: string;
	institution: InstitutionInfo;
}

export interface EmployeeDetails {
	id: string;
	name: string;
	email: string;
	course: string;
	role: "PROFESSOR" | "COORDENADOR" | "ADMIN" | "DIRETOR";
	createdAt: string;
	updatedAt: string;
}

interface EmployeeSummary {
	id: string;
	name: string;
	email: string;
	course: string;
	haeCount: number;
}
