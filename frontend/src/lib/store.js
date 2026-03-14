import { create } from "zustand";
import api from "./api";

export const useAuthStore = create((set) => ({
  user: null,
  token: typeof window !== "undefined" ? localStorage.getItem("token") : null,

  login: async ({ identifier, password }) => {
    const { data } = await api.post("/auth/login", { identifier, password });
    localStorage.setItem("token", data.token);
    set({ user: data.user, token: data.token });
    return data;
  },

  register: async ({ name, email, password }) => {
    const { data } = await api.post("/auth/register", { name, email, password });
    localStorage.setItem("token", data.token);
    set({ user: data.user, token: data.token });
    return data;
  },

  logout: () => {
    localStorage.removeItem("token");
    set({ user: null, token: null });
  },

  fetchMe: async () => {
    try {
      const { data } = await api.get("/auth/me");
      set({ user: data });
    } catch {
      set({ user: null, token: null });
    }
  },
}));
