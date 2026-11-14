import { Link as RouterLink } from "react-router";
import {
  Box,
  Chip,
  Link,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { StatusChip } from "@/shared/components/StatusChip";
import { TYPE_LABELS } from "@/shared/domain/labels";
import { formatDate } from "@/shared/lib/format";
import type { Page } from "@/shared/api/types";
import type { HaeSummary } from "../types";

interface Props {
  page: Page<HaeSummary>;
  showOwner?: boolean;
  hidePagination?: boolean;
  onPageChange: (page: number) => void;
  onSizeChange: (size: number) => void;
}

/** Tabela no desktop, cartões no celular. */
export function HaeTable({ page, showOwner, hidePagination, onPageChange, onSizeChange }: Props) {
  const theme = useTheme();
  const compact = useMediaQuery(theme.breakpoints.down("md"));

  const pagination = hidePagination ? null : (
    <TablePagination
      component="div"
      count={page.totalElements}
      page={page.page}
      rowsPerPage={page.size}
      rowsPerPageOptions={[10, 20, 50]}
      onPageChange={(_, p) => onPageChange(p)}
      onRowsPerPageChange={(e) => onSizeChange(Number(e.target.value))}
    />
  );

  if (compact) {
    return (
      <Box>
        <Stack spacing={1.5} component="ul" sx={{ listStyle: "none", p: 0, m: 0 }}>
          {page.content.map((h) => (
            <Paper component="li" key={h.id} variant="outlined" sx={{ p: 2 }}>
              <Link component={RouterLink} to={`/haes/${h.id}`} sx={{ fontWeight: 600 }}>
                {h.title}
              </Link>
              <Typography variant="body2" color="text.secondary" sx={{ my: 0.5 }}>
                {showOwner && `${h.employeeName} · `}
                {h.courseName} · {h.weeklyHours} h/sem
              </Typography>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap" }}>
                <StatusChip status={h.status} />
                {!h.viewed && showOwner && <Chip size="small" color="primary" label="Nova" />}
              </Stack>
            </Paper>
          ))}
        </Stack>
        {pagination}
      </Box>
    );
  }

  return (
    <Paper variant="outlined">
      <TableContainer>
        <Table size="small" aria-label="Lista de HAEs">
          <TableHead>
            <TableRow>
              <TableCell>Projeto</TableCell>
              {showOwner && <TableCell>Professor(a)</TableCell>}
              <TableCell>Curso</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell align="right">h/sem</TableCell>
              <TableCell>Período</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {page.content.map((h) => (
              <TableRow key={h.id} hover>
                <TableCell>
                  <Link
                    component={RouterLink}
                    to={`/haes/${h.id}`}
                    sx={{ fontWeight: h.viewed || !showOwner ? 500 : 700 }}
                  >
                    {h.title}
                  </Link>
                  {!h.viewed && showOwner && (
                    <Chip size="small" color="primary" label="Nova" sx={{ ml: 1 }} />
                  )}
                </TableCell>
                {showOwner && <TableCell>{h.employeeName}</TableCell>}
                <TableCell>{h.courseName}</TableCell>
                <TableCell>{TYPE_LABELS[h.type].replace(" (TCC)", "")}</TableCell>
                <TableCell align="right">{h.weeklyHours}</TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>
                  {formatDate(h.startDate)} – {formatDate(h.endDate)}
                </TableCell>
                <TableCell>
                  <StatusChip status={h.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {pagination}
    </Paper>
  );
}
