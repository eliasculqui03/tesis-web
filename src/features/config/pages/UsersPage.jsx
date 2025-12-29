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
  const [passwordModal, setPasswordModal] = useState({
    open: false,
    userId: null,
    userName: "",
  });
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
    dialog.success("¡Guardado!", "El usuario se guardó correctamente.");
  };

  const handleToggleStatus = (user) => {
    dialog.confirm(
      "¿Cambiar estado?",
      `El usuario "${user.name}" será ${
        user.status ? "desactivado" : "activado"
      }.`,
      async () => {
        const success = await toggleStatus(user.id);
        if (success) {
          dialog.success("¡Actualizado!", "El estado se cambió correctamente.");
        }
      }
    );
  };

  const handleChangePassword = async (newPassword) => {
    const success = await changePassword(passwordModal.userId, newPassword);
    if (success) {
      dialog.success(
        "¡Contraseña actualizada!",
        "La contraseña se cambió correctamente."
      );
    }
    return success;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("es-PE");
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Usuarios
          </h1>
          <p className="text-gray-500 text-sm">
            Gestión de usuarios del sistema
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-black text-white font-medium hover:bg-gray-800 transition-colors text-sm"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span className="hidden sm:inline">Nuevo Usuario</span>
          <span className="sm:hidden">Nuevo</span>
        </button>
      </div>

      {/* Buscador */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre o documento..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
            />
          </div>
          <button
            type="submit"
            className="px-4 sm:px-6 py-2.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors text-sm"
          >
            Buscar
          </button>
        </div>
      </form>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Desktop Table */}
      <div className="hidden lg:block bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Usuario
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Documento
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Contacto
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Período
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Estado
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-gray-400"
                  >
                    Cargando...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-gray-400"
                  >
                    No hay usuarios registrados
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            user.photo ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              user.name
                            )}&background=000&color=fff`
                          }
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {user.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {user.address}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-900">
                        {user.document_type}: {user.document_number}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-900">{user.email}</p>
                      <p className="text-xs text-gray-500">{user.phone}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-500">
                        {formatDate(user.start_period)} -{" "}
                        {formatDate(user.end_period)}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleStatus(user)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                          user.status
                            ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            user.status ? "bg-emerald-500" : "bg-gray-400"
                          }`}
                        />
                        {user.status ? "Activo" : "Inactivo"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openPasswordModal(user)}
                          className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                          title="Cambiar contraseña"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => openEdit(user.id)}
                          className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                          title="Editar"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                            />
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
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4">
        {loading ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-400">
            Cargando...
          </div>
        ) : users.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-400">
            No hay usuarios registrados
          </div>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              className="bg-white rounded-xl border border-gray-200 p-4"
            >
              <div className="flex items-start gap-3 mb-3">
                <img
                  src={
                    user.photo ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      user.name
                    )}&background=000&color=fff`
                  }
                  alt={user.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {user.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {user.document_type}: {user.document_number}
                  </p>
                </div>
                <button
                  onClick={() => handleToggleStatus(user)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                    user.status
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      user.status ? "bg-emerald-500" : "bg-gray-400"
                    }`}
                  />
                  {user.status ? "Activo" : "Inactivo"}
                </button>
              </div>

              <div className="space-y-1 text-sm text-gray-500 mb-3">
                <p>{user.email}</p>
                <p>{user.phone}</p>
                <p>
                  Período: {formatDate(user.start_period)} -{" "}
                  {formatDate(user.end_period)}
                </p>
              </div>

              <div className="flex gap-2 pt-3 border-t border-gray-100">
                <button
                  onClick={() => openPasswordModal(user)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z"
                    />
                  </svg>
                  Contraseña
                </button>
                <button
                  onClick={() => openEdit(user.id)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-black text-white text-sm"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                    />
                  </svg>
                  Editar
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.lastPage > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-gray-500">
            Mostrando {users.length} de {pagination.total} usuarios
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Anterior
            </button>
            <span className="px-3 py-2 text-sm text-gray-600">
              {pagination.page} / {pagination.lastPage}
            </span>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.lastPage}
              className="px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <UserModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleModalSuccess}
        userId={editId}
      />

      <PasswordModal
        isOpen={passwordModal.open}
        onClose={() =>
          setPasswordModal({ open: false, userId: null, userName: "" })
        }
        onConfirm={handleChangePassword}
        userName={passwordModal.userName}
      />

      <ConfirmDialog
        isOpen={dialog.isOpen}
        onClose={dialog.close}
        onConfirm={dialog.onConfirm}
        type={dialog.type}
        title={dialog.title}
        message={dialog.message}
        confirmText={dialog.confirmText}
        cancelText={dialog.cancelText}
        showCancel={dialog.showCancel}
        autoClose={dialog.autoClose}
      />
    </div>
  );
}
