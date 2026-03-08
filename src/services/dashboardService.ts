import { api } from ".";
import { Hae } from "@/types/hae";
import { LoggedUser } from "@/hooks/useAuth";
import { Institution } from "@/types/institution";

export interface DashboardStats {
	haeCount: number;
	userCount: number;
	institutionCount: number;
	haesByStatus: Record<string, number>;
	usersByRole: Record<string, number>;
	haesByMonth: Array<{ label: string; value: number }>;
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

		const haes = haesRes.data;
		const users = usersRes.data;

		const haesByStatus = haes.reduce<Record<string, number>>((acc, hae) => {
			acc[hae.status] = (acc[hae.status] || 0) + 1;
			return acc;
		}, {});

		const usersByRole = users.reduce<Record<string, number>>((acc, user) => {
			acc[user.role] = (acc[user.role] || 0) + 1;
			return acc;
		}, {});

		const monthFormatter = new Intl.DateTimeFormat("pt-BR", {
			month: "short",
			year: "2-digit",
		});

		const haesByMonthMap = new Map<string, number>();
		for (let i = 5; i >= 0; i--) {
			const date = new Date();
			date.setDate(1);
			date.setMonth(date.getMonth() - i);
			const key = `${date.getFullYear()}-${date.getMonth()}`;
			haesByMonthMap.set(key, 0);
		}

		haes.forEach((hae) => {
			const createdAt = new Date(hae.createdAt);
			if (Number.isNaN(createdAt.getTime())) return;

			const key = `${createdAt.getFullYear()}-${createdAt.getMonth()}`;
			if (haesByMonthMap.has(key)) {
				haesByMonthMap.set(key, (haesByMonthMap.get(key) || 0) + 1);
			}
		});

		const haesByMonth = Array.from(haesByMonthMap.entries()).map(([key, value]) => {
			const [year, month] = key.split("-").map(Number);
			const labelDate = new Date(year, month, 1);
			return {
				label: monthFormatter.format(labelDate),
				value,
			};
		});

		return {
			haeCount: haes.length,
			userCount: users.length,
			institutionCount: institutionsRes.data.length,
			haesByStatus,
			usersByRole,
			haesByMonth,
		};
	} catch (error) {
		console.error("Erro no serviço ao buscar estatísticas do dashboard:", error);
		throw error;
	}
};

export const dashboardService: IDashboardService = {
	getDevDashboardStats,
};