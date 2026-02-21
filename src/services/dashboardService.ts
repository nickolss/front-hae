import { api } from ".";
import { Hae } from "@/types/hae";
import { LoggedUser } from "@/hooks/useAuth";
import { Institution } from "@/types/institution";

export interface DashboardStats {
	haeCount: number;
	userCount: number;
	institutionCount: number;
}

export interface IDashboardService {
	getDevDashboardStats(): Promise<DashboardStats>;
}

const getDevDashboardStats = async (): Promise<DashboardStats> => {
	try {
		const [haesRes, usersRes, institutionsRes] = await Promise.all([
			api.get<Hae[]>("/hae/getAll"),
			api.get<LoggedUser[]>("/employee/getAllEmployee"),
			api.get<Institution[]>("/institution/getAll"),
		]);

		return {
			haeCount: haesRes.data.length,
			userCount: usersRes.data.length,
			institutionCount: institutionsRes.data.length,
		};
	} catch (error) {
		console.error("Erro no serviço ao buscar estatísticas do dashboard:", error);
		throw error;
	}
};

export const dashboardService: IDashboardService = {
	getDevDashboardStats,
};