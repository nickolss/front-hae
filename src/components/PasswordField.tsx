import React from "react";
import {
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  IconButton,
  FormHelperText,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

interface PasswordFieldProps {
  label?: string;
  error?: boolean;
  helperText?: string;
  name: string;
}

export const PasswordField = React.forwardRef<
  HTMLInputElement,
  PasswordFieldProps
>(({ label = "Senha", error, helperText, ...inputProps }, ref) => {
  const [showPassword, setShowPassword] = React.useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  return (
    <FormControl
      error={error}
      variant="outlined"
      required
      sx={{ marginTop: "1rem" }}
    >
      <InputLabel htmlFor={inputProps.name}>{label}</InputLabel>
      <OutlinedInput
        id={inputProps.name}
        type={showPassword ? "text" : "password"}
        endAdornment={
          <InputAdornment position="end" sx={{ mr: 1 }}>
            <IconButton
              aria-label={showPassword ? "Esconder a senha" : "Mostrar a senha"}
              onClick={handleClickShowPassword}
              edge="end"
              tabIndex={-1}
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        }
        label={label}
        {...inputProps}
        inputRef={ref}
      />
      <FormHelperText>{helperText}</FormHelperText>
    </FormControl>
  );
});
PasswordField.displayName = "PasswordField";
