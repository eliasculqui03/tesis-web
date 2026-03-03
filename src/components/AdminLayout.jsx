import { useState, useRef, useEffect } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/hooks/useAuth.js";
import ConfirmDialog from "./ConfirmDialog.jsx";

const menuItems = [
  { 
    label: "Principal", 
    items: [
      { label: "Dashboard", path: "/admin/dashboard", icon: "dashboard" }
    ]
  },
  {
    label: "Configuración",
    items: [
      { label: "Usuarios", path: "/admin/config/usuarios", icon: "users" },
      { label: "Cargos", path: "/admin/config/cargos", icon: "briefcase" },
    ],
  },
];

const icons = {
  dashboard: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  users: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  briefcase: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  logout: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  )
};

export default function AdminLayout() {
  const { logout, user } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleLogout = async () => {
    await logout();
  };

  const getInitials = (name) => {
    if (!name) return "AD";
    return name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
  };

  return (
    <div className="flex min-h-screen bg-gray-50 text-navy font-dm">
      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          onClick={toggleSidebar}
          className="fixed inset-0 bg-navy-deep/60 z-40 lg:hidden backdrop-blur-sm transition-all"
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-navy-deep transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col shadow-2xl`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-white/10">
          <Link to="/admin/dashboard" className="font-jakarta text-2xl font-extrabold text-white tracking-tight">
            JASS<span className="text-gold"> Vituya</span>
          </Link>
          <button onClick={toggleSidebar} className="lg:hidden text-white/60 hover:text-white p-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* User Badge */}
        <div className="px-5 py-6">
          <div className="flex items-center gap-4 px-4 py-3 bg-white/5 rounded-xl border border-white/5 shadow-inner">
            <div className="w-11 h-11 bg-gold/20 rounded-lg flex items-center justify-center border border-gold/30">
               {user?.photo ? (
                 <img src={user.photo} alt={user.name} className="w-full h-full rounded-lg object-cover" />
               ) : (
                 <span className="text-gold font-bold text-sm font-jakarta">{getInitials(user?.name)}</span>
               )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-white truncate font-jakarta">{user?.name || 'Administrador'}</div>
              <div className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-black">Panel de Control</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-2 space-y-8 overflow-y-auto scrollbar-hide">
          {menuItems.map((group) => (
            <div key={group.label} className="space-y-2">
              <div className="px-4 text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">{group.label}</div>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-4 px-4 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${
                      isActive(item.path)
                        ? "bg-gold/15 text-gold border-l-4 border-gold translate-x-1 shadow-[0_0_20px_-5px_rgba(197,165,90,0.2)]"
                        : "text-white/50 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <span className={`${isActive(item.path) ? "text-gold" : "text-white/20"}`}>
                      {icons[item.icon]}
                    </span>
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/10 space-y-2">
           <Link 
            to="/admin/perfil"
            className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Mi Perfil
          </Link>
          <button 
            onClick={() => setIsLogoutModalOpen(true)}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-400/60 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
          >
            {icons.logout}
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:ml-72 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between shadow-sm">
          <button onClick={toggleSidebar} className="p-2 text-navy hover:bg-gray-50 rounded-lg transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-jakarta text-lg font-bold text-navy">JASS Vituya</span>
          <div className="w-9 h-9 bg-navy-deep rounded-lg flex items-center justify-center border border-white/10 shadow-lg shadow-navy/20">
            <span className="text-xs font-black text-white">{getInitials(user?.name)}</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <Outlet />
        </main>
      </div>

      {/* Logout Confirmation */}
      <ConfirmDialog 
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
        title="¿Cerrar Sesión?"
        message="¿Estás seguro de que deseas salir del sistema de gestión JASS Vituya?"
        confirmText="Sí, salir"
        cancelText="Permanecer"
        type="confirm"
      />
    </div>
  );
}
