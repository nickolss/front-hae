import { useEffect, useMemo, useState } from "react";
import { AppLayout } from "@/layouts";
import { useAuth } from "@/hooks/useAuth";
import {
  InstitutionCourse,
  institutionService,
} from "@/services/institutionService";
import { Institution } from "@/types/institution";
import {
  Alert,
  CircularProgress,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

export const ManageInstitutionCourses = () => {
  const { user, loading: userLoading } = useAuth();
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [selectedInstitutionId, setSelectedInstitutionId] = useState("");
  const [courses, setCourses] = useState<InstitutionCourse[]>([]);
  const [newCourseName, setNewCourseName] = useState("");
  const [loadingInstitutions, setLoadingInstitutions] = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const selectedInstitution = useMemo(
    () => institutions.find((inst) => inst.id === selectedInstitutionId),
    [institutions, selectedInstitutionId]
  );

  const fetchInstitutions = async () => {
    try {
      setLoadingInstitutions(true);
      const data = await institutionService.getAllInstitutions();
      setInstitutions(data);
      if (data.length > 0) {
        setSelectedInstitutionId(data[0].id);
      }
    } catch (err) {
      console.error(err);
      setError("Erro ao carregar instituições.");
    } finally {
      setLoadingInstitutions(false);
    }
  };

  const fetchCourses = async (institutionId: string) => {
    if (!institutionId) return;

    try {
      setLoadingCourses(true);
      setError(null);
      const data = await institutionService.getCoursesByInstitutionId(institutionId);
      setCourses(data);
    } catch (err) {
      console.error(err);
      setError("Erro ao carregar cursos da instituição.");
    } finally {
      setLoadingCourses(false);
    }
  };

  useEffect(() => {
    fetchInstitutions();
  }, []);

  useEffect(() => {
    if (selectedInstitutionId) {
      fetchCourses(selectedInstitutionId);
    }
  }, [selectedInstitutionId]);

  const handleAddCourse = async () => {
    const trimmedName = newCourseName.trim();
    if (!selectedInstitutionId || !trimmedName) return;

    try {
      setSubmitting(true);
      setError(null);
      await institutionService.addInstitutionCourse(selectedInstitutionId, trimmedName);
      setNewCourseName("");
      setSuccessMessage("Curso adicionado com sucesso.");
      await fetchCourses(selectedInstitutionId);
    } catch (err) {
      console.error(err);
      setError("Não foi possível adicionar o curso.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveCourse = async (courseId: string) => {
    if (!selectedInstitutionId) return;

    try {
      setSubmitting(true);
      setError(null);
      await institutionService.removeInstitutionCourse(courseId);
      setSuccessMessage("Curso removido com sucesso.");
      await fetchCourses(selectedInstitutionId);
    } catch (err) {
      console.error(err);
      setError("Não foi possível remover o curso.");
    } finally {
      setSubmitting(false);
    }
  };

  if (userLoading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <CircularProgress size={70} sx={{ "& .MuiCircularProgress-circle": { stroke: "#c10007" } }} />
      </div>
    );
  }

  if (user?.role !== "DEV") {
    return (
      <AppLayout>
        <main className="col-start-2 row-start-2 p-4 md:p-6 lg:p-8 overflow-auto pt-20 md:pt-4 h-full">
          <Alert severity="warning">Apenas DEV pode acessar o gerenciamento de cursos.</Alert>
        </main>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <main className="col-start-2 row-start-2 p-4 md:p-6 lg:p-8 overflow-auto pt-20 md:pt-4 h-full">
        <h2 className="subtitle font-semibold">Gerenciar Cursos por Fatec</h2>
        <p className="text-gray-600 mt-1 mb-6">
          Selecione uma instituição, adicione novos cursos e remova cursos existentes.
        </p>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage(null)}>
            {successMessage}
          </Alert>
        )}

        <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 shadow-sm mb-6">
          <FormControl fullWidth size="small" disabled={loadingInstitutions}>
            <InputLabel>Instituição</InputLabel>
            <Select
              value={selectedInstitutionId}
              label="Instituição"
              onChange={(e) => setSelectedInstitutionId(e.target.value)}
            >
              {institutions.map((inst) => (
                <MenuItem key={inst.id} value={inst.id}>
                  {inst.name} ({inst.institutionCode})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 shadow-sm mb-6">
          <h3 className="font-semibold text-lg mb-4">Adicionar Curso</h3>
          <div className="flex flex-col md:flex-row gap-3">
            <TextField
              fullWidth
              size="small"
              label="Nome do curso"
              value={newCourseName}
              onChange={(e) => setNewCourseName(e.target.value)}
              disabled={!selectedInstitutionId || submitting}
            />
            <button
              className="btnFatec bg-red-800 text-white uppercase hover:bg-red-900 disabled:bg-gray-400"
              onClick={handleAddCourse}
              disabled={!selectedInstitutionId || !newCourseName.trim() || submitting}
            >
              Adicionar
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 shadow-sm">
          <h3 className="font-semibold text-lg mb-4">
            Cursos da Instituição {selectedInstitution ? `- ${selectedInstitution.name}` : ""}
          </h3>

          {loadingCourses ? (
            <div className="flex justify-center py-8">
              <CircularProgress size={40} sx={{ "& .MuiCircularProgress-circle": { stroke: "#c10007" } }} />
            </div>
          ) : courses.length === 0 ? (
            <p className="text-gray-500">Nenhum curso cadastrado para esta instituição.</p>
          ) : (
            <div className="space-y-2">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between border border-gray-200 rounded-md px-3 py-2"
                >
                  <span className="text-gray-800">{course.courseName}</span>
                  <IconButton
                    color="error"
                    onClick={() => handleRemoveCourse(course.id)}
                    disabled={submitting}
                    aria-label={`Remover curso ${course.courseName}`}
                  >
                    <DeleteOutlineIcon />
                  </IconButton>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </AppLayout>
  );
};
