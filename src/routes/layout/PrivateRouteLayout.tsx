import { useAuth } from "@/hooks/useAuth";
import { CircularProgress } from "@mui/material";
import { JSX } from "react";
import { Navigate, useLocation } from "react-router-dom";

export const PrivateRouteLayout = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <CircularProgress
          size={70}
          sx={{
            "& .MuiCircularProgress-circle": {
              stroke: "#c10007",
            },
          }}
        />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (location.pathname === "/") {
    let redirectPath = "/dashboard";

    switch (user.role) {
      case "COORDENADOR":
        redirectPath = "/dashboard-coordenador";
        break;
      case "ADMIN":
        redirectPath = "/dashboard-admin";
        break;
      case "DIRETOR":
        redirectPath = "/dashboard-diretor";
        break;
      case "DEV":
        redirectPath = "/dashboard-dev"
        break;
      default:
        redirectPath = "/dashboard";
        break;
    }

    return <Navigate to={redirectPath} replace />;
  }

  return children;
};
