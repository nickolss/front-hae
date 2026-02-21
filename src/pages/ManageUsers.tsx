import { useEffect, useState } from "react";
import { api } from "@/services";
import { useAuth, LoggedUser } from "@/hooks/useAuth";
import {
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  Snackbar,
  Alert,
} from "@mui/material";
import { AppLayout } from "@/layouts";

const ROLES = ["PROFESSOR", "COORDENADOR", "ADMIN", "DIRETOR", "DEV"];

export const ManageUsers = () => {
  const [employees, setEmployees] = useState<LoggedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  } | null>(null);

  const { user: adminUser } = useAuth();

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await api.get<LoggedUser[]>(
          "/employee/getAllEmployee"
        );
        setEmployees(response.data);
      } catch (err) {
        console.error("Erro ao buscar funcionários:", err);
        setSnackbar({
          open: true,
          message: "Falha ao carregar usuários.",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

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

  if (loading) {
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
          Altere as permissões dos usuários do sistema.
        </p>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
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
                </tr>
              ))}
            </tbody>
          </table>
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
