import React, { useState, useEffect } from "react";
import Signupform from "../components/visitor/fullForm";
import { Mail, Sparkles, Send } from "lucide-react";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    try {
      const res = await fetch("/api/visitor/sendotp", {
        method: "POST",
        body: JSON.stringify({ email }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const json = await res.json();

      console.log(json);

      if (!res.ok) {
        throw Error(json.error || "Failed to send OTP");
      }

      setOtpSent(true); // move to next step
    } catch (error) {
      setError(error.message);
    }
  };

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 13000);

      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center p-6 relative overflow-hidden font-sans">
      
      {/* Decorative backdrop glow */}
      <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-violet-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-1/3 w-[300px] h-[300px] bg-cyan-600/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Progress Indicator */}
      <div className="w-full max-w-md mt-10 mb-12 relative z-10">
        <div className="flex items-center justify-center space-x-4">

          {/* Step 1 */}
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold transition-all duration-500 shadow-lg ${
              !otpSent
                ? "bg-gradient-accent text-white ring-4 ring-violet-500/20"
                : "bg-emerald-500 text-white"
            }`}
          >
            {!otpSent ? "1" : "✓"}
          </div>

          {/* Connector */}
          <div className="w-20 h-1 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-accent transition-all duration-700 ${
                otpSent ? "w-full" : "w-0"
              }`}
            ></div>
          </div>

          {/* Step 2 */}
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold transition-all duration-500 shadow-lg ${
              otpSent
                ? "bg-gradient-accent text-white ring-4 ring-violet-500/20"
                : "bg-slate-900 text-slate-500 border border-slate-800"
            }`}
          >
            2
          </div>
        </div>

        {/* Labels */}
        <div className="flex justify-between mt-3 px-2">
          <span
            className={`text-xs font-bold uppercase tracking-wider ${
              !otpSent ? "text-violet-400" : "text-emerald-400"
            }`}
          >
            Verify Email
          </span>
          <span
            className={`text-xs font-bold uppercase tracking-wider ${
              otpSent ? "text-cyan-400" : "text-slate-650"
            }`}
          >
            Full Profile
          </span>
        </div>
      </div>

      {/* Step 1 Email Form */}
      {!otpSent ? (
        <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-300 relative z-10">
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/60 rounded-3xl p-8 shadow-2xl">

            <div className="text-center mb-8">
              <span className="px-3 py-1 bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[10px] font-black tracking-widest uppercase rounded-full w-fit mx-auto flex items-center gap-1.5 mb-4">
                <Sparkles size={10} /> Secure Onboarding
              </span>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                Welcome!
              </h1>
              <p className="text-slate-450 mt-2 text-sm leading-relaxed">
                Enter your email address to initiate the verification process.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                  Email Address
                </label>
                <div className="flex items-center bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-violet-500/50 focus-within:border-violet-500 transition-all">
                  <Mail size={18} className="text-slate-500 mr-3 shrink-0" />
                  <input
                    type="email"
                    placeholder="name@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-transparent outline-none text-white text-sm placeholder:text-slate-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-accent text-white py-3.5 rounded-xl font-bold hover:shadow-lg hover:shadow-violet-500/10 transition-all hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <Send size={16} /> Send OTP
              </button>

              {error && (
                <div className="mt-4 flex items-start gap-3 p-4 bg-red-950/20 border border-red-900/40 rounded-2xl shadow-sm animate-fadeIn">
                  <div className="text-red-400 shrink-0 mt-0.5">⚠️</div>
                  <div>
                    <p className="text-sm font-extrabold text-red-400 uppercase tracking-wide">
                      Action Required
                    </p>
                    <p className="text-xs text-red-300 font-medium mt-0.5">
                      {error}
                    </p>
                  </div>
                </div>
              )}
            </form>
          </div>

          <p className="text-center text-[10px] text-slate-600 mt-8 uppercase tracking-widest font-black">
            Secured Student Portal System
          </p>
        </div>
      ) : (
        /* Step 2 Full Form */
        <div className="w-full flex justify-center animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out relative z-10">
          <Signupform email={email} />
        </div>
      )}
    </div>
  );
};

export default Signup;