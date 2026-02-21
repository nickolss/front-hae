import { EmployeeProvider } from "./context/EmployeeContext";
import { AppRoutes } from "./routes";

export default function App() {
  return (
    <EmployeeProvider>
      <AppRoutes />
    </EmployeeProvider>
  );
}
