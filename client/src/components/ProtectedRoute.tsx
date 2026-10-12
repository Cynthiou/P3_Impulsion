import { Navigate, Outlet } from "react-router";
import { useAuth } from "../contexts/AuthContext";

function ProtectedRoute() {
  const { user, isInitializing } = useAuth();

  if (isInitializing) {
    return null;
  }

  if (user === null) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
