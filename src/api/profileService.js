import { apiClient, getUser } from "./apiClient.js";

export const profileService = {
  getProfile: async () => {
    const user = getUser();
    if (!user?.id) throw new Error("Usuario no encontrado");

    const { data } = await apiClient.post("/detail-user", { id: user.id });
    return data.data;
  },

  updateProfile: async (payload) => {
    const user = getUser();
    if (!user?.id) throw new Error("Usuario no encontrado");

    const { data } = await apiClient.post("/update-user", {
      id: user.id,
      ...payload,
      status: payload.status ? 1 : 0,
    });

    // Actualizar datos en localStorage
    if (data.status === 200) {
      const currentUser = getUser();
      const updatedUser = {
        ...currentUser,
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        address: payload.address,
        photo: payload.photo || currentUser.photo,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }

    return data;
  },

  changePassword: async (newPassword) => {
    const user = getUser();
    if (!user?.id) throw new Error("Usuario no encontrado");

    const { data } = await apiClient.post("/change-password", {
      id: user.id,
      new_password: newPassword,
    });
    return data;
  },
};
