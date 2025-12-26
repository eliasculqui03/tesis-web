import { Navigate } from "react-router-dom";
import { getToken } from "../api/apiClient.js";

export default function PrivateRoute({ children }) {
  return getToken() ? children : <Navigate to="/login" replace />;
}
