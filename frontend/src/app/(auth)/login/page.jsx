"use client";
import { useEffect, useState } from "react";
import { useAuthStore } from "../../../lib/store";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { User, Lock, Loader2, Smartphone } from "lucide-react";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((state) => state.login);
  const token = useAuthStore((state) => state.token);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const router = useRouter();

  useEffect(() => {
    if (isInitialized && token) {
      router.replace("/dashboard");
    }
  }, [token, isInitialized, router]);

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0b0e14]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login({ identifier, password });
      toast.success("Login successful!");
      router.push("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container animate-fade">
      <div className="login-card animate-slide">
        {/* Left Side: Gradient + Simplified Branding */}
        <div className="login-left relative">
          <div className="circle-decoration"></div>
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
          
          <div className="z-10 animate-slide" style={{ animationDelay: '0.2s' }}>
            <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 md:mb-8 backdrop-blur-md border border-white/30">
                <Smartphone className="text-white" size={32} />
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
              Welcome to <br /> 
              <span className="text-white/90">Testing assistant</span>
            </h1>
          </div>
        </div>

        {/* Right Side: Enhanced Form */}
        <div className="login-right">
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">User Login</h2>
            <p className="text-gray-500 text-sm">Please enter your credentials to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-600 block transition-all">Username</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors">
                  <User size={20} />
                </div>
                <input
                  type="text"
                  placeholder="Enter username"
                  className="input-field-custom"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-600 block transition-all">Password</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors">
                  <Lock size={20} />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="input-field-custom"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between py-2">
              <label className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer hover:text-gray-700 transition-colors">
                <input type="checkbox" className="custom-checkbox" />
                Remember me
              </label>
              <a href="#" className="text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors">Forgot password?</a>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="btn-login flex items-center justify-center gap-2 group"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : "LOGIN"}
              </button>
            </div>
          </form>

          <p className="mt-8 text-center text-sm text-gray-400 font-medium">
            Designed for testing excellence
          </p>
        </div>
      </div>
    </div>
  );
}
