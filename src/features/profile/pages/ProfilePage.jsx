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
        start_period: profile.start_period ? profile.start_period.split("T")[0] : "",
        end_period: profile.end_period ? profile.end_period.split("T")[0] : "",
        status: profile.status,
      });

      if (profile.photo) setPhotoPreview(profile.photo);
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
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({ ...prev, photo: reader.result }));
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = { ...form, position_id: parseInt(form.position_id) };
      if (!payload.photo) delete payload.photo;
      await profileService.updateProfile(payload);
      dialog.success("¡Perfil actualizado!", "Tus datos se guardaron correctamente.");
      setTimeout(() => window.location.reload(), 1500);
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

  const inputStyles = "w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-navy outline-none focus:outline-none focus:border-gold focus:bg-white transition-all text-sm font-bold shadow-sm";

  if (loading) return <div className="flex items-center justify-center py-20 animate-pulse font-black text-gray-300 text-xs uppercase tracking-widest">Cargando Perfil...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-dm">
      <div>
        <h1 className="font-jakarta text-2xl font-bold text-navy tracking-tight">Mi Perfil</h1>
        <p className="text-gray-500 text-sm font-medium tracking-tight">Actualiza tus datos personales</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm flex flex-col items-center text-center">
            <div className="relative mb-6">
              <div className="w-28 h-28 rounded-2xl bg-navy-deep border-4 border-white shadow-xl overflow-hidden transition-all ring-1 ring-gray-100">
                {photoPreview ? (
                  <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-3xl font-bold">
                    {form.name?.charAt(0)}
                  </div>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="profile-photo" />
              <label htmlFor="profile-photo" className="absolute -bottom-1 -right-1 w-9 h-9 bg-gold text-white rounded-lg flex items-center justify-center shadow-lg border-2 border-white cursor-pointer hover:bg-gold-light transition-all">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </label>
            </div>
            <h2 className="font-jakarta text-lg font-bold text-navy leading-tight">{form.name}</h2>
            <p className="text-[10px] font-black text-gold uppercase tracking-[0.2em] mt-1">{getPositionName()}</p>
          </div>
        </div>

        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-[10px] font-black text-navy/50 uppercase tracking-widest ml-1">Nombre Completo</label>
                <input type="text" name="name" value={form.name} onChange={handleChange} className={inputStyles} required />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-navy/50 uppercase tracking-widest ml-1">Correo Electrónico</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} className={inputStyles} required />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-navy/50 uppercase tracking-widest ml-1">Teléfono Movil</label>
                <input type="tel" name="phone" value={form.phone} onChange={handleChange} maxLength={9} className={inputStyles} />
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex gap-3">
              <button type="button" onClick={() => navigate(-1)} className="flex-1 px-6 py-2.5 rounded-xl bg-white border border-gray-200 text-navy font-bold text-xs hover:bg-gray-50 transition-all uppercase tracking-widest outline-none">
                Regresar
              </button>
              <button type="submit" disabled={saving} className="flex-1 px-6 py-2.5 rounded-xl bg-navy text-white font-bold text-xs hover:bg-navy-light transition-all shadow-lg shadow-navy/10 disabled:opacity-50 uppercase tracking-widest outline-none">
                {saving ? "Procesando..." : "Actualizar"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <ConfirmDialog isOpen={dialog.isOpen} onClose={dialog.close} onConfirm={dialog.onConfirm} type={dialog.type} title={dialog.title} message={dialog.message} confirmText={dialog.confirmText} showCancel={dialog.showCancel} />
    </div>
  );
}
