import LoginForm from "../components/LoginForm.jsx";
import bgVituya from "../../../assets/vituya-fondo.png";

export default function LoginPage() {
  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      {/* Imagen de fondo original */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${bgVituya})` }}
      />
      {/* Capa de oscurecimiento estilo Navy */}
      <div className="absolute inset-0 bg-navy-deep/80 backdrop-blur-[2px]" />

      <div className="relative w-full max-w-105">
        {/* Title Section */}
        <div className="text-center mb-8">
          <h1 className="font-jakarta text-3xl font-extrabold text-white tracking-tight">
            JASS<span className="text-gold"> Vituya</span>
          </h1>
          <p className="text-white/50 mt-1.5 text-sm font-medium">
            Gestión de Calidad del Agua
          </p>
        </div>

        <div className="bg-navy-deep/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <LoginForm />
        </div>

        <p className="text-center text-white/30 text-[11px] mt-8 font-bold uppercase tracking-widest">
          &copy; 2025 JASS Vituya. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}
