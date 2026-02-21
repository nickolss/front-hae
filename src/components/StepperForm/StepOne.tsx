import React, { useState, useEffect } from "react";
import {
  TextField,
  MenuItem,
  FormHelperText,
  FormControl,
} from "@mui/material";
import { StepOneProps, FormErrors } from "./types/haeFormTypes";
import { stepOneSchema } from "@/validation/haeFormSchema";
import { ValidationError } from "yup";
import {
  COURSE_OPTIONS,
  HAE_TYPE_OPTIONS,
  MODALITY_OPTIONS,
  DIMENSAO_OPTIONS,
} from "@/constants/options";

const StepOne: React.FC<StepOneProps> = ({
  onNext,
  formData,
  setFormData,
  isCompleted,
}) => {
  const [errors, setErrors] = useState<FormErrors>({});
  const [studentRAs, setStudentRAs] = useState<string[]>([""]);

  useEffect(() => {
    if (formData.studentRAs) {
      setStudentRAs(
        formData.studentRAs.length > 0 ? formData.studentRAs : [""]
      );
    }
  }, [formData.studentRAs]);

  const handleNext = async () => {
    try {
      setErrors({});
      const nonEmptyRAs = studentRAs.filter((ra) => ra.trim() !== "");

      await stepOneSchema.validate(
        {
          projectTitle: formData.projectTitle,
          projectType: formData.projectType,
          dimensao: formData.dimensao,
          course: formData.course,
          projectDescription: formData.projectDescription,
          studentRAs: nonEmptyRAs,
          modality: formData.modality,
        },
        { abortEarly: false }
      );

      setFormData("studentRAs", nonEmptyRAs);
      onNext();
    } catch (validationErrors: unknown) {
      const newErrors: FormErrors = {};
      if (validationErrors instanceof ValidationError) {
        validationErrors.inner.forEach((error: ValidationError) => {
          if (error.path) {
            const pathAsString = String(error.path);

            if (pathAsString.startsWith("studentRAs")) {
              if (!newErrors.studentRAs) {
                newErrors.studentRAs = error.message;
              }
            } else {
              newErrors[pathAsString as keyof FormErrors] = error.message;
            }
          }
        });
      }
      setErrors(newErrors);
      console.error("Erros de validação no Step One:", newErrors);
    }
  };

  const handleRAChange = (index: number, value: string) => {
    const updatedRAs = [...studentRAs];
    updatedRAs[index] = value;
    setStudentRAs(updatedRAs);
    setFormData("studentRAs", updatedRAs);

    if (errors.studentRAs) {
      setErrors((prev) => ({ ...prev, studentRAs: undefined }));
    }
  };

  const handleProjectTypeChange = (newValue: string) => {
    setFormData("projectType", newValue);
    if (errors.projectType) {
      setErrors((prevErrors) => ({ ...prevErrors, projectType: undefined }));
    }
    if (newValue !== "Estagio" && newValue !== "TCC") {
      setStudentRAs([""]);
      setFormData("studentRAs", []);
      if (errors.studentRAs) {
        setErrors((prevErrors) => ({ ...prevErrors, studentRAs: undefined }));
      }
    }
  };

  const addRAField = () => {
    setStudentRAs([...studentRAs, ""]);
  };

  const removeRAField = (index: number) => {
    const updatedRAs = studentRAs.filter((_, i) => i !== index);
    setStudentRAs(updatedRAs);
    setFormData("studentRAs", updatedRAs);
  };

  const handleChange = (field: keyof FormErrors, value: string) => {
    setFormData(field as keyof typeof formData, value); // Type assertion para segurança
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="font-semibold subtitle">Definição de Atividade</h2>
        <p className="text-gray-600">
          Forneça os dados essenciais da sua HAE, como título, curso e descrição
          completa.
        </p>
      </div>

      <TextField
        fullWidth
        label="Título do Projeto"
        variant="outlined"
        placeholder="Ex.: Aulas de Legislação para Concurso Público"
        value={formData.projectTitle}
        onChange={(e) => handleChange("projectTitle", e.target.value)}
        error={!!errors.projectTitle}
        helperText={errors.projectTitle || " "}
        disabled={isCompleted}
      />

      <TextField
        fullWidth
        label="Tipo de projeto"
        select
        variant="outlined"
        value={formData.projectType}
        onChange={(e) => handleProjectTypeChange(e.target.value)}
        error={!!errors.projectType}
        helperText={errors.projectType || " "}
        disabled={isCompleted}
      >
        {HAE_TYPE_OPTIONS.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        fullWidth
        label="Dimensão da HAE"
        select
        variant="outlined"
        value={formData.dimensao}
        onChange={(e) => handleChange("dimensao", e.target.value)}
        error={!!errors.dimensao}
        helperText={errors.dimensao || " "}
        disabled={isCompleted}
      >
        {DIMENSAO_OPTIONS.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        fullWidth
        label="Modalidade"
        select
        variant="outlined"
        value={formData.modality}
        onChange={(e) => handleChange("modality", e.target.value)}
        error={!!errors.modality}
        helperText={errors.modality || " "}
        disabled={isCompleted}
      >
        {MODALITY_OPTIONS.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        fullWidth
        label="Curso relativo a HAE"
        select
        value={formData.course}
        onChange={(e) => handleChange("course", e.target.value)}
        error={!!errors.course}
        helperText={errors.course || " "}
        disabled={isCompleted}
      >
        {COURSE_OPTIONS.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        fullWidth
        label="Descrição do Projeto"
        multiline
        minRows={3}
        maxRows={10}
        placeholder="Ex.: O projeto consiste em ministrar aulas preparatórias..."
        value={formData.projectDescription}
        onChange={(e) => handleChange("projectDescription", e.target.value)}
        error={!!errors.projectDescription}
        helperText={errors.projectDescription || " "}
        disabled={isCompleted}
      />

      {(formData.projectType === "TCC" ||
        formData.projectType === "Estagio") && (
        <FormControl
          fullWidth
          error={!!errors.studentRAs}
          disabled={isCompleted}
        >
          <div className="flex flex-col gap-4">
            <h3 className="font-medium text-gray-700">RAs dos Alunos</h3>
            {studentRAs.map((ra, index) => (
              <div key={index} className="flex items-center gap-2">
                <TextField
                  required
                  fullWidth
                  label={`RA do Aluno ${index + 1}`}
                  variant="outlined"
                  value={ra}
                  onChange={(e) => handleRAChange(index, e.target.value)}
                />
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => removeRAField(index)}
                    className="text-red-500 font-bold"
                    disabled={isCompleted}
                  >
                    Remover
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addRAField}
              className="text-blue-500 font-semibold text-sm text-left w-fit"
              disabled={isCompleted}
            >
              + Adicionar outro RA
            </button>
          </div>
          {errors.studentRAs && typeof errors.studentRAs === "string" && (
            <FormHelperText>{errors.studentRAs}</FormHelperText>
          )}
        </FormControl>
      )}

      <div className="flex justify-end ">
        <button
          type="button"
          onClick={handleNext}
          className="py-2 btnFatec uppercase hover:bg-red-900"
          disabled={isCompleted}
        >
          <p>CONTINUAR</p>
        </button>
      </div>
    </div>
  );
};

export default StepOne;
