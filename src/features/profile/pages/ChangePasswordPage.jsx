import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { profileService } from "../../../api/profileService.js";
import { useConfirm } from "../../../hooks/useConfirm.js";
import ConfirmDialog from "../../../components/ConfirmDialog.jsx";

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const dialog = useConfirm();

  const [form, setForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.newPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);

    try {
      await profileService.changePassword(form.newPassword);
      dialog.success(
        "¡Contraseña actualizada!",
        "Tu contraseña se cambió correctamente.",
        {
          onConfirm: () => navigate("/admin/perfil"),
        }
      );
    } catch (err) {
      setError(err || "Error al cambiar contraseña");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          Cambiar Contraseña
        </h1>
        <p className="text-gray-500 text-sm">Ingresa tu nueva contraseña</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-gray-200 p-6"
      >
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nueva contraseña
            </label>
            <input
              type="password"
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
              required
              minLength={6}
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar contraseña
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
              required
              minLength={6}
              placeholder="Repite la contraseña"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-lg bg-black text-white font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 text-sm"
          >
            {loading ? "Guardando..." : "Cambiar contraseña"}
          </button>
        </div>
      </form>

      <ConfirmDialog
        isOpen={dialog.isOpen}
        onClose={dialog.close}
        onConfirm={dialog.onConfirm}
        type={dialog.type}
        title={dialog.title}
        message={dialog.message}
        confirmText={dialog.confirmText}
        showCancel={dialog.showCancel}
      />
    </div>
  );
}
