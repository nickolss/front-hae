import { Card, CardContent, Chip, Divider, Stack, Typography } from "@mui/material";
import { formatDateTime } from "@/shared/lib/format";
import type { Closure } from "../types";

const FIELDS: [keyof Closure, string][] = [
  ["role", "Papel no TCC"],
  ["studentCount", "Quantidade de alunos"],
  ["studentNames", "Alunos"],
  ["studentInfo", "Estagiários"],
  ["supportType", "Tipo de apoio"],
  ["description", "Atividades"],
  ["projectInfo", "Projetos"],
  ["approvedStudents", "Alunos aprovados"],
  ["certificateStudents", "Alunos com certificado"],
];

export function ClosureHistory({ closures }: { closures: Closure[] }) {
  if (closures.length === 0) return null;
  return (
    <Card>
      <CardContent>
        <Typography variant="h2" sx={{ mb: 2 }}>
          Fechamento
        </Typography>
        <Stack spacing={2} divider={<Divider />}>
          {[...closures].reverse().map((c, i) => (
            <Stack key={c.id} spacing={1}>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap" }}>
                <Typography sx={{ fontWeight: 600 }}>
                  {i === 0 ? "Relatório mais recente" : "Envio anterior"} · {formatDateTime(c.submittedAt)}
                </Typography>
                <Chip
                  size="small"
                  variant="outlined"
                  color={c.decision === "APPROVE" ? "success" : c.decision === "REJECT" ? "error" : "warning"}
                  label={
                    c.decision === "APPROVE"
                      ? "Aprovado"
                      : c.decision === "REJECT"
                        ? "Recusado"
                        : "Em análise"
                  }
                />
              </Stack>
              {FIELDS.filter(([k]) => c[k] !== undefined && c[k] !== null && c[k] !== "").map(
                ([k, label]) => (
                  <Typography key={k} sx={{ whiteSpace: "pre-wrap" }}>
                    <strong>{label}:</strong> {String(c[k])}
                  </Typography>
                ),
              )}
              {c.decision && (
                <Typography color="text.secondary" variant="body2">
                  Avaliado por {c.reviewer?.name ?? "—"} em {formatDateTime(c.decidedAt)}
                  {c.reviewComment && ` — “${c.reviewComment}”`}
                </Typography>
              )}
            </Stack>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
