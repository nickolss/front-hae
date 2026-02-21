import React, { useEffect, useState } from "react";
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
} from "@/constants/options";
import { api } from "@/services";

interface Institution {
  id: string;
  name: string;
}

export interface AdvancedHaeFilters {
  institutionId: string;
  course: string;
  haeType: string;
  status: string;
  viewed: string;
}

interface AdvancedFilterBarProps {
  filters: AdvancedHaeFilters;
  onFilterChange: (filters: AdvancedHaeFilters) => void;
  onResetFilters: () => void;
}

export const AdvancedFilterBar: React.FC<AdvancedFilterBarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
}) => {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        const response = await api.get<Institution[]>("/institution/getAll");
        setInstitutions(response.data);
      } catch (error) {
        console.error("Erro ao buscar instituições:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInstitutions();
  }, []);

  const handleChange = (field: keyof AdvancedHaeFilters, value: string) => {
    onFilterChange({ ...filters, [field]: value });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6 mt-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-center mt-2">
        <FormControl size="small" fullWidth className="lg:col-span-2">
          <InputLabel>Instituição</InputLabel>
          <Select
            value={filters.institutionId}
            label="Instituição"
            onChange={(e) => handleChange("institutionId", e.target.value)}
            disabled={isLoading}
          >
            <MenuItem value="">
              <em>Todas as Instituições</em>
            </MenuItem>
            {institutions.map((inst) => (
              <MenuItem key={inst.id} value={inst.id}>
                {inst.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

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
            {COURSE_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
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
            {HAE_TYPE_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
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
            {STATUS_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          onClick={onResetFilters}
          sx={{
            bgcolor: "#c10007",
            color: "white",
            "&:hover": { bgcolor: "#a30006" },
          }}
          className="w-full"
        >
          Limpar
        </Button>
      </div>
    </div>
  );
};
