import { Alert } from "@mui/material";
import ScienceOutlined from "@mui/icons-material/ScienceOutlined";
import { useSystemInfo } from "@/shared/api/systemInfo";

/** Aviso permanente em ambientes de demonstração, para não confundir dados fictícios com reais. */
export function DemoBanner() {
  const { demo } = useSystemInfo();
  if (!demo) return null;
  return (
    <Alert severity="info" icon={<ScienceOutlined />} sx={{ mb: 3 }}>
      <strong>Ambiente de demonstração.</strong> Todas as unidades, pessoas e HAEs exibidas são fictícias.
    </Alert>
  );
}
