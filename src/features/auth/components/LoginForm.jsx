import { useState } from "react";
import { useAuth } from "../hooks/useAuth.js";
import Button from "./Button.jsx";
import Input from "./Input.jsx";

export default function LoginForm() {
  const { login, loading, error } = useAuth();
  const [form, setForm] = useState({ document_number: "", password: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    login(form.document_number, form.password);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20"
    >
      <h2 className="text-xl font-semibold text-white mb-6">Iniciar Sesión</h2>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 text-sm flex items-center gap-2">
          <svg
            className="w-5 h-5 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {error}
        </div>
      )}

      <Input
        label="Número de Documento"
        name="document_number"
        value={form.document_number}
        onChange={(e) => setForm({ ...form, document_number: e.target.value })}
        placeholder="Ingresa tu DNI"
        maxLength={8}
        icon="user"
        required
      />

      <Input
        label="Contraseña"
        name="password"
        type="password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        placeholder="Ingresa tu contraseña"
        icon="lock"
        required
      />

      <Button type="submit" loading={loading}>
        Ingresar
      </Button>
    </form>
  );
}
