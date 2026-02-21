import { useState, useCallback } from "react";
import { AlertColor } from "@mui/material";

interface UseSnackbarReturn {
	open: boolean;
	message: string;
	severity: AlertColor;
	showSnackbar: (message: string, severity?: AlertColor) => void;
	hideSnackbar: () => void;
}

/**
 * Hook customizado para gerenciar o estado de um SnackBar (notificação).
 * Oferece funções para mostrar e esconder a notificação com mensagens e severidades customizáveis.
 *
 * @returns {UseSnackbarReturn} Objeto contendo o estado do snackbar e funções de controle.
 */
export const useSnackbar = (): UseSnackbarReturn => {
	const [open, setOpen] = useState(false);
	const [message, setMessage] = useState("");
	const [severity, setSeverity] = useState<AlertColor>("info");

	/**
	 * Exibe o snackbar com a mensagem e severidade especificadas.
	 * @param {string} msg - A mensagem a ser exibida no snackbar.
	 * @param {AlertColor} [sev="info"] - A severidade da notificação (success, error, info, warning).
	 */
	const showSnackbar = useCallback((msg: string, sev: AlertColor = "info") => {
		setMessage(msg);
		setSeverity(sev);
		setOpen(true);
	}, []);

	/**
	 * Esconde o snackbar.
	 */
	const hideSnackbar = useCallback(() => {
		setOpen(false);
		setMessage("");
	}, []);

	return {
		open,
		message,
		severity,
		showSnackbar,
		hideSnackbar,
	};
};
