import React, { useState, useEffect } from "react";
import {
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  Select,
  Typography,
  Box,
  Divider,
  Alert,
} from "@mui/material";
import { StepTwoProps, WeeklySchedule } from "./types/haeFormTypes";

type DailySchedules = {
  [day: string]: {
    startTime: string;
    endTime: string;
  };
};

const DAYS_OF_WEEK = [
  "Segunda Feira",
  "Terça Feira",
  "Quarta Feira",
  "Quinta Feira",
  "Sexta Feira",
  "Sábado",
];

const parseTime = (timeStr: string): number => {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
};

const getToday = (): Date => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

const getTomorrow = (): Date => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow;
};

const toYYYYMMDD = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

const StepTwo: React.FC<StepTwoProps> = ({
  onNext,
  onBack,
  formData,
  setFormData,
  errors,
  isEditMode,
}) => {
  const [dailySchedules, setDailySchedules] = useState<DailySchedules>({});
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const initialSchedules: DailySchedules = {};
    if (
      formData.weeklySchedule &&
      Object.keys(formData.weeklySchedule).length > 0
    ) {
      Object.entries(formData.weeklySchedule).forEach(([day, schedule]) => {
        if (schedule.timeRange) {
          const [startTime, endTime] = schedule.timeRange.split(" - ");
          if (startTime && endTime) {
            initialSchedules[day] = { startTime, endTime };
          }
        }
      });
      setDailySchedules(initialSchedules);
    }
  }, []);

  useEffect(() => {
    const newSchedules: DailySchedules = {};
    formData.dayOfWeek.forEach((day) => {
      newSchedules[day] = dailySchedules[day] || { startTime: "", endTime: "" };
    });
    setDailySchedules(newSchedules);
  }, [formData.dayOfWeek]);

  useEffect(() => {
    const updatedWeeklySchedule: WeeklySchedule = {};
    let totalHours = 0;
    let firstValidTimeRange: string | null = null;

    Object.entries(dailySchedules).forEach(([day, times]) => {
      if (times.startTime && times.endTime) {
        const timeRangeStr = `${times.startTime} - ${times.endTime}`;
        updatedWeeklySchedule[day] = { timeRange: timeRangeStr };

        if (!firstValidTimeRange) {
          firstValidTimeRange = timeRangeStr;
        }

        const start = parseTime(times.startTime);
        const end = parseTime(times.endTime);
        if (end > start) {
          totalHours += (end - start) / 60;
        }
      }
    });

    setFormData("weeklySchedule", updatedWeeklySchedule);
    setFormData("weeklyHours", Math.round(totalHours * 100) / 100);
    setFormData("timeRange", firstValidTimeRange || "");
  }, [dailySchedules, setFormData]);

  const handleTimeChange = (
    day: string,
    type: "startTime" | "endTime",
    value: string
  ) => {
    setDailySchedules((prev) => ({
      ...prev,
      [day]: { ...prev[day], [type]: value },
    }));
    setLocalErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[day];
      return newErrors;
    });
  };

  const handleStartDateChange = (value: string) => {
    setFormData("startDate", value);
    if (localErrors.startDate) {
      setLocalErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.startDate;
        return newErrors;
      });
    }
  };

  const handleEndDateChange = (value: string) => {
    setFormData("endDate", value);
    if (localErrors.endDate) {
      setLocalErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.endDate;
        return newErrors;
      });
    }
  };

  const validateAndProceed = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (formData.dayOfWeek.length === 0) {
      newErrors.dayOfWeek = "Selecione pelo menos um dia da semana";
      isValid = false;
    }
    formData.dayOfWeek.forEach((day) => {
      const schedule = dailySchedules[day];
      if (!schedule || !schedule.startTime || !schedule.endTime) {
        newErrors[day] = "Hora de início e fim são obrigatórias.";
        isValid = false;
        return;
      }
      const start = parseTime(schedule.startTime);
      const end = parseTime(schedule.endTime);
      if (start >= end) {
        newErrors[day] = "A hora de fim deve ser após a de início.";
        isValid = false;
        return;
      }
      const durationHours = (end - start) / 60;
      if (durationHours < 1 || durationHours > 8) {
        newErrors[day] = "A duração deve ser entre 1 e 8 horas.";
        isValid = false;
      }
    });

    if (!formData.startDate) {
      newErrors.startDate = "Data de início é obrigatória.";
      isValid = false;
    }
    if (!formData.endDate) {
      newErrors.endDate = "Data final é obrigatória.";
      isValid = false;
    }

    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate + "T00:00:00");
      const endDate = new Date(formData.endDate + "T00:00:00");

      if (endDate <= startDate) {
        newErrors.endDate = "A data final deve ser posterior à data de início.";
        isValid = false;
      }

      if (!isEditMode) {
        const today = getToday();
        const tomorrow = getTomorrow();

        if (startDate < today) {
          newErrors.startDate = "A data de início deve ser hoje ou no futuro.";
          isValid = false;
        }
        if (endDate < tomorrow) {
          newErrors.endDate = "A data final não pode ser hoje nem no passado.";
          isValid = false;
        }
      }
    }

    setLocalErrors(newErrors);

    if (isValid) {
      onNext();
    }
  };

  return (
    <div className="flex flex-col gap-10 h-full">
      <div>
        <h2 className="font-semibold subtitle">Cronograma Semanal</h2>
        <p className="text-gray-600">
          Defina todos os dias da semana e os horários para cada dia selecionando-os abaixo.
        </p>
      </div>

      {errors.weeklySchedule && typeof errors.weeklySchedule === "string" && (
        <Alert severity="error">{errors.weeklySchedule}</Alert>
      )}

      <FormControl fullWidth error={!!localErrors.dayOfWeek}>
        <InputLabel id="dias-da-semana-label">Dias da Semana</InputLabel>
        <Select
          labelId="dias-da-semana-label"
          multiple
          value={formData.dayOfWeek || []}
          onChange={(e) => setFormData("dayOfWeek", e.target.value as string[])}
          label="Dias da Semana"
        >
          {DAYS_OF_WEEK.map((day) => (
            <MenuItem key={day} value={day}>
              {day}
            </MenuItem>
          ))}
        </Select>
        {!!localErrors.dayOfWeek && (
          <FormHelperText>{localErrors.dayOfWeek}</FormHelperText>
        )}
      </FormControl>

      {formData.dayOfWeek.length > 0 && (
        <Box className="flex flex-col gap-6 p-4 border rounded-md">
          <Typography variant="h6" className="font-semibold">
            Definir Horários
          </Typography>
          <Divider />
          {formData.dayOfWeek.map((day, index) => (
            <div key={day}>
              {index > 0 && <Divider className="my-4" />}
              <Typography variant="subtitle1" className="font-medium mb-3 ">
                {day}
              </Typography>
              <div className="flex gap-4 mt-2">
                <TextField
                  fullWidth
                  type="time"
                  label="Hora de Início"
                  InputLabelProps={{ shrink: true }}
                  value={dailySchedules[day]?.startTime || ""}
                  onChange={(e) =>
                    handleTimeChange(day, "startTime", e.target.value)
                  }
                />
                <TextField
                  fullWidth
                  type="time"
                  label="Hora de Fim"
                  InputLabelProps={{ shrink: true }}
                  value={dailySchedules[day]?.endTime || ""}
                  onChange={(e) =>
                    handleTimeChange(day, "endTime", e.target.value)
                  }
                />
              </div>
              {!!localErrors[day] && (
                <FormHelperText error>{localErrors[day]}</FormHelperText>
              )}
            </div>
          ))}
        </Box>
      )}

      <div className="flex gap-4">
        <TextField
          required
          fullWidth
          type="date"
          label="Data de Início do Período"
          variant="outlined"
          InputLabelProps={{ shrink: true }}
          value={formData.startDate || ""}
          onChange={(e) => handleStartDateChange(e.target.value)}
          error={!!localErrors.startDate}
          helperText={localErrors.startDate || null}
          InputProps={{
            inputProps: { min: !isEditMode ? toYYYYMMDD(getToday()) : undefined },
          }}
        />
        <TextField
          required
          fullWidth
          type="date"
          label="Data Final do Período"
          variant="outlined"
          InputLabelProps={{ shrink: true }}
          value={formData.endDate || ""}
          onChange={(e) => handleEndDateChange(e.target.value)}
          error={!!localErrors.endDate}
          helperText={localErrors.endDate || null}
          InputProps={{
            inputProps: { min: !isEditMode ? toYYYYMMDD(getTomorrow()) : undefined },
          }}
        />
      </div>

      <div className="flex justify-between mt-10">
        <button
          type="button"
          onClick={onBack}
          className="btnFatec bg-gray-600  text-white uppercase hover:bg-gray-900"
        >
          Voltar
        </button>
        <button
          type="button"
          onClick={validateAndProceed}
          className="btnFatec uppercase text-white hover:bg-red-900"
        >
          CONTINUAR
        </button>
      </div>
    </div>
  );
};

export default StepTwo;
