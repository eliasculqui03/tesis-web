import { useState, useEffect, useCallback } from "react";
import { positionService } from "../../../api/positionService";

export function usePositions() {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({});

  const fetchPositions = useCallback(async (search = "") => {
    setLoading(true);
    setError("");
    try {
      const response = await positionService.getAll(search);
      setPositions(response.data || []);
      setPagination(response.data_external || {});
    } catch (err) {
      setError(err || "Error al cargar cargos");
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleStatus = async (id) => {
    try {
      await positionService.toggleStatus(id);
      await fetchPositions();
    } catch (err) {
      setError(err || "Error al cambiar estado");
    }
  };

  useEffect(() => {
    fetchPositions();
  }, [fetchPositions]);

  return {
    positions,
    loading,
    error,
    pagination,
    fetchPositions,
    toggleStatus,
  };
}
