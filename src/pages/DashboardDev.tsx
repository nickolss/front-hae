import { useEffect, useState } from "react";
import { Paper, Typography } from "@mui/material";
import { dashboardService, DashboardStats } from "@/services/dashboardService";
import { AppLayout } from "@/layouts";

const StatCard = ({
  title,
  value,
  loading,
}: {
  title: string;
  value: number;
  loading: boolean;
}) => (
  <Paper elevation={2} sx={{ p: 3, textAlign: "center" }}>
    <Typography variant="h6" color="text.secondary">
      {title}
    </Typography>
    <Typography variant="h3" fontWeight="bold" color="error">
      {loading ? "..." : value}
    </Typography>
  </Paper>
);

export const DashboardDev = () => {
  const [stats, setStats] = useState<DashboardStats>({
    haeCount: 0,
    userCount: 0,
    institutionCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const fetchedStats = await dashboardService.getDevDashboardStats();
        setStats(fetchedStats);
      } catch (err) {
        console.error("Erro ao buscar estatísticas:", err);
        setError("Não foi possível carregar os dados do painel.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <AppLayout>
      <main className="col-start-2 row-start-2 p-4 md:p-8 overflow-auto bg-gray-50 pt-20 md:pt-4 h-full">
        <h2 className="subtitle font-semibold">Painel do Desenvolvedor</h2>
        <p className="text-gray-600 mb-6">
          Visão geral e monitoramento do sistema.
        </p>

        {error && <p className="text-red-500">{error}</p>}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Total de HAEs"
            value={stats.haeCount}
            loading={loading}
          />
          <StatCard
            title="Total de Usuários"
            value={stats.userCount}
            loading={loading}
          />
          <StatCard
            title="Instituições"
            value={stats.institutionCount}
            loading={loading}
          />
        </div>
      </main>
    </AppLayout>
  );
};
