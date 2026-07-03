import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  return localStorage.getItem("token") ? (
    children
  ) : (
    <Navigate to="/" replace state={{ from: location.pathname }} />
  );
}
