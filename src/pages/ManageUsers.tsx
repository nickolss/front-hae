import { useEffect, useState } from "react";
import { api } from "@/services";
import { useAuth, LoggedUser, InstitutionInfo } from "@/hooks/useAuth";
import { institutionService } from "@/services/institutionService";
import {
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  Snackbar,
  Alert,
  TextField,
  InputAdornment,
  TablePagination,
  LinearProgress,
  IconButton,
} from "@mui/material";
import { Search as SearchIcon, Clear as ClearIcon } from "@mui/icons-material";
import { AppLayout } from "@/layouts";
import { PageResponse } from "@/types/pagination";

const ROLES = ["PROFESSOR", "COORDENADOR", "ADMIN", "DIRETOR", "DEV"];

export const ManageUsers = () => {
  const [employees, setEmployees] = useState<LoggedUser[]>([]);
  const [institutions, setInstitutions] = useState<InstitutionInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [updatingEmployeeId, setUpdatingEmployeeId] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  } | null>(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [searchName, setSearchName] = useState("");
  const [debouncedSearchName, setDebouncedSearchName] = useState("");

  const { user: adminUser } = useAuth();

  // Fetch institutions once
  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        const institutionsResponse = await institutionService.getAllInstitutions();
        setInstitutions(
          institutionsResponse.map((inst) => ({
            id: inst.id,
            name: inst.name,
            institutionCode: inst.institutionCode,
          }))
        );
      } catch (err) {
        console.error("Erro ao buscar instituições:", err);
      } finally {
        setInitialLoading(false);
      }
    };
    fetchInstitutions();
  }, []);

  // Debounce search name
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchName(searchName);
      setPage(0); // Reset to first page on new search
    }, 500);

    return () => clearTimeout(timer);
  }, [searchName]);

  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      try {
        const response = await api.get<PageResponse<LoggedUser>>("/employee/getAllEmployee", {
          params: {
            page: page,
            size: rowsPerPage,
            name: debouncedSearchName,
          },
        });

        setEmployees(response.data.content);
        setTotalElements(response.data.totalElements);
      } catch (err) {
        console.error("Erro ao buscar funcionários:", err);
        setSnackbar({
          open: true,
          message: "Falha ao carregar usuários.",
          severity: "error",
        });
      } finally {
        setLoading(false);
        setInitialLoading(false);
      }
    };
    fetchEmployees();
  }, [page, rowsPerPage, debouncedSearchName]);

  const handleRoleChange = async (employeeId: string, newRole: string) => {
    const originalEmployees = [...employees];

    const updatedEmployees = employees.map((emp) =>
      emp.id === employeeId
        ? { ...emp, role: newRole as LoggedUser["role"] }
        : emp
    );
    setEmployees(updatedEmployees);

    try {
      await api.put(`/admin/change-role/${employeeId}`, { newRole });
      setSnackbar({
        open: true,
        message: "Permissão atualizada com sucesso!",
        severity: "success",
      });
    } catch (error) {
      console.error("Erro ao atualizar a permissão:", error);
      setSnackbar({
        open: true,
        message: "Falha ao atualizar a permissão.",
        severity: "error",
      });
      setEmployees(originalEmployees);
    }
  };

  const handleInstitutionChange = async (
    employeeId: string,
    newInstitutionId: string
  ) => {
    const selectedInstitution = institutions.find(
      (institution) => institution.id === newInstitutionId
    );

    if (!selectedInstitution) {
      setSnackbar({
        open: true,
        message: "Instituição selecionada é inválida.",
        severity: "error",
      });
      return;
    }

    const originalEmployees = [...employees];
    const updatedEmployees = employees.map((emp) =>
      emp.id === employeeId ? { ...emp, institution: selectedInstitution } : emp
    );

    setEmployees(updatedEmployees);
    setUpdatingEmployeeId(employeeId);

    try {
      await api.put(`/admin/change-institution/${employeeId}`, {
        institutionId: selectedInstitution.id,
        institutionCode: selectedInstitution.institutionCode,
      });
      setSnackbar({
        open: true,
        message: "FATEC do usuário atualizada com sucesso!",
        severity: "success",
      });
    } catch (error) {
      console.error("Erro ao atualizar a FATEC do usuário:", error);
      setEmployees(originalEmployees);
      setSnackbar({
        open: true,
        message: "Falha ao atualizar a FATEC do usuário.",
        severity: "error",
      });
    } finally {
      setUpdatingEmployeeId(null);
    }
  };

  if (initialLoading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <CircularProgress
          size={70}
          sx={{
            "& .MuiCircularProgress-circle": {
              stroke: "#c10007",
            },
          }}
        />
      </div>
    );
  }

  return (
    <AppLayout>
      <main className="col-start-2 row-start-2 p-4 md:p-8 overflow-auto bg-gray-50 pt-20 md:pt-4 h-full">
        <h2 className="subtitle font-semibold">Gerenciar Usuários</h2>
        <p className="text-gray-600 mb-6">
          Altere permissões e a FATEC vinculada aos usuários do sistema.
        </p>

        <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Pesquisar por nome..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="md:max-w-md bg-white"
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon className="text-gray-400" />
                </InputAdornment>
              ),
              endAdornment: searchName && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setSearchName("")}
                    edge="end"
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden relative">
          {loading && (
            <div className="absolute top-0 left-0 right-0 z-10">
              <LinearProgress sx={{ backgroundColor: '#f3f4f6', '& .MuiLinearProgress-bar': { backgroundColor: '#c10007' } }} />
            </div>
          )}
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Nome
                </th>
                <th scope="col" className="px-6 py-3">
                  E-mail
                </th>
                <th scope="col" className="px-6 py-3">
                  Permissão (Role)
                </th>
                <th scope="col" className="px-6 py-3">
                  FATEC
                </th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr
                  key={employee.id}
                  className="bg-white border-b hover:bg-gray-50"
                >
                  <th
                    scope="row"
                    className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                  >
                    {employee.name}
                  </th>
                  <td className="px-6 py-4">{employee.email}</td>
                  <td className="px-6 py-4">
                    <FormControl
                      size="small"
                      variant="outlined"
                      sx={{ minWidth: 150 }}
                    >
                      <Select
                        value={employee.role}
                        onChange={(e) =>
                          handleRoleChange(employee.id, e.target.value)
                        }
                        disabled={employee.id === adminUser?.id}
                      >
                        {ROLES.map((role) => (
                          <MenuItem key={role} value={role}>
                            {role}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </td>
                  <td className="px-6 py-4">
                    <FormControl
                      size="small"
                      variant="outlined"
                      sx={{ minWidth: 220 }}
                    >
                      <Select
                        value={employee.institution?.id ?? ""}
                        onChange={(e) =>
                          handleInstitutionChange(employee.id, e.target.value)
                        }
                        disabled={
                          employee.id === adminUser?.id ||
                          updatingEmployeeId === employee.id
                        }
                      >
                        {institutions.map((institution) => (
                          <MenuItem key={institution.id} value={institution.id}>
                            {institution.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {employees.length === 0 && !loading && (
            <div className="p-8 text-center text-gray-500">
              Nenhum usuário encontrado.
            </div>
          )}
          <TablePagination
            component="div"
            count={totalElements}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            labelRowsPerPage="Linhas por página"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
            }
          />
        </div>
      </main>

      <Snackbar
        open={snackbar?.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar(null)}
          severity={snackbar?.severity}
          sx={{ width: "100%" }}
        >
          {snackbar?.message}
        </Alert>
      </Snackbar>
    </AppLayout>
  );
};
