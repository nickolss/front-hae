import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import type { Institution, InstitutionInput } from "./api";

const schema = z.object({
  code: z.number({ error: "Informe o código." }).int().positive("O código deve ser positivo."),
  name: z.string().trim().min(3, "Informe o nome.").max(150),
  address: z.string().trim().min(3, "Informe o endereço.").max(255),
  weeklyHoursLimit: z.number({ error: "Informe o limite." }).int().min(0).max(10000),
});

interface Props {
  open: boolean;
  initial?: Institution;
  loading: boolean;
  error?: string;
  onClose: () => void;
  onSubmit: (input: InstitutionInput) => void;
}

export function InstitutionDialog({ open, initial, loading, error, onClose, onSubmit }: Props) {
  const { register, handleSubmit, formState } = useForm<InstitutionInput>({
    resolver: zodResolver(schema),
    defaultValues: initial ?? { name: "", address: "" },
  });
  const e = formState.errors;
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" aria-labelledby="institution-dialog">
      <DialogTitle id="institution-dialog">{initial ? "Editar instituição" : "Nova instituição"}</DialogTitle>
      <form noValidate onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Stack spacing={2}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField
              label="Código da unidade"
              type="number"
              required
              {...register("code", { valueAsNumber: true })}
              error={!!e.code}
              helperText={e.code?.message ?? "Código oficial da Fatec no CPS."}
            />
            <TextField
              label="Nome"
              required
              {...register("name")}
              error={!!e.name}
              helperText={e.name?.message}
            />
            <TextField
              label="Endereço"
              required
              {...register("address")}
              error={!!e.address}
              helperText={e.address?.message}
            />
            <TextField
              label="Limite de horas semanais de HAE (por semestre)"
              type="number"
              required
              {...register("weeklyHoursLimit", { valueAsNumber: true })}
              error={!!e.weeklyHoursLimit}
              helperText={e.weeklyHoursLimit?.message}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained" loading={loading}>
            Salvar
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
