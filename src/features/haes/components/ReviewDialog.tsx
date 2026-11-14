import { useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from "@mui/material";

interface Props {
  open: boolean;
  decision: "APPROVE" | "REJECT";
  subject: "HAE" | "fechamento";
  loading: boolean;
  error?: string;
  onClose: () => void;
  onConfirm: (comment: string) => void;
}

/** Aprovação/reprovação; reprovar exige motivo (o professor precisa saber o que corrigir). */
export function ReviewDialog({ open, decision, subject, loading, error, onClose, onConfirm }: Props) {
  const [comment, setComment] = useState("");
  const [touched, setTouched] = useState(false);
  const reject = decision === "REJECT";
  const missing = reject && comment.trim().length === 0;
  const verb = reject ? (subject === "HAE" ? "Reprovar" : "Recusar") : "Aprovar";

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" aria-labelledby="review-title">
      <DialogTitle id="review-title">
        {verb} {subject === "HAE" ? "HAE" : "fechamento"}
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          {reject
            ? "Explique o que precisa ser ajustado. O professor receberá esta mensagem por e-mail."
            : "Você pode deixar um comentário opcional para o professor."}
        </DialogContentText>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <TextField
          label={reject ? "Motivo" : "Comentário (opcional)"}
          multiline
          minRows={3}
          autoFocus
          required={reject}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onBlur={() => setTouched(true)}
          error={touched && missing}
          helperText={touched && missing ? "Informe o motivo." : `${comment.length}/1000`}
          slotProps={{ htmlInput: { maxLength: 1000 } }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          color={reject ? "error" : "success"}
          loading={loading}
          onClick={() => {
            setTouched(true);
            if (!missing) onConfirm(comment.trim());
          }}
        >
          {verb}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
