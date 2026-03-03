import { useState } from "react";

export default function PasswordModal({
  isOpen,
  onClose,
  onConfirm,
  userName,
}) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    const success = await onConfirm(password);
    setLoading(false);

    if (success) {
      setPassword("");
      setConfirmPassword("");
      onClose();
    }
  };

  const handleClose = () => {
    setPassword("");
    setConfirmPassword("");
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy-deep/70 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h2 className="font-jakarta text-lg font-bold text-navy">
              Cambiar Contraseña
            </h2>
          </div>
          <button onClick={handleClose} className="p-2 text-gray-400 hover:text-navy hover:bg-white rounded-lg transition-all outline-none">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="p-4 bg-navy/5 rounded-xl border border-navy/10 flex items-center gap-3">
             <div className="w-10 h-10 bg-gold/20 rounded-lg flex items-center justify-center text-gold">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
             </div>
             <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Usuario</p>
                <p className="text-sm font-bold text-navy tracking-tight">{userName}</p>
             </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-bold flex items-center gap-3">
               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
               {error}
            </div>
          )}

          <form id="password-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-navy/50 uppercase tracking-widest ml-1">Nueva Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-navy outline-none focus:outline-none focus:border-gold focus:bg-white transition-all text-sm font-bold shadow-sm"
                placeholder="Mínimo 6 caracteres"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-navy/50 uppercase tracking-widest ml-1">Confirmar Contraseña</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-navy outline-none focus:outline-none focus:border-gold focus:bg-white transition-all text-sm font-bold shadow-sm"
                placeholder="Repite la contraseña"
                required
              />
            </div>
          </form>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 bg-white flex gap-3">
          <button type="button" onClick={handleClose} className="flex-1 px-4 py-3 rounded-xl bg-white border border-gray-200 text-navy font-bold text-xs hover:bg-gray-50 transition-all uppercase tracking-widest outline-none">
            Cancelar
          </button>
          <button form="password-form" type="submit" disabled={loading} className="flex-1 px-4 py-3 rounded-xl bg-navy text-white font-bold text-xs hover:bg-navy-light transition-all shadow-lg shadow-navy/10 disabled:opacity-50 uppercase tracking-widest outline-none">
            {loading ? "Cambiando..." : "Actualizar"}
          </button>
        </div>
      </div>
    </div>
  );
}
