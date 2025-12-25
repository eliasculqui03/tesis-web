import { useAuth } from "../../auth/hooks/useAuth";

export default function DashboardPage() {
  const { logout, user } = useAuth();

  return (
    <div className="min-h-screen bg-primary-50">
      <header className="bg-white shadow-sm border-b border-primary-100 px-6 py-4 flex justify-between items-center">
        <span className="font-semibold text-primary-700">JASS Vituya</span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-primary-600">
            Hola, {user?.name?.split(" ")[0]}
          </span>
          <button
            onClick={logout}
            className="px-4 py-2 text-sm rounded-lg bg-primary-500 text-white hover:bg-primary-600"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-primary-800 mb-6">Dashboard</h1>
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <h2 className="text-xl font-semibold text-primary-700">
            ¡Bienvenido!
          </h2>
          <p className="text-primary-500">Has iniciado sesión correctamente.</p>
        </div>
      </main>
    </div>
  );
}
