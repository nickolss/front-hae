import React from "react";
import { TextField, CircularProgress } from "@mui/material";
import { StepThreeProps } from "./types/haeFormTypes";

const StepThree: React.FC<StepThreeProps> = ({
  onBack,
  formData,
  setFormData,
  onSubmit,
  isEditMode,
  isCompleted,
  onOpenConfirmDialog,
  isSubmitting,
}) => {
  const handleSendClick = async () => {
    if (isEditMode) {
      await onOpenConfirmDialog();
    } else {
      await onSubmit();
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="font-semibold subtitle">Informações Adicionais</h2>
      <p className="text-gray-600">
        Adicione quaisquer observações ou detalhes importantes sobre a sua
        atividade HAE.
      </p>
      <div className="my-2">
        <TextField
          fullWidth
          label="Observações"
          multiline
          minRows={3}
          maxRows={10}
          placeholder="Ex.: Necessidade de acesso a laboratórios específicos..."
          value={formData.observations}
          onChange={(e) => setFormData("observations", e.target.value)}
          disabled={isCompleted || isSubmitting} 
        />
      </div>

      <div className="flex justify-between mt-10">
        <button
          type="button"
          onClick={onBack}
          className="btnFatec bg-gray-600 text-white uppercase hover:bg-gray-900"
          disabled={isCompleted || isSubmitting}
        >
          Voltar
        </button>
        <button
          type="button"
          onClick={handleSendClick}
          className="btnFatec text-white uppercase bg-red-800 hover:bg-red-900 disabled:bg-gray-400 disabled:cursor-not-allowed"
          disabled={isCompleted || isSubmitting}
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <CircularProgress size={20} color="inherit" />
              <span>{isEditMode ? "Atualizando..." : "Enviando..."}</span>
            </div>
          ) : isEditMode ? (
            "Atualizar"
          ) : (
            "Enviar"
          )}
        </button>
      </div>
    </div>
  );
};

export default StepThree;
