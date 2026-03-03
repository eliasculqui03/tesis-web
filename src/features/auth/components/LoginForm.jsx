import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth.js";
import { useConfirm } from "../../../hooks/useConfirm.js";
import ConfirmDialog from "../../../components/ConfirmDialog.jsx";
import Button from "./Button.jsx";

export default function LoginForm() {
  const { login, loading, error } = useAuth();
  const dialog = useConfirm();
  const [form, setForm] = useState({ document_number: "", password: "" });

  useEffect(() => {
    if (error) {
      dialog.error("Error de Acceso", error);
    }
  }, [error]);

  const handleSubmit = (e) => {
    e.preventDefault();
    login(form.document_number, form.password);
  };

  const inputClasses = "w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/30 outline-none focus:outline-none focus:bg-white/20 transition-all duration-200 font-semibold text-sm";
  const labelClasses = "block text-white text-[11px] font-bold uppercase tracking-widest ml-1 mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 font-dm">
      <div>
        <h2 className="text-xl font-bold text-white mb-1 font-jakarta">¡Bienvenido!</h2>
        <p className="text-sm text-white/50 mb-6 font-medium">Accede al panel administrativo</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className={labelClasses}>Número de Documento</label>
          <input
            type="text"
            inputMode="numeric"
            value={form.document_number}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              setForm({ ...form, document_number: val });
            }}
            placeholder="Ingresa tu número de documento"
            maxLength={8}
            className={inputClasses}
            required
          />
        </div>

        <div>
          <label className={labelClasses}>Contraseña</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="Ingresa tu contraseña"
            className={inputClasses}
            required
          />
        </div>
      </div>

      <div className="pt-2">
        <Button type="submit" loading={loading}>
          Iniciar Sesión
        </Button>
      </div>

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
    </form>
  );
}
