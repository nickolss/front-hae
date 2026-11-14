import { isRouteErrorResponse, Link as RouterLink, useRouteError } from "react-router";
import { Box, Button, Typography } from "@mui/material";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";

function Message({ title, text }: { title: string; text: string }) {
  useDocumentTitle(title);
  return (
    <Box sx={{ textAlign: "center", py: 8, px: 2 }}>
      <Typography variant="h1" sx={{ mb: 1 }}>
        {title}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        {text}
      </Typography>
      <Button component={RouterLink} to="/" variant="contained">
        Voltar ao início
      </Button>
    </Box>
  );
}

export function NotFoundPage() {
  return <Message title="Página não encontrada" text="O endereço acessado não existe ou foi movido." />;
}

export function RouteErrorPage() {
  const error = useRouteError();
  if (isRouteErrorResponse(error) && error.status === 404) return <NotFoundPage />;
  // Falha ao baixar um chunk após um novo deploy: recarregar resolve.
  const chunkError =
    error instanceof Error &&
    /dynamically imported module|Importing a module script failed/i.test(error.message);
  return (
    <Message
      title={chunkError ? "Nova versão disponível" : "Algo deu errado"}
      text={
        chunkError
          ? "O sistema foi atualizado. Recarregue a página para continuar."
          : "Ocorreu um erro inesperado nesta tela. Tente novamente."
      }
    />
  );
}
