import type { ReactNode } from "react";
import { Box, Container, Paper, Typography } from "@mui/material";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";

/** Layout das telas públicas (login, cadastro, recuperação de senha). */
export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  useDocumentTitle(title);
  return (
    <Box
      component="main"
      id="conteudo"
      sx={{ minHeight: "100vh", display: "grid", placeItems: "center", bgcolor: "background.default", py: 4 }}
    >
      <Container maxWidth="sm">
        <Paper sx={{ p: { xs: 3, sm: 5 } }} variant="outlined">
          <Box component="img" src="/logo_fatec_cor.png" alt="Fatec" sx={{ height: 48, mb: 2 }} />
          <Typography variant="h1" sx={{ mb: subtitle ? 1 : 3 }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              {subtitle}
            </Typography>
          )}
          {children}
        </Paper>
      </Container>
    </Box>
  );
}
