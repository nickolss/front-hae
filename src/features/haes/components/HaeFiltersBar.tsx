import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button, Grid, InputAdornment, MenuItem, Paper, TextField } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { STATUS_LABELS, TYPE_LABELS, options } from "@/shared/domain/labels";
import { semesterOptions } from "@/shared/lib/format";
import { institutionApi, institutionKeys } from "@/features/institutions/api";
import type { HaeFilters } from "../types";

interface Props {
  filters: HaeFilters;
  onChange: (patch: Partial<HaeFilters>) => void;
  onClear: () => void;
  institutionId?: string;
  showInstitution?: boolean;
  showViewed?: boolean;
}

export function HaeFiltersBar({
  filters,
  onChange,
  onClear,
  institutionId,
  showInstitution,
  showViewed,
}: Props) {
  const [text, setText] = useState(filters.q ?? "");
  const courseScope = filters.institutionId ?? institutionId;
  const institutions = useQuery({
    queryKey: institutionKeys.all,
    queryFn: institutionApi.list,
    enabled: !!showInstitution,
  });
  const courses = useQuery({
    queryKey: institutionKeys.courses(courseScope ?? ""),
    queryFn: () => institutionApi.courses(courseScope!),
    enabled: !!courseScope,
  });

  // busca com atraso para não disparar uma requisição por tecla
  useEffect(() => {
    const t = setTimeout(() => text !== (filters.q ?? "") && onChange({ q: text || undefined }), 400);
    return () => clearTimeout(t);
  }, [text, filters.q, onChange]);

  const select = (
    label: string,
    value: string | undefined,
    items: { value: string; label: string }[],
    onSelect: (v: string | undefined) => void,
  ) => (
    <TextField
      select
      size="small"
      label={label}
      value={value ?? ""}
      onChange={(e) => onSelect(e.target.value || undefined)}
    >
      <MenuItem value="">Todos</MenuItem>
      {items.map((o) => (
        <MenuItem key={o.value} value={o.value}>
          {o.label}
        </MenuItem>
      ))}
    </TextField>
  );

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 2 }} component="search" aria-label="Filtros">
      <Grid container spacing={1.5} sx={{ alignItems: "center" }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            size="small"
            label="Buscar por título ou professor"
            value={text}
            onChange={(e) => setText(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 2 }}>
          {select("Status", filters.status, options(STATUS_LABELS), (v) =>
            onChange({ status: v as HaeFilters["status"] }),
          )}
        </Grid>
        <Grid size={{ xs: 6, md: 2 }}>
          {select("Tipo", filters.type, options(TYPE_LABELS), (v) =>
            onChange({ type: v as HaeFilters["type"] }),
          )}
        </Grid>
        <Grid size={{ xs: 6, md: 2 }}>
          {select("Semestre", filters.semester, semesterOptions(), (v) => onChange({ semester: v }))}
        </Grid>
        {showInstitution && (
          <Grid size={{ xs: 6, md: 2 }}>
            {select(
              "Unidade",
              filters.institutionId,
              (institutions.data ?? []).map((i) => ({ value: i.id, label: i.name })),
              (v) => onChange({ institutionId: v, courseId: undefined }),
            )}
          </Grid>
        )}
        {courseScope && (
          <Grid size={{ xs: 6, md: 2 }}>
            {select(
              "Curso",
              filters.courseId,
              (courses.data ?? []).map((c) => ({ value: c.id, label: c.name })),
              (v) => onChange({ courseId: v }),
            )}
          </Grid>
        )}
        {showViewed && (
          <Grid size={{ xs: 6, md: 2 }}>
            {select(
              "Visualização",
              filters.viewed === undefined ? undefined : String(filters.viewed),
              [
                { value: "false", label: "Não vistas" },
                { value: "true", label: "Vistas" },
              ],
              (v) => onChange({ viewed: v === undefined ? undefined : v === "true" }),
            )}
          </Grid>
        )}
        <Grid size={{ xs: 12, md: "auto" }}>
          <Button
            onClick={() => {
              setText("");
              onClear();
            }}
          >
            Limpar filtros
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
}
