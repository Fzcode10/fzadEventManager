import React, { useState, useEffect } from "react";
import { Signup } from "../../hooks/useSignup";

const Signupform = ({ email }) => {
  const { signup, error, isLoading } = Signup();

  const [userOtp, setUserOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [signupCompleted, setSignupCompleted] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: email,
    password: "",
    conformPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (localError) setLocalError(null); // Clear error when user types
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleVerifyOtp = async () => {
    if (!userOtp) return;
    setOtpLoading(true);
    try {
      const res = await fetch("/api/visitor/verifyotp", {
        method: "POST",
        body: JSON.stringify({ email, otp: userOtp }),
        headers: { "Content-Type": "application/json" },
      });
      const json = await res.json();
      if (!res.ok) throw Error(json.error);

      setIsOtpVerified(true);
      setLocalError(null);
    } catch (error) {
      setLocalError(error.message);
    }
    setOtpLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.conformPassword) {
      setLocalError("Passwords do not match");
      return;
    }

    await signup(formData);
    
    // We check if the signup hook updated its internal error state
    if (!error) {
      setSignupCompleted(true);
    }
  };

  const inputStyle = "w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none transition-all";

  // SUCCESS VIEW
  if (signupCompleted) {
    return (
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl text-center border border-gray-100">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
          ✓
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Welcome, {formData.name}!</h2>
        <p className="text-gray-500 mt-2">Your account has been created successfully.</p>
        
        <div className="mt-6 p-4 bg-gray-50 rounded-xl text-left border border-gray-100">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Account Details</p>
          <p className="text-sm text-gray-700 mt-1"><strong>Email:</strong> {email}</p>
          <p className="text-sm text-gray-700 mt-1"><strong>Username:</strong> {formData.name}</p>
        </div>

        <button 
          onClick={() => window.location.href = "/login"} // Or your navigation logic
          className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg mt-8 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Email Display */}
      <div>
        <label className="text-xs font-bold text-gray-400 uppercase tracking-wide ml-1">Verified Email</label>
        <div className={`${inputStyle} bg-gray-50 text-gray-500 border-dashed`}>{email}</div>
      </div>

      {/* OTP Section */}
      {!isOtpVerified && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-1">Verify Identity</h2>
          <p className="text-sm text-gray-500 mb-4">Enter the code sent to your inbox.</p>

          <input
            type="text"
            placeholder="6-digit code"
            value={userOtp}
            onChange={(e) => setUserOtp(e.target.value)}
            className={`${inputStyle} text-center text-xl tracking-widest`}
          />

          <button
            onClick={handleVerifyOtp}
            disabled={otpLoading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold p-3 rounded-lg mt-4 transition-colors disabled:opacity-50"
          >
            {otpLoading ? "Verifying..." : "Verify & Continue"}
          </button>
        </div>
      )}

      {/* Signup Form */}
      {isOtpVerified && (
        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Profile Details</h2>

          <input
            type="text"
            name="name"
            placeholder="What should we call you?"
            value={formData.name}
            onChange={handleChange}
            required
            className={inputStyle}
          />

          <input
            type="password"
            name="password"
            placeholder="Create Password"
            value={formData.password}
            onChange={handleChange}
            required
            className={inputStyle}
          />

          <input
            type="password"
            name="conformPassword"
            placeholder="Confirm Password"
            value={formData.conformPassword}
            onChange={handleChange}
            required
            className={inputStyle}
          />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold p-3 rounded-lg mt-2 transition-all disabled:bg-indigo-300 shadow-md"
          >
            {isLoading ? "Syncing with server..." : "Complete Signup"}
          </button>
        </form>
      )}

      {/* ERROR & RETRY VIEW */}
      {(localError || error) && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl shadow-sm animate-pulse">
          <div className="flex items-center gap-2 text-red-700 font-bold text-sm mb-1">
            <span>⚠️</span> Signup Failed
          </div>
          <p className="text-xs text-red-600 leading-relaxed mb-3">
            {localError || error}
          </p>
          <button 
            onClick={() => setLocalError(null)} 
            className="text-xs font-bold text-red-700 underline hover:text-red-800"
          >
            Click here to try again
          </button>
        </div>
      )}
    </div>
  );
};

export default Signupform;