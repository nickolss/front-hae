import { z } from "zod";
import type { DayOfWeek, Dimension, HaeType, Modality } from "@/shared/domain/labels";
import type { Hae, HaeInput } from "./types";

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"] as const;
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

const semesterOf = (iso: string) => {
  const [y, m] = iso.split("-").map(Number);
  return `${y}-${m <= 6 ? 1 : 2}`;
};

export const minutesBetween = (start: string, end: string) => {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return eh * 60 + em - (sh * 60 + sm);
};

export const haeSchema = z
  .object({
    courseId: z.string().min(1, "Selecione o curso."),
    title: z
      .string()
      .trim()
      .min(3, "Informe um título (mín. 3 caracteres).")
      .max(200, "Máximo de 200 caracteres."),
    description: z
      .string()
      .trim()
      .min(10, "Descreva o projeto (mín. 10 caracteres).")
      .max(5000, "Máximo de 5000 caracteres."),
    observations: z.string().max(2000, "Máximo de 2000 caracteres.").optional(),
    type: z.enum(["APOIO_DIRECAO", "ESTAGIO", "TCC"], { error: "Selecione o tipo." }),
    modality: z.enum(["PRESENCIAL", "HIBRIDO", "ONLINE"], { error: "Selecione a modalidade." }),
    dimension: z.string().min(1, "Selecione a dimensão."),
    weeklyHours: z
      .number({ error: "Informe as horas semanais." })
      .int("Use horas inteiras.")
      .min(1, "Mínimo de 1 hora.")
      .max(40, "Máximo de 40 horas."),
    startDate: z.string().min(1, "Informe a data de início."),
    endDate: z.string().min(1, "Informe a data de término."),
    schedule: z
      .array(
        z
          .object({
            day: z.enum(DAYS, { error: "Selecione o dia." }),
            start: z.string().regex(TIME, "Horário inválido."),
            end: z.string().regex(TIME, "Horário inválido."),
          })
          .refine((s) => minutesBetween(s.start, s.end) > 0, {
            path: ["end"],
            message: "Deve ser após o início.",
          }),
      )
      .min(1, "Adicione ao menos um horário.")
      .refine(
        (list) => new Set(list.map((s) => s.day)).size === list.length,
        "Cada dia pode aparecer só uma vez.",
      ),
    studentRas: z.string().optional(),
  })
  .refine((d) => !d.startDate || !d.endDate || d.endDate > d.startDate, {
    path: ["endDate"],
    message: "A data de término deve ser posterior ao início.",
  })
  .refine((d) => !d.startDate || !d.endDate || semesterOf(d.startDate) === semesterOf(d.endDate), {
    path: ["endDate"],
    message: "A HAE deve começar e terminar no mesmo semestre.",
  })
  .refine(
    (d) => d.type === "APOIO_DIRECAO" || parseRas(d.studentRas).every((ra) => /^[0-9A-Za-z]{5,20}$/.test(ra)),
    {
      path: ["studentRas"],
      message: "RA inválido: use apenas letras e números (5 a 20).",
    },
  );

export type HaeFormValues = z.infer<typeof haeSchema>;

export function parseRas(text?: string): string[] {
  return (text ?? "")
    .split(/[\s,;]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Soma das horas do cronograma (ajuda a conferir com as horas semanais declaradas). */
export function scheduledHours(schedule: { start: string; end: string }[]): number {
  const minutes = schedule.reduce(
    (sum, s) =>
      sum + Math.max(0, TIME.test(s.start) && TIME.test(s.end) ? minutesBetween(s.start, s.end) : 0),
    0,
  );
  return Math.round((minutes / 60) * 10) / 10;
}

export function toInput(values: HaeFormValues, employeeId?: string): HaeInput {
  return {
    employeeId,
    courseId: values.courseId,
    title: values.title,
    description: values.description,
    observations: values.observations?.trim() || undefined,
    type: values.type as HaeType,
    modality: values.modality as Modality,
    dimension: values.dimension as Dimension,
    weeklyHours: values.weeklyHours,
    startDate: values.startDate,
    endDate: values.endDate,
    schedule: values.schedule.map((s) => ({ day: s.day as DayOfWeek, start: s.start, end: s.end })),
    studentRas: values.type === "APOIO_DIRECAO" ? [] : parseRas(values.studentRas),
  };
}

export function fromHae(hae: Hae): HaeFormValues {
  return {
    courseId: hae.course.id,
    title: hae.title,
    description: hae.description,
    observations: hae.observations ?? "",
    type: hae.type,
    modality: hae.modality,
    dimension: hae.dimension,
    weeklyHours: hae.weeklyHours,
    startDate: hae.startDate,
    endDate: hae.endDate,
    schedule: hae.schedule.map((s) => ({ day: s.day, start: s.start.slice(0, 5), end: s.end.slice(0, 5) })),
    studentRas: hae.studentRas.join("\n"),
  };
}

export const emptyHae: Partial<HaeFormValues> = {
  courseId: "",
  title: "",
  description: "",
  observations: "",
  dimension: "",
  startDate: "",
  endDate: "",
  schedule: [{ day: "MONDAY", start: "08:00", end: "10:00" }],
  studentRas: "",
};
