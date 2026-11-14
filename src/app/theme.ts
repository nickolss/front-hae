import { createTheme } from "@mui/material/styles";
import { ptBR } from "@mui/material/locale";

/** Identidade visual Fatec. Cores verificadas para contraste AA (vermelho #b5000a sobre branco ≈ 6,9:1). */
export const theme = createTheme(
  {
    palette: {
      primary: { main: "#b5000a", dark: "#8a0008", contrastText: "#ffffff" },
      secondary: { main: "#43555f", contrastText: "#ffffff" },
      background: { default: "#f4f5f6", paper: "#ffffff" },
      text: { primary: "#1f2a30", secondary: "#4a5a63" },
    },
    shape: { borderRadius: 8 },
    typography: {
      fontFamily: '"Inter Variable", "Segoe UI", Roboto, Arial, sans-serif',
      h1: { fontSize: "1.75rem", fontWeight: 700 },
      h2: { fontSize: "1.375rem", fontWeight: 700 },
      h3: { fontSize: "1.125rem", fontWeight: 600 },
      button: { textTransform: "none", fontWeight: 600 },
    },
    components: {
      MuiButton: { defaultProps: { disableElevation: true } },
      MuiTextField: { defaultProps: { fullWidth: true } },
      MuiCard: { defaultProps: { variant: "outlined" } },
      MuiLink: { defaultProps: { underline: "hover" } },
    },
  },
  ptBR,
);
