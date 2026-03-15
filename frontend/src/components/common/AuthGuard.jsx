"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../lib/store";

export default function AuthGuard({ children }) {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!isInitialized) return;

    if (!token) {
      router.replace("/login");
    } else {
      setIsAuthorized(true);
    }
  }, [token, isInitialized, router]);

  if (!isInitialized || !isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0b0e14]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Verifying session...</p>
        </div>
      </div>
    );
  }

  return children;
}
