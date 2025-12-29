import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { profileService } from "../../../api/profileService.js";
import { positionService } from "../../../api/positionService.js";
import { useConfirm } from "../../../hooks/useConfirm.js";
import ConfirmDialog from "../../../components/ConfirmDialog.jsx";

export default function ProfilePage() {
  const navigate = useNavigate();
  const dialog = useConfirm();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    document_type: "DNI",
    document_number: "",
    email: "",
    birthdate: "",
    photo: "",
    phone: "",
    address: "",
    position_id: "",
    start_period: "",
    end_period: "",
    status: true,
  });
  const [photoPreview, setPhotoPreview] = useState("");
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [profile, positionsRes] = await Promise.all([
        profileService.getProfile(),
        positionService.getAll(""),
      ]);

      setForm({
        name: profile.name || "",
        document_type: profile.document_type || "DNI",
        document_number: profile.document_number || "",
        email: profile.email || "",
        birthdate: profile.birthdate ? profile.birthdate.split("T")[0] : "",
        photo: "",
        phone: profile.phone || "",
        address: profile.address || "",
        position_id: profile.position_id || "",
        start_period: profile.start_period
          ? profile.start_period.split("T")[0]
          : "",
        end_period: profile.end_period ? profile.end_period.split("T")[0] : "",
        status: profile.status,
      });

      if (profile.photo) {
        setPhotoPreview(profile.photo);
      }

      setPositions(positionsRes.data || []);
    } catch (err) {
      setError(err || "Error al cargar perfil");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Por favor selecciona una imagen válida");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("La imagen no debe superar los 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result;
      setForm((prev) => ({ ...prev, photo: base64 }));
      setPhotoPreview(base64);
      setError("");
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setForm((prev) => ({ ...prev, photo: "" }));
    setPhotoPreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = { ...form, position_id: parseInt(form.position_id) };

      // Si no hay foto nueva, no enviarla
      if (!payload.photo) {
        delete payload.photo;
      }

      await profileService.updateProfile(payload);
      dialog.success(
        "¡Perfil actualizado!",
        "Tus datos se guardaron correctamente."
      );

      // Recargar para reflejar cambios en el header
      window.location.reload();
    } catch (err) {
      setError(err || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const getPositionName = () => {
    const position = positions.find((p) => p.id == form.position_id);
    return position?.name_position || "-";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          Mi Perfil
        </h1>
        <p className="text-gray-500 text-sm">
          Actualiza tu información personal
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-gray-200 overflow-hidden"
      >
        {/* Foto */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="relative">
              {photoPreview ? (
                <div className="relative">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full bg-emerald-500 flex items-center justify-center text-white text-2xl font-semibold">
                  {form.name?.charAt(0) || "U"}
                </div>
              )}
            </div>

            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="photo-input"
              />
              <label
                htmlFor="photo-input"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer text-sm"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                  />
                </svg>
                Cambiar foto
              </label>
              <p className="text-xs text-gray-500 mt-1">JPG, PNG. Máximo 2MB</p>
            </div>
          </div>
        </div>

        {/* Info de solo lectura */}
        <div className="p-6 bg-gray-50 border-b border-gray-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Documento</p>
              <p className="font-medium text-gray-900">
                {form.document_type}: {form.document_number}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Cargo</p>
              <p className="font-medium text-gray-900">{getPositionName()}</p>
            </div>
            <div>
              <p className="text-gray-500">Período</p>
              <p className="font-medium text-gray-900">
                {form.start_period || "-"} al {form.end_period || "-"}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Estado</p>
              <span
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                  form.status
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    form.status ? "bg-emerald-500" : "bg-gray-400"
                  }`}
                />
                {form.status ? "Activo" : "Inactivo"}
              </span>
            </div>
          </div>
        </div>

        {/* Campos editables */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre completo
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                maxLength={9}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de nacimiento
            </label>
            <input
              type="date"
              name="birthdate"
              value={form.birthdate}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dirección
            </label>
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-100 bg-gray-50">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-white transition-colors text-sm font-medium"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 px-4 py-2.5 rounded-lg bg-black text-white font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 text-sm"
          >
            {saving ? "Guardando..." : "Guardar cambios"}
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
