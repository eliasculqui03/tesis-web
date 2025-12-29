import { useState, useEffect, useCallback } from "react";
import { userService } from "../../../api/userService.js";

export function useUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    lastPage: 1,
    total: 0,
  });

  const fetchUsers = useCallback(async (page = 1, search = "") => {
    setLoading(true);
    setError("");
    try {
      const response = await userService.getAll(page, search);
      setUsers(response.data || []);
      setPagination({
        page: response.data_external?.page || 1,
        lastPage: response.data_external?.last_page || 1,
        total: response.data_external?.total_result || 0,
        perPage: response.data_external?.per_page || 10,
      });
    } catch (err) {
      setError(err || "Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleStatus = async (id) => {
    try {
      await userService.toggleStatus(id);
      await fetchUsers(pagination.page);
      return true;
    } catch (err) {
      setError(err || "Error al cambiar estado");
      return false;
    }
  };

  const changePassword = async (id, newPassword) => {
    try {
      await userService.changePassword(id, newPassword);
      return true;
    } catch (err) {
      setError(err || "Error al cambiar contraseña");
      return false;
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    pagination,
    fetchUsers,
    toggleStatus,
    changePassword,
  };
}
