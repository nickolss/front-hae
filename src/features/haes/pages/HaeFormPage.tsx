import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Navigate, useNavigate, useParams } from "react-router";
import { Alert, MenuItem, TextField } from "@mui/material";
import { PageHeader } from "@/shared/components/PageHeader";
import { ErrorState, LoadingState } from "@/shared/components/States";
import { errorMessage } from "@/shared/api/problem";
import { useNotify } from "@/shared/hooks/notifyContext";
import { useUser } from "@/features/auth/session";
import { employeeApi } from "@/features/employees/api";
import { canReview, canManageInstitution } from "@/shared/domain/labels";
import { HaeForm } from "../components/HaeForm";
import { haeApi, haeKeys } from "../api";
import { emptyHae, fromHae, toInput, type HaeFormValues } from "../schema";

export function NewHaePage() {
  const user = useUser();
  const navigate = useNavigate();
  const notify = useNotify();
  const client = useQueryClient();
  const [ownerId, setOwnerId] = useState("");
  const canChooseOwner = canReview(user.role) || canManageInstitution(user.role);
  const professors = useQuery({
    queryKey: ["employees", "owners", user.institution?.id],
    queryFn: () => employeeApi.search({ institutionId: user.institution?.id, size: 100 }),
    enabled: canChooseOwner,
  });

  const create = useMutation({
    mutationFn: (values: HaeFormValues) => haeApi.create(toInput(values, ownerId || undefined)),
    onSuccess: (hae) => {
      client.invalidateQueries({ queryKey: haeKeys.all });
      notify("HAE enviada para avaliação da coordenação.");
      navigate(`/haes/${hae.id}`, { replace: true });
    },
  });

  if (!user.institution) return <Navigate to="/" replace />;

  return (
    <>
      <PageHeader
        title="Nova HAE"
        description="Preencha os dados do projeto. Após o envio, a coordenação do curso será avisada por e-mail."
        breadcrumbs={[{ label: "Minhas HAEs", to: "/minhas-haes" }, { label: "Nova HAE" }]}
      />
      <HaeForm
        institutionId={user.institution.id}
        defaultValues={{ ...emptyHae, courseId: user.course?.id ?? "" }}
        submitLabel="Enviar para avaliação"
        submitting={create.isPending}
        serverError={create.isError ? errorMessage(create.error) : undefined}
        onSubmit={(v) => create.mutate(v)}
        onCancel={() => navigate(-1)}
        ownerField={
          canChooseOwner ? (
            <TextField
              select
              label="Responsável pela HAE"
              value={ownerId}
              onChange={(e) => setOwnerId(e.target.value)}
              helperText="Coordenadores e diretores podem registrar a HAE em nome de um professor."
            >
              <MenuItem value="">Eu mesmo(a)</MenuItem>
              {(professors.data?.content ?? [])
                .filter((p) => p.id !== user.id)
                .map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.name}
                  </MenuItem>
                ))}
            </TextField>
          ) : undefined
        }
      />
    </>
  );
}

export function EditHaePage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const notify = useNotify();
  const client = useQueryClient();
  const hae = useQuery({ queryKey: haeKeys.detail(id), queryFn: () => haeApi.get(id) });
  const update = useMutation({
    mutationFn: (values: HaeFormValues) => haeApi.update(id, toInput(values)),
    onSuccess: (saved) => {
      client.setQueryData(haeKeys.detail(id), saved);
      client.invalidateQueries({ queryKey: haeKeys.all });
      notify("HAE atualizada e reenviada para avaliação.");
      navigate(`/haes/${id}`, { replace: true });
    },
  });

  if (hae.isPending) return <LoadingState />;
  if (hae.isError) return <ErrorState error={hae.error} onRetry={() => hae.refetch()} />;
  if (!hae.data.permissions.canEdit) return <Navigate to={`/haes/${id}`} replace />;

  return (
    <>
      <PageHeader
        title="Editar HAE"
        breadcrumbs={[
          { label: "Minhas HAEs", to: "/minhas-haes" },
          { label: hae.data.title, to: `/haes/${id}` },
          { label: "Editar" },
        ]}
      />
      {hae.data.status !== "PENDENTE" && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Ao salvar, a HAE volta para “Aguardando avaliação” e precisará ser aprovada novamente.
        </Alert>
      )}
      <HaeForm
        institutionId={hae.data.institution.id}
        defaultValues={fromHae(hae.data)}
        submitLabel="Salvar e reenviar"
        submitting={update.isPending}
        serverError={update.isError ? errorMessage(update.error) : undefined}
        onSubmit={(v) => update.mutate(v)}
        onCancel={() => navigate(-1)}
      />
    </>
  );
}
