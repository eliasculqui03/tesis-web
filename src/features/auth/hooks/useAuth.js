import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUser } from "../../../api";
import { authService } from "../../../api/authService.js";

export function useAuth() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const login = async (document_number, password) => {
    setLoading(true);
    setError("");
    try {
      await authService.login(document_number, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err || "Credenciales incorrectas");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await authService.logout();
    navigate("/login");
  };

  return { login, logout, loading, error, user: getUser() };
}
