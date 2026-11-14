import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link as RouterLink, useNavigate, useParams } from "react-router";
import {
  Alert,
  AlertTitle,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import EditOutlined from "@mui/icons-material/EditOutlined";
import DeleteOutline from "@mui/icons-material/DeleteOutlineOutlined";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import AssignmentTurnedInOutlined from "@mui/icons-material/AssignmentTurnedInOutlined";
import { PageHeader } from "@/shared/components/PageHeader";
import { StatusChip } from "@/shared/components/StatusChip";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { ErrorState, LoadingState } from "@/shared/components/States";
import { errorMessage } from "@/shared/api/problem";
import { useNotify } from "@/shared/hooks/notifyContext";
import {
  DAY_LABELS,
  DIMENSION_LABELS,
  MODALITY_LABELS,
  STATUS_HINTS,
  TYPE_LABELS,
} from "@/shared/domain/labels";
import { formatDate, formatDateTime, formatTime } from "@/shared/lib/format";
import { ReviewDialog } from "../components/ReviewDialog";
import { ClosureDialog } from "../components/ClosureDialog";
import { AttachmentsCard } from "../components/AttachmentsCard";
import { ClosureHistory } from "../components/ClosureHistory";
import { useUser } from "@/features/auth/session";
import { haeApi, haeKeys } from "../api";
import type { Attachment, Hae } from "../types";

const STEPS = ["Envio", "Avaliação", "Fechamento", "Conclusão"];

/** Orientação para quem avalia (o dono da HAE vê STATUS_HINTS) — Nielsen #2. */
const REVIEWER_HINTS: Record<Hae["status"], string> = {
  PENDENTE: "Aguardando a avaliação da coordenação.",
  APROVADO: "Em execução. O professor enviará o relatório de fechamento ao final.",
  REPROVADO: "Devolvida ao professor para ajustes.",
  FECHAMENTO_SOLICITADO: "Relatório de fechamento aguardando avaliação.",
  COMPLETO: "HAE encerrada.",
};

function activeStep(hae: Hae) {
  switch (hae.status) {
    case "PENDENTE":
      return 1;
    case "REPROVADO":
      return 1;
    case "APROVADO":
      return 2;
    case "FECHAMENTO_SOLICITADO":
      return 3;
    case "COMPLETO":
      return 4;
  }
}

type Review = { decision: "APPROVE" | "REJECT"; subject: "HAE" | "fechamento" } | null;

export function HaeDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const notify = useNotify();
  const client = useQueryClient();
  const user = useUser();
  const hae = useQuery({ queryKey: haeKeys.detail(id), queryFn: () => haeApi.get(id) });

  const [review, setReview] = useState<Review>(null);
  const [closureOpen, setClosureOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [removing, setRemoving] = useState<Attachment | null>(null);

  const onSaved = (saved: Hae, message?: string) => {
    client.setQueryData(haeKeys.detail(id), saved);
    client.invalidateQueries({ queryKey: haeKeys.all, refetchType: "none" });
    if (message) notify(message);
  };

  const reviewMutation = useMutation({
    mutationFn: ({
      decision,
      subject,
      comment,
    }: {
      decision: "APPROVE" | "REJECT";
      subject: "HAE" | "fechamento";
      comment: string;
    }) =>
      subject === "HAE"
        ? haeApi.review(id, decision, comment || undefined)
        : haeApi.reviewClosure(id, decision, comment || undefined),
    onSuccess: (saved, vars) => {
      setReview(null);
      onSaved(
        saved,
        vars.decision === "APPROVE"
          ? "Aprovação registrada. O professor foi avisado."
          : "Devolução registrada. O professor foi avisado.",
      );
    },
  });
  const closure = useMutation({
    mutationFn: (input: Parameters<typeof haeApi.requestClosure>[1]) => haeApi.requestClosure(id, input),
    onSuccess: (saved) => {
      setClosureOpen(false);
      onSaved(saved, "Relatório de fechamento enviado à coordenação.");
    },
  });
  const viewed = useMutation({
    mutationFn: (value: boolean) => haeApi.setViewed(id, value),
    onSuccess: (saved) => onSaved(saved),
  });
  const upload = useMutation({
    mutationFn: (file: File) => haeApi.upload(id, file),
    onSuccess: (saved) => onSaved(saved, "Comprovante anexado."),
    onError: (e) => notify(errorMessage(e), "error"),
  });
  const removeAttachment = useMutation({
    mutationFn: (a: Attachment) => haeApi.removeAttachment(id, a.id),
    onSuccess: (saved) => {
      setRemoving(null);
      onSaved(saved, "Comprovante removido.");
    },
    onError: (e) => notify(errorMessage(e), "error"),
  });
  const remove = useMutation({
    mutationFn: () => haeApi.remove(id),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: haeKeys.all });
      notify("HAE excluída.");
      navigate("/minhas-haes", { replace: true });
    },
    onError: (e) => {
      setConfirmDelete(false);
      notify(errorMessage(e), "error");
    },
  });

  // Ao abrir uma HAE pendente de avaliação, o avaliador a marca como vista automaticamente.
  const autoViewed = useRef(false);
  const data = hae.data;
  useEffect(() => {
    if (
      data &&
      !data.viewed &&
      !autoViewed.current &&
      (data.permissions.canReview || data.permissions.canReviewClosure)
    ) {
      autoViewed.current = true;
      viewed.mutate(true);
    }
  }, [data, viewed]);

  if (hae.isPending) return <LoadingState />;
  if (hae.isError) return <ErrorState error={hae.error} onRetry={() => hae.refetch()} />;
  const h = hae.data;
  const p = h.permissions;
  const rejected = h.status === "REPROVADO";
  const isOwner = h.employee.id === user.id;
  const hint = isOwner ? STATUS_HINTS[h.status] : REVIEWER_HINTS[h.status];

  return (
    <>
      <PageHeader
        title={h.title}
        description={
          <>
            {h.employee.name} · {h.course.name} · {h.institution.name}
          </>
        }
        breadcrumbs={[
          {
            label: p.canReview || p.canReviewClosure ? "HAEs" : "Minhas HAEs",
            to: p.canReview || p.canReviewClosure ? "/haes" : "/minhas-haes",
          },
          { label: h.title },
        ]}
        actions={
          <>
            {p.canEdit && (
              <Button
                component={RouterLink}
                to={`/haes/${h.id}/editar`}
                startIcon={<EditOutlined />}
                variant="outlined"
              >
                Editar
              </Button>
            )}
            {p.canDelete && (
              <Button color="error" startIcon={<DeleteOutline />} onClick={() => setConfirmDelete(true)}>
                Excluir
              </Button>
            )}
          </>
        }
      />

      <Stack spacing={3}>
        <Card>
          <CardContent>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              sx={{ alignItems: { sm: "center" }, mb: 2 }}
            >
              <StatusChip status={h.status} size="medium" />
              <Typography color="text.secondary">{hint}</Typography>
            </Stack>
            <Stepper activeStep={activeStep(h)} alternativeLabel aria-label="Etapas da HAE">
              {STEPS.map((label, i) => (
                <Step key={label}>
                  <StepLabel error={rejected && i === 1}>
                    {rejected && i === 1 ? "Reprovada" : label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
            {h.reviewComment && (
              <Alert severity={rejected ? "error" : "info"} sx={{ mt: 2 }}>
                <AlertTitle>Comentário de {h.reviewer?.name ?? "avaliação"}</AlertTitle>
                {h.reviewComment}
              </Alert>
            )}
          </CardContent>
        </Card>

        {(p.canReview || p.canReviewClosure || p.canRequestClosure || (rejected && p.canEdit)) && (
          <Card sx={{ borderColor: "primary.main" }}>
            <CardContent>
              <Typography variant="h2" sx={{ mb: 1 }}>
                O que fazer agora
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                {p.canReview && (
                  <>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<CheckIcon />}
                      onClick={() => setReview({ decision: "APPROVE", subject: "HAE" })}
                    >
                      Aprovar HAE
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<CloseIcon />}
                      onClick={() => setReview({ decision: "REJECT", subject: "HAE" })}
                    >
                      Reprovar
                    </Button>
                  </>
                )}
                {p.canReviewClosure && (
                  <>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<CheckIcon />}
                      onClick={() => setReview({ decision: "APPROVE", subject: "fechamento" })}
                    >
                      Aprovar fechamento
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<CloseIcon />}
                      onClick={() => setReview({ decision: "REJECT", subject: "fechamento" })}
                    >
                      Recusar fechamento
                    </Button>
                  </>
                )}
                {rejected && p.canEdit && (
                  <Button
                    component={RouterLink}
                    to={`/haes/${h.id}/editar`}
                    variant="contained"
                    startIcon={<EditOutlined />}
                  >
                    Ajustar e reenviar
                  </Button>
                )}
                {p.canRequestClosure && (
                  <Button
                    variant="contained"
                    startIcon={<AssignmentTurnedInOutlined />}
                    onClick={() => setClosureOpen(true)}
                  >
                    Enviar relatório de fechamento
                  </Button>
                )}
              </Stack>
              {p.canRequestClosure && (
                <Typography color="text.secondary" sx={{ mt: 1 }}>
                  Dica: anexe os comprovantes abaixo antes de enviar o relatório.
                </Typography>
              )}
            </CardContent>
          </Card>
        )}

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Typography variant="h2" sx={{ mb: 2 }}>
                  Projeto
                </Typography>
                <Typography sx={{ whiteSpace: "pre-wrap", mb: 2 }}>{h.description}</Typography>
                {h.observations && (
                  <Typography sx={{ whiteSpace: "pre-wrap" }} color="text.secondary">
                    <strong>Observações:</strong> {h.observations}
                  </Typography>
                )}
                {h.studentRas.length > 0 && (
                  <>
                    <Typography variant="h3" sx={{ mt: 2, mb: 1 }}>
                      Alunos ({h.studentRas.length})
                    </Typography>
                    <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1 }}>
                      {h.studentRas.map((ra) => (
                        <Chip key={ra} label={ra} size="small" />
                      ))}
                    </Stack>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Typography variant="h2" sx={{ mb: 1 }}>
                  Detalhes
                </Typography>
                <Table size="small" aria-label="Detalhes da HAE">
                  <TableBody>
                    {[
                      ["Tipo", TYPE_LABELS[h.type]],
                      ["Dimensão", DIMENSION_LABELS[h.dimension]],
                      ["Modalidade", MODALITY_LABELS[h.modality]],
                      ["Carga", `${h.weeklyHours} h/semana`],
                      ["Período", `${formatDate(h.startDate)} a ${formatDate(h.endDate)}`],
                      ["Atualizada em", formatDateTime(h.updatedAt)],
                    ].map(([k, v]) => (
                      <TableRow key={k}>
                        <TableCell component="th" scope="row" sx={{ fontWeight: 600, pl: 0 }}>
                          {k}
                        </TableCell>
                        <TableCell>{v}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Typography variant="h3" sx={{ mt: 2, mb: 1 }}>
                  Cronograma
                </Typography>
                <Stack component="ul" sx={{ m: 0, pl: 2.5 }}>
                  {h.schedule.map((s) => (
                    <li key={s.day}>
                      {DAY_LABELS[s.day]}: {formatTime(s.start)} às {formatTime(s.end)}
                    </li>
                  ))}
                </Stack>
                {(p.canReview || p.canReviewClosure) && (
                  <Button
                    size="small"
                    sx={{ mt: 2 }}
                    onClick={() => viewed.mutate(!h.viewed)}
                    disabled={viewed.isPending}
                  >
                    {h.viewed ? "Marcar como não vista" : "Marcar como vista"}
                  </Button>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {(h.status === "APROVADO" ||
          h.status === "FECHAMENTO_SOLICITADO" ||
          h.status === "COMPLETO" ||
          h.attachments.length > 0) && (
          <AttachmentsCard
            attachments={h.attachments}
            canManage={p.canManageAttachments}
            uploading={upload.isPending}
            onUpload={(f) => upload.mutate(f)}
            onRemove={setRemoving}
            onInvalid={(m) => notify(m, "error")}
          />
        )}
        <ClosureHistory closures={h.closures} />
      </Stack>

      {review && (
        <ReviewDialog
          open
          decision={review.decision}
          subject={review.subject}
          loading={reviewMutation.isPending}
          error={reviewMutation.isError ? errorMessage(reviewMutation.error) : undefined}
          onClose={() => {
            setReview(null);
            reviewMutation.reset();
          }}
          onConfirm={(comment) => reviewMutation.mutate({ ...review, comment })}
        />
      )}
      {closureOpen && (
        <ClosureDialog
          open
          type={h.type}
          loading={closure.isPending}
          error={closure.isError ? errorMessage(closure.error) : undefined}
          onClose={() => setClosureOpen(false)}
          onSubmit={(input) => closure.mutate(input)}
        />
      )}
      <ConfirmDialog
        open={confirmDelete}
        title="Excluir HAE?"
        message={`A HAE “${h.title}” será excluída definitivamente. Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        destructive
        loading={remove.isPending}
        onConfirm={() => remove.mutate()}
        onClose={() => setConfirmDelete(false)}
      />
      <ConfirmDialog
        open={removing !== null}
        title="Remover comprovante?"
        message={`O arquivo “${removing?.fileName ?? ""}” será removido.`}
        confirmLabel="Remover"
        destructive
        loading={removeAttachment.isPending}
        onConfirm={() => removing && removeAttachment.mutate(removing)}
        onClose={() => setRemoving(null)}
      />
    </>
  );
}
