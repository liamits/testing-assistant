import { create } from "zustand";
import api from "./api";

export const useAuthStore = create((set) => ({
  user: null,
  token: typeof window !== "undefined" ? localStorage.getItem("token") : null,
  isInitialized: false,
  systemLanguage: "vi",
  theme: typeof window !== "undefined" ? (localStorage.getItem("theme") || "dark") : "dark",

  toggleTheme: () => {
    set((state) => {
      const newTheme = state.theme === "dark" ? "light" : "dark";
      localStorage.setItem("theme", newTheme);
      return { theme: newTheme };
    });
  },

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

  fetchSettings: async () => {
    try {
      const { data } = await api.get("/settings");
      set({ systemLanguage: data.systemLanguage || "vi" });
      return data;
    } catch (err) {
      console.error("Failed to fetch settings:", err);
    }
  },

  updateSystemLanguage: async (value) => {
    try {
      await api.post("/settings", { key: "systemLanguage", value });
      set({ systemLanguage: value });
      toast.success("Ngôn ngữ hệ thống đã được cập nhật");
    } catch (err) {
      console.error("Failed to update language:", err);
      toast.error("Lỗi khi cập nhật ngôn ngữ");
    }
  },
}));
