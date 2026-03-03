import { useState, useEffect, useRef } from "react";
import { userService } from "../../../api/userService.js";
import { positionService } from "../../../api/positionService.js";

export default function UserModal({ isOpen, onClose, onSuccess, userId }) {
  const [form, setForm] = useState({
    name: "",
    document_type: "DNI",
    document_number: "",
    password: "",
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const isEdit = !!userId;

  useEffect(() => {
    if (isOpen) {
      loadPositions();
      if (userId) {
        loadUser();
      } else {
        resetForm();
      }
    }
  }, [isOpen, userId]);

  const resetForm = () => {
    setForm({
      name: "",
      document_type: "DNI",
      document_number: "",
      password: "",
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
    setPhotoPreview("");
    setError("");
  };

  const loadPositions = async () => {
    try {
      const response = await positionService.getAll("");
      setPositions(response.data || []);
    } catch (err) {
      console.error("Error loading positions:", err);
    }
  };

  const loadUser = async () => {
    setLoading(true);
    try {
      const data = await userService.getById(userId);
      setForm({
        name: data.name || "",
        document_type: data.document_type || "DNI",
        document_number: data.document_number || "",
        password: "",
        email: data.email || "",
        birthdate: data.birthdate ? data.birthdate.split("T")[0] : "",
        photo: "", 
        phone: data.phone || "",
        address: data.address || "",
        position_id: data.position_id || "",
        start_period: data.start_period ? data.start_period.split("T")[0] : "",
        end_period: data.end_period ? data.end_period.split("T")[0] : "",
        status: data.status,
      });
      if (data.photo) setPhotoPreview(data.photo);
    } catch (err) {
      setError(err || "Error al cargar usuario");
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
    setLoading(true);
    setError("");
    try {
      const payload = { ...form, position_id: parseInt(form.position_id) };
      if (isEdit && !payload.password) delete payload.password;
      if (isEdit && !payload.photo) delete payload.photo;

      if (isEdit) {
        await userService.update({ id: userId, ...payload });
      } else {
        await userService.create(payload);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err || "Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 font-dm">
      <div className="absolute inset-0 bg-navy-deep/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[95vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="font-jakarta text-lg font-bold text-navy">
            {isEdit ? "Editar Usuario" : "Nuevo Usuario"}
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-navy hover:bg-white rounded-lg transition-all outline-none">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-bold flex items-center gap-3">
               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
               {error}
            </div>
          )}

          <form id="user-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center gap-6 p-5 bg-gray-50 rounded-xl border border-gray-200/50">
                <div className="relative">
                  <div className="w-24 h-24 rounded-2xl bg-white border-2 border-white shadow-lg overflow-hidden transition-all ring-1 ring-gray-100">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="photo-input" />
                  <label htmlFor="photo-input" className="absolute -bottom-2 -right-2 w-10 h-10 bg-gold text-white rounded-xl flex items-center justify-center shadow-xl cursor-pointer hover:bg-gold-light transition-all border-4 border-white active:scale-90">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </label>
                </div>
                <div>
                  <p className="font-bold text-navy text-sm font-jakarta">Fotografía</p>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-0.5">JPEG o PNG, max 2MB</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {[
                { label: 'Nombre Completo', name: 'name', type: 'text', required: true, colSpan: 'sm:col-span-2' },
                { label: 'Tipo Doc.', name: 'document_type', type: 'select', options: ['DNI', 'CE', 'RUC'] },
                { label: 'Número Doc.', name: 'document_number', type: 'text', required: true },
                { label: 'Correo Electrónico', name: 'email', type: 'email', required: true },
                { label: 'Teléfono', name: 'phone', type: 'tel', maxLength: 9 },
                { label: 'Cargo en Sistema', name: 'position_id', type: 'select', isPositions: true, required: true },
                { label: isEdit ? 'Nueva Contraseña (Opcional)' : 'Contraseña', name: 'password', type: 'password', required: !isEdit }
              ].map((field) => (
                <div key={field.name} className={`space-y-1.5 ${field.colSpan || ''}`}>
                  <label className="text-[10px] font-black text-navy/50 uppercase tracking-widest ml-1">{field.label}</label>
                  {field.type === 'select' ? (
                    <select
                      name={field.name}
                      value={form[field.name]}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-navy outline-none focus:outline-none focus:border-gold focus:bg-white transition-all text-sm font-bold cursor-pointer shadow-sm"
                      required={field.required}
                    >
                      {field.isPositions ? (
                        <>
                          <option value="">Seleccionar...</option>
                          {positions.map((pos) => <option key={pos.id} value={pos.id}>{pos.name_position}</option>)}
                        </>
                      ) : (
                        field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)
                      )}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      name={field.name}
                      value={form[field.name]}
                      onChange={handleChange}
                      maxLength={field.maxLength}
                      placeholder={field.type === 'password' ? '••••••••' : ''}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-navy outline-none focus:outline-none focus:border-gold focus:bg-white transition-all text-sm font-bold shadow-sm"
                      required={field.required}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 px-1 pt-2">
              <input type="checkbox" id="status" name="status" checked={form.status} onChange={handleChange} className="w-4 h-4 rounded border-gray-300 text-gold outline-none focus:ring-0 cursor-pointer" />
              <label htmlFor="status" className="text-xs font-bold text-navy/60 select-none cursor-pointer">Habilitar acceso inmediato al sistema</label>
            </div>
          </form>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 bg-white flex gap-3 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)]">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-3 rounded-xl bg-white border border-gray-200 text-navy font-bold text-xs hover:bg-gray-50 transition-all uppercase tracking-widest outline-none">
            Cancelar
          </button>
          <button form="user-form" type="submit" disabled={loading} className="flex-1 px-4 py-3 rounded-xl bg-navy text-white font-bold text-xs hover:bg-navy-light transition-all shadow-lg shadow-navy/10 disabled:opacity-50 uppercase tracking-widest outline-none">
            {loading ? "Guardando..." : "Guardar Registro"}
          </button>
        </div>
      </div>
    </div>
  );
}
