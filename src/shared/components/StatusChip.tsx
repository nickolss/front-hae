import { Chip, type ChipProps } from "@mui/material";
import CheckCircleOutline from "@mui/icons-material/CheckCircleOutlineOutlined";
import HighlightOff from "@mui/icons-material/HighlightOff";
import HourglassEmpty from "@mui/icons-material/HourglassEmpty";
import Autorenew from "@mui/icons-material/Autorenew";
import WorkspacePremium from "@mui/icons-material/WorkspacePremium";
import { STATUS_LABELS, type HaeStatus } from "@/shared/domain/labels";

const STYLE: Record<HaeStatus, { color: ChipProps["color"]; icon: ChipProps["icon"] }> = {
  PENDENTE: { color: "default", icon: <HourglassEmpty /> },
  APROVADO: { color: "success", icon: <CheckCircleOutline /> },
  REPROVADO: { color: "error", icon: <HighlightOff /> },
  FECHAMENTO_SOLICITADO: { color: "warning", icon: <Autorenew /> },
  COMPLETO: { color: "info", icon: <WorkspacePremium /> },
};

/** Status com cor + ícone + texto (não depende só de cor — WCAG 1.4.1). */
export function StatusChip({ status, size = "small" }: { status: HaeStatus; size?: ChipProps["size"] }) {
  const style = STYLE[status];
  return (
    <Chip
      label={STATUS_LABELS[status]}
      color={style.color}
      icon={style.icon}
      size={size}
      variant="outlined"
    />
  );
}
