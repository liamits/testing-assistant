import { create } from "zustand";
import api from "./api";

export const useAuthStore = create((set) => ({
  user: null,
  token: typeof window !== "undefined" ? localStorage.getItem("token") : null,
  isInitialized: false,

  login: async ({ identifier, password }) => {
    const { data } = await api.post("/auth/login", { identifier, password });
    localStorage.setItem("token", data.token);
    set({ user: data.user, token: data.token, isInitialized: true });
    return data;
  },

  register: async ({ name, email, password }) => {
    const { data } = await api.post("/auth/register", { name, email, password });
    localStorage.setItem("token", data.token);
    set({ user: data.user, token: data.token, isInitialized: true });
    return data;
  },

  logout: () => {
    localStorage.removeItem("token");
    set({ user: null, token: null, isInitialized: true });
  },

  fetchMe: async () => {
    try {
      const { data } = await api.get("/auth/me");
      set({ user: data, isInitialized: true });
    } catch {
      localStorage.removeItem("token");
      set({ user: null, token: null, isInitialized: true });
    }
  },
}));
