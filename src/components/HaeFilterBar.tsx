import React from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from "@mui/material";
import {
  COURSE_OPTIONS,
  HAE_TYPE_OPTIONS,
  STATUS_OPTIONS,
  VIEWED_OPTIONS,
} from "@/constants/options";

export interface HaeFilters {
  course: string;
  haeType: string;
  status: string;
  viewed: string;
}

interface HaeFilterBarProps {
  filters: HaeFilters;
  onFilterChange: (filters: HaeFilters) => void;
  onResetFilters: () => void;
}

export const HaeFilterBar: React.FC<HaeFilterBarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
}) => {
  const handleChange = (field: keyof HaeFilters, value: string) => {
    onFilterChange({ ...filters, [field]: value });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row items-center gap-4">
      <FormControl size="small" fullWidth>
        <InputLabel>Curso</InputLabel>
        <Select
          value={filters.course}
          label="Curso"
          onChange={(e) => handleChange("course", e.target.value)}
        >
          <MenuItem value="">
            <em>Todos</em>
          </MenuItem>
          {COURSE_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" fullWidth>
        <InputLabel>Tipo</InputLabel>
        <Select
          value={filters.haeType}
          label="Tipo"
          onChange={(e) => handleChange("haeType", e.target.value)}
        >
          <MenuItem value="">
            <em>Todos</em>
          </MenuItem>
          {HAE_TYPE_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" fullWidth>
        <InputLabel>Status</InputLabel>
        <Select
          value={filters.status}
          label="Status"
          onChange={(e) => handleChange("status", e.target.value)}
        >
          <MenuItem value="">
            <em>Todos</em>
          </MenuItem>
          {STATUS_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl size="small" fullWidth>
        <InputLabel>Visualização</InputLabel>
        <Select
          value={filters.viewed}
          label="Visualização"
          onChange={(e) => handleChange("viewed", e.target.value)}
        >
          <MenuItem value="">
            <em>Todos</em>
          </MenuItem>
          {VIEWED_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button
        onClick={onResetFilters}
        sx={{
          flexShrink: 0,
          bgcolor: "#c10007",
          color: "white",
          "&:hover": { bgcolor: "#a30006" },
        }}
      >
        Limpar
      </Button>
    </div>
  );
};
