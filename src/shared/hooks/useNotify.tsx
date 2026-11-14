import { useCallback, useMemo, useState, type ReactNode } from "react";
import { Alert, Snackbar, type AlertColor } from "@mui/material";
import { NotifyContext, type Notify } from "./notifyContext";

interface Notice {
  message: string;
  severity: AlertColor;
  key: number;
}

/** Feedback global (toasts) anunciado por leitores de tela via role="status"/"alert". */
export function NotifyProvider({ children }: { children: ReactNode }) {
  const [notice, setNotice] = useState<Notice | null>(null);
  const notify = useCallback<Notify>((message, severity = "success") => {
    setNotice({ message, severity, key: Date.now() });
  }, []);
  const value = useMemo(() => notify, [notify]);

  return (
    <NotifyContext.Provider value={value}>
      {children}
      <Snackbar
        key={notice?.key}
        open={notice !== null}
        autoHideDuration={notice?.severity === "error" ? 8000 : 4000}
        onClose={(_, reason) => reason !== "clickaway" && setNotice(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        {notice ? (
          <Alert
            onClose={() => setNotice(null)}
            severity={notice.severity}
            variant="filled"
            role={notice.severity === "error" ? "alert" : "status"}
            sx={{ width: "100%" }}
          >
            {notice.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </NotifyContext.Provider>
  );
}
