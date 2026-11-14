const dateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeZone: "UTC" });
const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });

/** Data ISO (yyyy-mm-dd) → dd/mm/aaaa, sem deslocamento de fuso. */
export const formatDate = (iso?: string | null) =>
  iso ? dateFormatter.format(new Date(`${iso.slice(0, 10)}T00:00:00Z`)) : "—";

export const formatDateTime = (iso?: string | null) => (iso ? dateTimeFormatter.format(new Date(iso)) : "—");

export const formatTime = (time: string) => time.slice(0, 5);

/** Semestre atual no formato aceito pela API (ex.: 2026-2). */
export function currentSemester(today = new Date()): string {
  return `${today.getFullYear()}-${today.getMonth() < 6 ? 1 : 2}`;
}

export function semesterOptions(today = new Date(), count = 6): { value: string; label: string }[] {
  const result: { value: string; label: string }[] = [];
  let year = today.getFullYear();
  let half = today.getMonth() < 6 ? 1 : 2;
  for (let i = 0; i < count; i++) {
    result.push({ value: `${year}-${half}`, label: `${half}º semestre de ${year}` });
    if (half === 1) {
      half = 2;
      year -= 1;
    } else {
      half = 1;
    }
  }
  return result;
}

/** "1 HAE aprovada" / "3 HAEs aprovadas". */
export const plural = (count: number, singular: string, pluralForm: string) =>
  `${count} ${count === 1 ? singular : pluralForm}`;

export const formatFileSize = (bytes: number) =>
  bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
