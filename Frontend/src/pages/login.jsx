import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, LogIn, Calendar, ShieldCheck, Sparkles } from "lucide-react";
import { useLogin } from "../hooks/useLogin";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const { login, error, loading, setError } = useLogin();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(formData.email, formData.password);
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 20000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-slate-950 text-slate-100 font-sans">
      
      {/* Left side: Premium Branding/Illustration (hidden on mobile/tablet) */}
      <div className="hidden lg:flex lg:col-span-7 bg-slate-900 flex-col justify-between p-12 relative overflow-hidden border-r border-slate-800/60">
        
        {/* Glow meshes */}
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-violet-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-cyan-600/10 rounded-full blur-[120px]" />

        <div className="flex items-center gap-2 z-10">
          <div className="bg-gradient-accent p-2 rounded-xl shadow-[0_0_15px_rgba(139,92,246,0.3)]">
            <svg 
              className="w-5 h-5 text-white" 
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <span className="text-xl font-black text-white tracking-tight">
            FzAd<span className="text-gradient">Events</span>
          </span>
        </div>

        <div className="my-auto space-y-8 z-10 max-w-lg">
          <div className="space-y-4">
            <span className="px-3 py-1 bg-violet-500/10 border border-violet-500/30 text-violet-400 text-xs font-black tracking-widest uppercase rounded-full w-fit flex items-center gap-1.5 shadow-[inset_0_0_10px_rgba(139,92,246,0.15)]">
              <Sparkles size={12} /> Unified Event Portal
            </span>
            <h2 className="text-5xl font-extrabold text-white leading-tight">
              Manage Events & Credentials <span className="text-gradient">Seamlessly</span>.
            </h2>
            <p className="text-slate-400 text-lg font-medium leading-relaxed">
              Explore upcoming campus seminars, manage host requests, and handle security check-ins with secure digital entry passes.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 bg-slate-950/40 border border-slate-800/50 rounded-2xl">
              <div className="text-violet-400 mb-2"><Calendar size={20} /></div>
              <h4 className="font-bold text-white mb-1">Campus Hub</h4>
              <p className="text-xs text-slate-500">Easily organize, RSVP, and browse university workshops.</p>
            </div>
            <div className="p-5 bg-slate-950/40 border border-slate-800/50 rounded-2xl">
              <div className="text-cyan-400 mb-2"><ShieldCheck size={20} /></div>
              <h4 className="font-bold text-white mb-1">Secure Tracking</h4>
              <p className="text-xs text-slate-500">Live QR terminal checks to keep campus environments safe.</p>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-600 z-10">
          © 2026 FzAdEvents Security & Management System. All Rights Reserved.
        </div>
      </div>

      {/* Right side: Login Form */}
      <div className="lg:col-span-5 flex flex-col justify-center items-center p-6 md:p-12 relative overflow-hidden">
        {/* Glow mesh background (primarily for mobile when left side is hidden) */}
        <div className="absolute top-[20%] right-[-10%] w-[300px] h-[300px] bg-cyan-600/10 rounded-full blur-[100px] lg:hidden" />
        <div className="absolute bottom-[20%] left-[-10%] w-[300px] h-[300px] bg-violet-600/10 rounded-full blur-[100px] lg:hidden" />

        <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800/60 rounded-3xl p-8 shadow-2xl relative z-10">
          <div className="text-center mb-8">
            {/* Mobile-only logo */}
            <div className="flex items-center justify-center gap-2 mb-4 lg:hidden">
              <div className="bg-gradient-accent p-2 rounded-xl">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span className="text-lg font-black text-white tracking-tight">FzAdEvents</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Sign In</h1>
            <p className="text-slate-400 mt-2 text-sm">
              Enter your credentials to access your account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="flex items-center bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-violet-500/50 focus-within:border-violet-500 transition-all">
                <Mail size={18} className="text-slate-500 mr-3 shrink-0" />
                <input
                  type="email"
                  name="email"
                  placeholder="name@university.edu"
                  required
                  onChange={handleChange}
                  className="w-full bg-transparent outline-none text-white text-sm placeholder:text-slate-600"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Password
                </label>
                <a href="#" className="text-xs text-cyan-400 hover:text-cyan-300 hover:underline">
                  Forgot Password?
                </a>
              </div>
              <div className="flex items-center bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-violet-500/50 focus-within:border-violet-500 transition-all">
                <Lock size={18} className="text-slate-500 mr-3 shrink-0" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  required
                  onChange={handleChange}
                  className="w-full bg-transparent outline-none text-white text-sm placeholder:text-slate-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="ml-2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center bg-gradient-accent text-white py-3.5 rounded-xl font-bold shadow-lg shadow-violet-500/10 hover:shadow-cyan-500/10 hover:-translate-y-0.5 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogIn size={20} className="mr-2" />
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          {/* Signup link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-400">
              Don't have an account?{" "}
              <Link to="/signup" className="text-cyan-400 hover:text-cyan-300 hover:underline font-semibold">
                Create an account
              </Link>
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mt-6 bg-red-950/20 border border-red-900/40 text-red-400 px-4 py-3 rounded-2xl text-xs space-y-1 animate-fadeIn badge-glow-danger">
              <p className="font-extrabold uppercase tracking-wide">Action Required</p>
              <p className="text-red-300 font-medium">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
