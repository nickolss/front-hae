import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link as RouterLink } from "react-router";
import {
  Button,
  Chip,
  Link,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import AddBusinessOutlined from "@mui/icons-material/AddBusinessOutlined";
import { PageHeader } from "@/shared/components/PageHeader";
import { EmptyState, ErrorState, LoadingState } from "@/shared/components/States";
import { errorMessage } from "@/shared/api/problem";
import { useNotify } from "@/shared/hooks/notifyContext";
import { institutionApi, institutionKeys } from "./api";
import { InstitutionDialog } from "./InstitutionDialog";

export function InstitutionsPage() {
  const notify = useNotify();
  const client = useQueryClient();
  const [creating, setCreating] = useState(false);
  const list = useQuery({ queryKey: institutionKeys.all, queryFn: institutionApi.list });
  const create = useMutation({
    mutationFn: institutionApi.create,
    onSuccess: () => {
      client.invalidateQueries({ queryKey: institutionKeys.all });
      notify("Instituição criada. Cadastre agora os cursos.");
      setCreating(false);
    },
  });

  return (
    <>
      <PageHeader
        title="Instituições"
        description="Unidades que usam o sistema."
        actions={
          <Button variant="contained" startIcon={<AddBusinessOutlined />} onClick={() => setCreating(true)}>
            Nova instituição
          </Button>
        }
      />
      {list.isPending ? (
        <LoadingState />
      ) : list.isError ? (
        <ErrorState error={list.error} onRetry={() => list.refetch()} />
      ) : list.data.length === 0 ? (
        <EmptyState
          title="Nenhuma instituição cadastrada"
          action={
            <Button variant="contained" onClick={() => setCreating(true)}>
              Cadastrar a primeira
            </Button>
          }
        />
      ) : (
        <Paper variant="outlined">
          <TableContainer>
            <Table size="small" aria-label="Instituições">
              <TableHead>
                <TableRow>
                  <TableCell>Código</TableCell>
                  <TableCell>Nome</TableCell>
                  <TableCell>Endereço</TableCell>
                  <TableCell align="right">Limite (h/sem)</TableCell>
                  <TableCell>Situação</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {list.data.map((i) => (
                  <TableRow key={i.id} hover>
                    <TableCell>{i.code}</TableCell>
                    <TableCell>
                      <Link component={RouterLink} to={`/instituicoes/${i.id}`}>
                        {i.name}
                      </Link>
                    </TableCell>
                    <TableCell>{i.address}</TableCell>
                    <TableCell align="right">{i.weeklyHoursLimit}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        variant="outlined"
                        color={i.active ? "success" : "default"}
                        label={i.active ? "Ativa" : "Inativa"}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
      {creating && (
        <InstitutionDialog
          open
          loading={create.isPending}
          error={create.isError ? errorMessage(create.error) : undefined}
          onClose={() => setCreating(false)}
          onSubmit={(input) => create.mutate(input)}
        />
      )}
    </>
  );
}
