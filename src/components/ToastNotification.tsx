import React from "react";
import { Snackbar, Alert } from "@mui/material";

interface ToastNotificationProps {
	open: boolean;
	message: string;
	severity: "error" | "success" | "info" | "warning";
	onClose: () => void;
	autoHideDuration?: number;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
	open,
	message,
	severity,
	onClose,
	autoHideDuration = 6000,
}) => {
	const handleClose = (
		_event?: React.SyntheticEvent | Event,
		reason?: string
	) => {
		if (reason === "clickaway") {
			return;
		}
		onClose();
	};

	return (
		<Snackbar
			open={open}
			autoHideDuration={autoHideDuration}
			onClose={handleClose}
			anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
		>
			<Alert onClose={handleClose} severity={severity} sx={{ width: "100%" }}>
				<p className="font-semibold">{message}</p>
			</Alert>
		</Snackbar>
	);
};
