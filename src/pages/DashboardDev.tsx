import { useEffect, useState } from "react";
import { Paper, Typography } from "@mui/material";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { dashboardService, DashboardStats } from "@/services/dashboardService";
import { AppLayout } from "@/layouts";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title
);

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
    haesByStatus: {},
    usersByRole: {},
    haesByMonth: [],
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

        {!loading && !error && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-8">
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" className="mb-4">
                HAEs por Status
              </Typography>
              <div className="h-72">
                <Bar
                  data={{
                    labels: Object.keys(stats.haesByStatus),
                    datasets: [
                      {
                        label: "Quantidade",
                        data: Object.values(stats.haesByStatus),
                        backgroundColor: ["#f59e0b", "#10b981", "#ef4444", "#3b82f6", "#8b5cf6"],
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                  }}
                />
              </div>
            </Paper>

            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" className="mb-4">
                Usuários por Perfil
              </Typography>
              <div className="h-72">
                <Doughnut
                  data={{
                    labels: Object.keys(stats.usersByRole),
                    datasets: [
                      {
                        data: Object.values(stats.usersByRole),
                        backgroundColor: ["#2563eb", "#f97316", "#14b8a6", "#ef4444", "#8b5cf6"],
                        borderColor: "#ffffff",
                        borderWidth: 2,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "bottom",
                      },
                    },
                  }}
                />
              </div>
            </Paper>

            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" className="mb-4">
                HAEs Criadas (6 meses)
              </Typography>
              <div className="h-72">
                <Line
                  data={{
                    labels: stats.haesByMonth.map((item) => item.label),
                    datasets: [
                      {
                        label: "HAEs",
                        data: stats.haesByMonth.map((item) => item.value),
                        borderColor: "#c10007",
                        backgroundColor: "rgba(193, 0, 7, 0.2)",
                        tension: 0.35,
                        fill: true,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                  }}
                />
              </div>
            </Paper>
          </div>
        )}
      </main>
    </AppLayout>
  );
};
