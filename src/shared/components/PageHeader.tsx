import type { ReactNode } from "react";
import { Box, Breadcrumbs, Link, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";

interface Props {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  breadcrumbs?: { label: string; to?: string }[];
}

export function PageHeader({ title, description, actions, breadcrumbs }: Props) {
  useDocumentTitle(title);
  return (
    <Box component="header" sx={{ mb: 3 }}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs aria-label="Você está em" sx={{ mb: 1 }}>
          {breadcrumbs.map((b) =>
            b.to ? (
              <Link key={b.label} component={RouterLink} to={b.to} color="inherit">
                {b.label}
              </Link>
            ) : (
              <Typography key={b.label} color="text.primary" aria-current="page">
                {b.label}
              </Typography>
            ),
          )}
        </Breadcrumbs>
      )}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}
      >
        <Box>
          <Typography variant="h1">{title}</Typography>
          {description && (
            <Typography color="text.secondary" sx={{ mt: 0.5 }}>
              {description}
            </Typography>
          )}
        </Box>
        {actions && (
          <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
            {actions}
          </Stack>
        )}
      </Stack>
    </Box>
  );
}
