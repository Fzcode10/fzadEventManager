import React, { useState, useEffect } from "react";
import Signupform from "../components/visitor/fullForm";

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
    <div className="min-h-screen bg-linear-to-br from-indigo-50 to-blue-100 flex flex-col items-center p-6">
      
      {/* Progress Indicator */}
      <div className="w-full max-w-md mt-10 mb-12">
        <div className="flex items-center justify-center space-x-4">

          {/* Step 1 */}
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all duration-500 shadow-lg ${
              !otpSent
                ? "bg-indigo-600 text-white ring-4 ring-indigo-100"
                : "bg-green-500 text-white"
            }`}
          >
            {!otpSent ? "1" : "✓"}
          </div>

          {/* Connector */}
          <div className="w-20 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full bg-indigo-600 transition-all duration-700 ${
                otpSent ? "w-full" : "w-0"
              }`}
            ></div>
          </div>

          {/* Step 2 */}
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all duration-500 shadow-lg ${
              otpSent
                ? "bg-indigo-600 text-white ring-4 ring-indigo-100"
                : "bg-white text-gray-400 border-2 border-gray-200"
            }`}
          >
            2
          </div>
        </div>

        {/* Labels */}
        <div className="flex justify-between mt-3 px-2">
          <span
            className={`text-xs font-bold uppercase tracking-tighter ${
              !otpSent ? "text-indigo-600" : "text-green-600"
            }`}
          >
            Verify Email
          </span>
          <span
            className={`text-xs font-bold uppercase tracking-tighter ${
              otpSent ? "text-indigo-600" : "text-gray-400"
            }`}
          >
            Full Profile
          </span>
        </div>
      </div>

      {/* Step 1 Email Form */}
      {!otpSent ? (
        <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-300">
          <div className="bg-white shadow-2xl rounded-3xl p-10 border border-white/50 backdrop-blur-sm">

            <div className="text-center mb-8">
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                Welcome!
              </h1>
              <p className="text-gray-500 mt-2">
                Enter your email to get started with your registration.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                  Email Address
                </label>

                <input
                  type="email"
                  placeholder="name@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-200 text-gray-800"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 hover:shadow-xl transform hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200"
              >
                Send OTP
              </button>

              {error && (
                <div className="mt-4 flex items-start gap-3 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl shadow-sm">
                  <div className="text-red-500 shrink-0 mt-0.5">
                    ⚠️
                  </div>

                  <div>
                    <p className="text-sm font-bold text-red-800 mb-1">
                      Action Required
                    </p>
                    <p className="text-xs text-red-600 font-medium">
                      {error}
                    </p>
                  </div>
                </div>
              )}
            </form>
          </div>

          <p className="text-center text-xs text-gray-400 mt-8 uppercase tracking-widest font-medium">
            Secured Student Portal System
          </p>
        </div>
      ) : (
        /* Step 2 Full Form */
        <div className="w-full flex justify-center animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
          <Signupform email={email} />
        </div>
      )}
    </div>
  );
};

export default Signup;