"use client";
import { useEffect } from "react";
import { useAuthStore } from "../../lib/store";

export default function SessionInitializer({ children }) {
  const fetchMe = useAuthStore((state) => state.fetchMe);
  const token = useAuthStore((state) => state.token);
  const setInitialized = useAuthStore.getState().isInitialized;

  useEffect(() => {
    if (token) {
      fetchMe();
    } else {
      // If no token, we are initialized (as null)
      useAuthStore.setState({ isInitialized: true });
    }
  }, [token, fetchMe]);

  return children;
}
