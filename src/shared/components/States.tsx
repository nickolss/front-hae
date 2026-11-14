import type { ReactNode } from "react";
import { Alert, Box, Button, CircularProgress, Paper, Stack, Typography } from "@mui/material";
import InboxOutlined from "@mui/icons-material/InboxOutlined";
import { errorMessage } from "@/shared/api/problem";

export function LoadingState({ label = "Carregando…" }: { label?: string }) {
  return (
    <Stack role="status" aria-live="polite" sx={{ alignItems: "center", py: 6, gap: 2 }}>
      <CircularProgress aria-hidden />
      <Typography color="text.secondary">{label}</Typography>
    </Stack>
  );
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  return (
    <Alert
      severity="error"
      action={
        onRetry && (
          <Button color="inherit" size="small" onClick={onRetry}>
            Tentar novamente
          </Button>
        )
      }
    >
      {errorMessage(error)}
    </Alert>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <Paper variant="outlined" sx={{ p: 4, textAlign: "center" }}>
      <Box aria-hidden sx={{ color: "text.secondary", mb: 1 }}>
        <InboxOutlined fontSize="large" />
      </Box>
      <Typography variant="h3" component="p">
        {title}
      </Typography>
      {description && (
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          {description}
        </Typography>
      )}
      {action && <Box sx={{ mt: 2 }}>{action}</Box>}
    </Paper>
  );
}
