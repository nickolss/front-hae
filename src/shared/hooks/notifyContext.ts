import { createContext, useContext } from "react";
import type { AlertColor } from "@mui/material";

export type Notify = (message: string, severity?: AlertColor) => void;

export const NotifyContext = createContext<Notify | null>(null);

export function useNotify(): Notify {
  const ctx = useContext(NotifyContext);
  if (!ctx) throw new Error("useNotify deve ser usado dentro de NotifyProvider");
  return ctx;
}
