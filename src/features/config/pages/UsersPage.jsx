import { useState } from "react";
import { useUsers } from "../hooks/useUsers";
import { useConfirm } from "../../../hooks/useConfirm";
import UserModal from "../components/UserModal";
import PasswordModal from "../components/PasswordModal";
import ConfirmDialog from "../../../components/ConfirmDialog";

export default function UsersPage() {
  const {
    users,
    loading,
    error,
    pagination,
    fetchUsers,
    toggleStatus,
    changePassword,
  } = useUsers();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [passwordModal, setPasswordModal] = useState({ open: false, userId: null, userName: "" });
  const dialog = useConfirm();

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers(1, search);
  };

  const handlePageChange = (newPage) => {
    fetchUsers(newPage, search);
  };

  const openCreate = () => {
    setEditId(null);
    setModalOpen(true);
  };

  const openEdit = (id) => {
    setEditId(id);
    setModalOpen(true);
  };

  const openPasswordModal = (user) => {
    setPasswordModal({ open: true, userId: user.id, userName: user.name });
  };

  const handleModalSuccess = () => {
    fetchUsers(pagination.page, search);
    dialog.success("¡Operación Exitosa!", "Los datos del usuario se han actualizado correctamente.");
  };

  const handleToggleStatus = (user) => {
    dialog.confirm(
      "¿Cambiar estado?",
      `El usuario "${user.name}" será ${user.status ? "desactivado" : "activado"}.`,
      async () => {
        const success = await toggleStatus(user.id);
        if (success) {
          dialog.success("¡Actualizado!", "El estado se cambió correctamente.");
        } else {
          dialog.error("¡Algo salió mal!", "No se pudo cambiar el estado del usuario. Inténtalo de nuevo.");
        }
      }
    );
  };

  const handleChangePassword = async (newPassword) => {
    const success = await changePassword(passwordModal.userId, newPassword);
    if (success) {
      dialog.success("¡Contraseña actualizada!", "La contraseña se cambió correctamente.");
    } else {
      dialog.error("¡Error de actualización!", "Hubo un problema al cambiar la contraseña.");
    }
    return success;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("es-PE");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-jakarta text-2xl font-bold text-navy tracking-tight">Usuarios</h1>
          <p className="text-gray-500 text-sm font-medium tracking-tight">Gestión integral del personal</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-navy text-white font-bold hover:bg-navy-light transition-all shadow-lg shadow-navy/10 text-sm font-jakarta"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Usuario
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
        <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-gold transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, DNI o correo..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-navy outline-none focus:outline-none focus:border-gold focus:bg-white transition-all text-sm font-bold shadow-sm"
            />
          </div>
          <button type="submit" className="px-6 py-2.5 rounded-xl bg-gold text-white font-bold text-xs font-jakarta hover:bg-gold-light transition-all shadow-sm">
            Filtrar Resultados
          </button>
        </form>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="text-left px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Usuario</th>
                <th className="text-left px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Documento</th>
                <th className="text-left px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Período</th>
                <th className="text-left px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Estado</th>
                <th className="text-right px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-300 font-black text-xs uppercase tracking-widest animate-pulse">Cargando datos...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400 text-sm">No se encontraron registros</td></tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-all group">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                           <img
                             src={user.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=1B2A4A&color=fff`}
                             alt={user.name}
                             className="w-full h-full object-cover"
                           />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-navy font-jakarta">{user.name}</p>
                          <p className="text-[10px] text-gray-400 font-bold tracking-tight">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs font-bold text-navy-muted">{user.document_type}: {user.document_number}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] font-bold text-navy-muted bg-gray-100 px-2 py-1 rounded-lg">
                        {formatDate(user.start_period)} - {formatDate(user.end_period)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleStatus(user)}
                        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                          user.status
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-red-50 text-red-500"
                        }`}
                      >
                        <span className={`w-1 h-1 rounded-full ${user.status ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
                        {user.status ? "Activo" : "Inactivo"}
                      </button>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openPasswordModal(user)}
                          className="p-2 rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-all shadow-sm"
                          title="Cambiar contraseña"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => openEdit(user.id)}
                          className="p-2 rounded-lg text-gray-400 hover:bg-gold/10 hover:text-gold transition-all shadow-sm"
                          title="Editar Perfil"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.lastPage > 1 && (
          <div className="flex items-center justify-between px-6 py-4 bg-gray-50/50 border-t border-gray-100">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Total: <span className="text-navy">{pagination.total}</span> usuarios
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="p-1.5 rounded-lg border border-gray-200 text-navy hover:bg-white disabled:opacity-30 transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="bg-white px-3 py-1.5 rounded-lg border border-gray-200 text-[10px] font-black text-navy">
                {pagination.page} / {pagination.lastPage}
              </div>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.lastPage}
                className="p-1.5 rounded-lg border border-gray-200 text-navy hover:bg-white disabled:opacity-30 transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      <UserModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSuccess={handleModalSuccess} userId={editId} />
      <PasswordModal isOpen={passwordModal.open} onClose={() => setPasswordModal({ open: false, userId: null, userName: "" })} onConfirm={handleChangePassword} userName={passwordModal.userName} />
      <ConfirmDialog isOpen={dialog.isOpen} onClose={dialog.close} onConfirm={dialog.onConfirm} type={dialog.type} title={dialog.title} message={dialog.message} confirmText={dialog.confirmText} cancelText={dialog.cancelText} showCancel={dialog.showCancel} autoClose={dialog.autoClose} />
    </div>
  );
}
