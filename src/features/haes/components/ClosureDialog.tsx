import { useForm } from "react-hook-form";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material";
import type { HaeType } from "@/shared/domain/labels";
import type { ClosureInput } from "../types";

interface Props {
  open: boolean;
  type: HaeType;
  loading: boolean;
  error?: string;
  onClose: () => void;
  onSubmit: (input: ClosureInput) => void;
}

type Values = Omit<ClosureInput, "type" | "studentCount"> & { studentCount?: string };

/** Relatório de fechamento: campos mudam conforme o tipo da HAE. */
export function ClosureDialog({ open, type, loading, error, onClose, onSubmit }: Props) {
  const { register, handleSubmit, formState } = useForm<Values>();
  const req = (msg: string) => ({ validate: (v?: string) => (v && v.trim().length > 0) || msg });
  const e = formState.errors;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" aria-labelledby="closure-title">
      <DialogTitle id="closure-title">Relatório de fechamento</DialogTitle>
      <form
        noValidate
        onSubmit={handleSubmit((v) =>
          onSubmit({ ...v, type, studentCount: v.studentCount ? Number(v.studentCount) : undefined }),
        )}
      >
        <DialogContent>
          <Stack spacing={2}>
            {error && <Alert severity="error">{error}</Alert>}
            {type === "TCC" && (
              <>
                <TextField
                  label="Seu papel no TCC"
                  required
                  placeholder="Ex.: orientador(a)"
                  {...register("role", req("Informe seu papel."))}
                  error={!!e.role}
                  helperText={e.role?.message}
                />
                <TextField
                  label="Quantidade de alunos"
                  type="number"
                  slotProps={{ htmlInput: { min: 0, max: 500 } }}
                  {...register("studentCount", {
                    validate: (v) =>
                      (v !== undefined && v !== "" && Number(v) >= 0) || "Informe a quantidade.",
                  })}
                  error={!!e.studentCount}
                  helperText={e.studentCount?.message}
                />
                <TextField
                  label="Nomes dos alunos"
                  required
                  multiline
                  minRows={2}
                  {...register("studentNames", req("Informe os alunos."))}
                  error={!!e.studentNames}
                  helperText={e.studentNames?.message}
                />
                <TextField label="Alunos aprovados" multiline minRows={2} {...register("approvedStudents")} />
                <TextField
                  label="Informações dos projetos"
                  multiline
                  minRows={2}
                  {...register("projectInfo")}
                />
              </>
            )}
            {type === "ESTAGIO" && (
              <>
                <TextField
                  label="Estagiários acompanhados"
                  required
                  multiline
                  minRows={3}
                  {...register("studentInfo", req("Descreva os estagiários."))}
                  error={!!e.studentInfo}
                  helperText={e.studentInfo?.message ?? "Nome, RA e empresa de cada aluno."}
                />
                <TextField label="Alunos aprovados" multiline minRows={2} {...register("approvedStudents")} />
              </>
            )}
            {type === "APOIO_DIRECAO" && (
              <>
                <TextField
                  label="Tipo de apoio"
                  required
                  {...register("supportType", req("Informe o tipo de apoio."))}
                  error={!!e.supportType}
                  helperText={e.supportType?.message}
                />
                <TextField
                  label="Atividades realizadas"
                  required
                  multiline
                  minRows={4}
                  {...register("description", req("Descreva as atividades."))}
                  error={!!e.description}
                  helperText={e.description?.message}
                />
                <TextField
                  label="Alunos aprovados (se houver)"
                  multiline
                  minRows={2}
                  {...register("approvedStudents")}
                />
                <TextField
                  label="Alunos que receberão certificado (se houver)"
                  multiline
                  minRows={2}
                  {...register("certificateStudents")}
                />
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" loading={loading}>
            Enviar para avaliação
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
