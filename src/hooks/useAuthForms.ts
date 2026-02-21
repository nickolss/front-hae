import { useSnackbar } from "./useSnackbar";
import { LoggedUser } from "./useAuth";
import { IAuthService } from "@/services";

export interface LoginResult {
	success: boolean;
	user: LoggedUser | null;
}

export interface VerificationResult {
	success: boolean;
	user: LoggedUser | null;
}



export const useAuthForms = (authService: IAuthService) => {
	const { open, message, severity, showSnackbar, hideSnackbar } = useSnackbar();

	const handleRegister = async (data: {
		email: string;
  		password: string;
  		name: string;
  		course: string;
  		institution: string;
	}) => {
		if (!authService.register) {
			showSnackbar("Funcionalidade de cadastro não disponível.", "error");
			return false;
		}
		try {
			await authService.register(data);
			localStorage.setItem("token", crypto.randomUUID());
			localStorage.setItem("email", data.email);
			showSnackbar(
				"Cadastro realizado com sucesso! Verifique seu e-mail.",
				"success"
			);
			return true;
		} catch (error) {
			console.log(error);
			showSnackbar("Erro ao cadastrar", "error");
			return false;
		}
	};

	const handleLogin = async (data: {
		email: string;
		password: string;
	}): Promise<LoginResult> => {
		if (!authService.login) {
			console.error("Auth service does not provide a login function.");
			showSnackbar("Funcionalidade de login não disponível.", "error");
			return { success: false, user: null };
		}
		try {
			const loggedInUser = await authService.login(data);
			localStorage.setItem("token", crypto.randomUUID());
			localStorage.setItem("email", data.email);
			showSnackbar("Login realizado com sucesso!", "success");
			return { success: true, user: loggedInUser };
		} catch (error) {
			console.log(error);
			const errorMessage =
				"Credenciais inválidas. Verifique seu e-mail e senha.";
			showSnackbar(errorMessage, "error");
			return { success: false, user: null };
		}
	};

	const handleLogout = async () => {
		if (!authService.logout) {
			showSnackbar("Funcionalidade de logout não disponível.", "error");
			return false;
		}
		try {
			await authService.logout();
			localStorage.removeItem("token");
			localStorage.removeItem("email");
			showSnackbar("Logout realizado com sucesso!", "success");
			return true;
		} catch (error) {
			console.log(error);
			const errorMessage = "Erro ao fazer logout. Tente novamente.";
			showSnackbar(errorMessage, "error");
			return false;
		}
	};

	return {
		openSnackbar: open,
		snackbarMessage: message,
		snackbarSeverity: severity,
		handleCloseSnackbar: hideSnackbar,
		handleRegister,
		handleLogin,
		handleLogout,
	};
};
