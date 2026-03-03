import { useState, useEffect } from "react";
import { positionService } from "../../../api/positionService.js";

export default function PositionModal({
  isOpen,
  onClose,
  onSuccess,
  positionId,
}) {
  const [form, setForm] = useState({
    name_position: "",
    description: "",
    status: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEdit = !!positionId;

  useEffect(() => {
    if (isOpen && positionId) {
      loadPosition();
    } else if (isOpen) {
      setForm({ name_position: "", description: "", status: true });
      setError("");
    }
  }, [isOpen, positionId]);

  const loadPosition = async () => {
    setLoading(true);
    try {
      const data = await positionService.getById(positionId);
      setForm({
        name_position: data.name_position,
        description: data.description,
        status: data.status,
      });
    } catch (err) {
      setError(err || "Error al cargar cargo");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (isEdit) {
        await positionService.update({ id: positionId, ...form });
      } else {
        await positionService.create(form);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy-deep/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="font-jakarta text-lg font-bold text-navy">
            {isEdit ? "Editar Cargo" : "Nuevo Cargo"}
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-navy hover:bg-white rounded-lg transition-all outline-none">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-bold flex items-center gap-3">
               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
               {error}
            </div>
          )}

          <form id="position-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-navy/50 uppercase tracking-widest ml-1">Nombre del Cargo</label>
              <input 
                type="text" 
                value={form.name_position} 
                onChange={(e) => setForm({ ...form, name_position: e.target.value })} 
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-navy outline-none focus:outline-none focus:border-gold focus:bg-white transition-all text-sm font-bold shadow-sm" 
                placeholder="Ej: Administrador"
                required 
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-navy/50 uppercase tracking-widest ml-1">Descripción</label>
              <textarea 
                value={form.description} 
                onChange={(e) => setForm({ ...form, description: e.target.value })} 
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-navy outline-none focus:outline-none focus:border-gold focus:bg-white transition-all text-sm font-bold shadow-sm resize-none" 
                rows={3}
                placeholder="Breve descripción..."
              />
            </div>

            <div className="flex items-center gap-2 px-1">
              <input 
                type="checkbox" 
                id="pos-status" 
                checked={form.status} 
                onChange={(e) => setForm({ ...form, status: e.target.checked })} 
                className="w-4 h-4 rounded border-gray-200 text-gold outline-none focus:ring-0 cursor-pointer" 
              />
              <label htmlFor="pos-status" className="text-xs font-bold text-navy/60 select-none cursor-pointer">Cargo activo</label>
            </div>
          </form>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 bg-white flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-navy font-bold text-xs hover:bg-gray-50 transition-all uppercase tracking-widest outline-none">
            Cancelar
          </button>
          <button form="position-form" type="submit" disabled={loading} className="flex-1 px-4 py-2.5 rounded-xl bg-navy text-white font-bold text-xs hover:bg-navy-light transition-all shadow-lg shadow-navy/10 disabled:opacity-50 uppercase tracking-widest outline-none">
            {loading ? "Guardando..." : "Guardar Cargo"}
          </button>
        </div>
      </div>
    </div>
  );
}
