import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import { Box, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const PALETTE = ["#b5000a", "#43555f", "#2e7d32", "#ed6c02", "#0277bd", "#6a1b9a", "#8d6e63"];

interface Datum {
  label: string;
  value: number;
}

/** Gráfico com tabela equivalente oculta visualmente, para leitores de tela. */
function AccessibleData({ caption, data }: { caption: string; data: Datum[] }) {
  return (
    <Table className="sr-only">
      <caption>{caption}</caption>
      <TableHead>
        <TableRow>
          <TableCell>Categoria</TableCell>
          <TableCell>Quantidade</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map((d) => (
          <TableRow key={d.label}>
            <TableCell>{d.label}</TableCell>
            <TableCell>{d.value}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function DoughnutChart({ caption, data }: { caption: string; data: Datum[] }) {
  return (
    <Box sx={{ position: "relative", height: 260 }}>
      <Doughnut
        aria-hidden
        data={{
          labels: data.map((d) => d.label),
          datasets: [{ data: data.map((d) => d.value), backgroundColor: PALETTE }],
        }}
        options={{ maintainAspectRatio: false, plugins: { legend: { position: "bottom" } } }}
      />
      <AccessibleData caption={caption} data={data} />
    </Box>
  );
}

export function BarChart({ caption, data }: { caption: string; data: Datum[] }) {
  return (
    <Box sx={{ position: "relative", height: Math.max(200, data.length * 36) }}>
      <Bar
        aria-hidden
        data={{
          labels: data.map((d) => d.label),
          datasets: [{ label: "HAEs", data: data.map((d) => d.value), backgroundColor: "#43555f" }],
        }}
        options={{
          indexAxis: "y",
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { x: { ticks: { precision: 0 } } },
        }}
      />
      <AccessibleData caption={caption} data={data} />
    </Box>
  );
}
