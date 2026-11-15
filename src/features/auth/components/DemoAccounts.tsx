import { Box, Button, Divider, List, ListItem, ListItemText, Typography } from "@mui/material";
import { useSystemInfo } from "@/shared/api/systemInfo";
import { ROLE_LABELS } from "@/shared/domain/labels";

/** Contas fictícias da demonstração. A senha é informada por quem apresenta (não é exibida). */
export function DemoAccounts({ onSelect }: { onSelect: (email: string) => void }) {
  const { demo, demoAccounts } = useSystemInfo();
  if (!demo || demoAccounts.length === 0) return null;
  return (
    <Box component="section" aria-labelledby="demo-accounts-title" sx={{ mt: 4 }}>
      <Divider sx={{ mb: 2 }} />
      <Typography id="demo-accounts-title" variant="h3" component="h2" sx={{ mb: 0.5 }}>
        Contas de demonstração
      </Typography>
      <Typography color="text.secondary" variant="body2" sx={{ mb: 1 }}>
        Escolha um perfil para preencher o e-mail. A senha é informada por quem está apresentando.
      </Typography>
      <List dense disablePadding>
        {demoAccounts.map((a) => (
          <ListItem
            key={a.email}
            disableGutters
            secondaryAction={
              <Button size="small" onClick={() => onSelect(a.email)} aria-label={`Usar a conta de ${a.name}`}>
                Usar
              </Button>
            }
          >
            <ListItemText
              primary={`${a.name} · ${ROLE_LABELS[a.role]}`}
              secondary={a.description}
              sx={{ pr: 8 }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
