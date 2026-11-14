import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutline from "@mui/icons-material/DeleteOutlineOutlined";
import { DAY_LABELS, DIMENSION_LABELS, MODALITY_LABELS, TYPE_LABELS, options } from "@/shared/domain/labels";
import { institutionApi, institutionKeys } from "@/features/institutions/api";
import { haeSchema, scheduledHours, type HaeFormValues } from "../schema";

interface Props {
  institutionId: string;
  defaultValues: Partial<HaeFormValues>;
  submitLabel: string;
  submitting: boolean;
  serverError?: string;
  ownerField?: React.ReactNode;
  onSubmit: (values: HaeFormValues) => void;
  onCancel: () => void;
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Card component="section" aria-label={title}>
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Typography variant="h2" sx={{ mb: description ? 0.5 : 2 }}>
          {title}
        </Typography>
        {description && (
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            {description}
          </Typography>
        )}
        {children}
      </CardContent>
    </Card>
  );
}

export function HaeForm({
  institutionId,
  defaultValues,
  submitLabel,
  submitting,
  serverError,
  ownerField,
  onSubmit,
  onCancel,
}: Props) {
  const { control, register, handleSubmit, formState, setValue } = useForm<HaeFormValues>({
    resolver: zodResolver(haeSchema),
    defaultValues,
  });
  const { fields, append, remove } = useFieldArray({ control, name: "schedule" });
  const [type, schedule, weeklyHours] = useWatch({ control, name: ["type", "schedule", "weeklyHours"] });
  const courses = useQuery({
    queryKey: institutionKeys.courses(institutionId),
    queryFn: () => institutionApi.courses(institutionId),
  });
  const errors = formState.errors;
  const planned = scheduledHours(schedule ?? []);
  const usedDays = new Set((schedule ?? []).map((s) => s.day));

  return (
    <Stack component="form" noValidate spacing={3} onSubmit={handleSubmit(onSubmit)}>
      {serverError && (
        <Alert severity="error" role="alert">
          {serverError}
        </Alert>
      )}
      {Object.keys(errors).length > 0 && formState.isSubmitted && (
        <Alert severity="warning" role="alert">
          Revise os campos destacados antes de enviar.
        </Alert>
      )}

      <Section title="1. Projeto" description="O que será desenvolvido nesta HAE.">
        <Grid container spacing={2}>
          {ownerField && <Grid size={12}>{ownerField}</Grid>}
          <Grid size={12}>
            <TextField
              label="Título do projeto"
              required
              {...register("title")}
              error={!!errors.title}
              helperText={errors.title?.message}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <TextField
                  select
                  label="Tipo"
                  required
                  {...field}
                  value={field.value ?? ""}
                  error={!!errors.type}
                  helperText={errors.type?.message}
                >
                  {options(TYPE_LABELS).map((o) => (
                    <MenuItem key={o.value} value={o.value}>
                      {o.label}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="courseId"
              control={control}
              render={({ field }) => (
                <TextField
                  select
                  label="Curso"
                  required
                  {...field}
                  error={!!errors.courseId}
                  helperText={
                    errors.courseId?.message ??
                    (courses.data?.length === 0 ? "A unidade não tem cursos cadastrados." : undefined)
                  }
                >
                  {(courses.data ?? []).map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="dimension"
              control={control}
              render={({ field }) => (
                <TextField
                  select
                  label="Dimensão"
                  required
                  {...field}
                  error={!!errors.dimension}
                  helperText={errors.dimension?.message}
                >
                  {options(DIMENSION_LABELS).map((o) => (
                    <MenuItem key={o.value} value={o.value}>
                      {o.label}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="modality"
              control={control}
              render={({ field }) => (
                <TextField
                  select
                  label="Modalidade"
                  required
                  {...field}
                  value={field.value ?? ""}
                  error={!!errors.modality}
                  helperText={errors.modality?.message}
                >
                  {options(MODALITY_LABELS).map((o) => (
                    <MenuItem key={o.value} value={o.value}>
                      {o.label}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>
          <Grid size={12}>
            <TextField
              label="Descrição do projeto"
              required
              multiline
              minRows={4}
              {...register("description")}
              error={!!errors.description}
              helperText={
                errors.description?.message ?? "Objetivos, atividades previstas e resultados esperados."
              }
            />
          </Grid>
          <Grid size={12}>
            <TextField
              label="Observações (opcional)"
              multiline
              minRows={2}
              {...register("observations")}
              error={!!errors.observations}
              helperText={errors.observations?.message}
            />
          </Grid>
        </Grid>
      </Section>

      <Section
        title="2. Período e carga horária"
        description="A HAE deve começar e terminar no mesmo semestre."
      >
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              label="Início"
              type="date"
              required
              slotProps={{ inputLabel: { shrink: true } }}
              {...register("startDate")}
              error={!!errors.startDate}
              helperText={errors.startDate?.message}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              label="Término"
              type="date"
              required
              slotProps={{ inputLabel: { shrink: true } }}
              {...register("endDate")}
              error={!!errors.endDate}
              helperText={errors.endDate?.message}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              label="Horas por semana"
              type="number"
              required
              slotProps={{ htmlInput: { min: 1, max: 40, step: 1, inputMode: "numeric" } }}
              {...register("weeklyHours", { valueAsNumber: true })}
              error={!!errors.weeklyHours}
              helperText={errors.weeklyHours?.message ?? "Entre 1 e 40."}
            />
          </Grid>
        </Grid>

        <Typography variant="h3" component="h3" sx={{ mt: 3, mb: 1 }}>
          Cronograma semanal
        </Typography>
        <Stack spacing={1.5}>
          {fields.map((f, index) => (
            <Stack
              key={f.id}
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              sx={{ alignItems: { sm: "flex-start" } }}
            >
              <Controller
                name={`schedule.${index}.day`}
                control={control}
                render={({ field }) => (
                  <TextField
                    select
                    label="Dia"
                    {...field}
                    sx={{ minWidth: 180 }}
                    error={!!errors.schedule?.[index]?.day}
                    helperText={errors.schedule?.[index]?.day?.message}
                  >
                    {options(DAY_LABELS).map((o) => (
                      <MenuItem
                        key={o.value}
                        value={o.value}
                        disabled={o.value !== field.value && usedDays.has(o.value)}
                      >
                        {o.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
              <TextField
                label="Das"
                type="time"
                slotProps={{ inputLabel: { shrink: true } }}
                {...register(`schedule.${index}.start`)}
                error={!!errors.schedule?.[index]?.start}
                helperText={errors.schedule?.[index]?.start?.message}
              />
              <TextField
                label="Até"
                type="time"
                slotProps={{ inputLabel: { shrink: true } }}
                {...register(`schedule.${index}.end`)}
                error={!!errors.schedule?.[index]?.end}
                helperText={errors.schedule?.[index]?.end?.message}
              />
              <IconButton
                onClick={() => remove(index)}
                disabled={fields.length === 1}
                aria-label={`Remover horário ${index + 1}`}
                sx={{ alignSelf: "center" }}
              >
                <DeleteOutline />
              </IconButton>
            </Stack>
          ))}
          {errors.schedule?.root?.message && <Alert severity="error">{errors.schedule.root.message}</Alert>}
          {errors.schedule?.message && <Alert severity="error">{errors.schedule.message}</Alert>}
          <Box>
            <Button
              startIcon={<AddIcon />}
              onClick={() =>
                append({
                  day:
                    (["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"] as const).find(
                      (d) => !usedDays.has(d),
                    ) ?? "SUNDAY",
                  start: "08:00",
                  end: "10:00",
                })
              }
              disabled={fields.length >= 7}
            >
              Adicionar dia
            </Button>
          </Box>
          <Typography
            role="status"
            color={weeklyHours && planned !== weeklyHours ? "warning.dark" : "text.secondary"}
          >
            Total no cronograma: <strong>{planned} h/semana</strong>
            {weeklyHours > 0 && planned !== weeklyHours && ` — diferente das ${weeklyHours} h declaradas.`}
          </Typography>
          {planned >= 1 && planned <= 40 && Number.isInteger(planned) && planned !== weeklyHours && (
            <Box>
              <Button size="small" onClick={() => setValue("weeklyHours", planned, { shouldValidate: true })}>
                Usar {planned} h como carga semanal
              </Button>
            </Box>
          )}
        </Stack>
      </Section>

      {type && type !== "APOIO_DIRECAO" && (
        <Section
          title="3. Alunos"
          description="RA dos alunos atendidos (um por linha ou separados por vírgula)."
        >
          <TextField
            label="RAs dos alunos"
            multiline
            minRows={3}
            {...register("studentRas")}
            error={!!errors.studentRas}
            helperText={errors.studentRas?.message}
          />
        </Section>
      )}

      <Stack direction="row" spacing={1.5} sx={{ justifyContent: "flex-end" }}>
        <Button onClick={onCancel} disabled={submitting}>
          Cancelar
        </Button>
        <Button type="submit" variant="contained" size="large" loading={submitting}>
          {submitLabel}
        </Button>
      </Stack>
    </Stack>
  );
}
